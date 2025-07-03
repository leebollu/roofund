const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const Imap = require('imap');
const { inspect } = require('util');
const quotedPrintable = require('quoted-printable');
const utf8 = require('utf8');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// Configure CORS for development and production
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000', 
  'https://id-preview--76b842c5-34fb-4c76-97fb-ad23c3c90c2d.lovable.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Helper function to create IMAP connection
function createImapConnection(credentials) {
  return new Imap({
    user: credentials.email,
    password: credentials.password,
    host: credentials.imapHost,
    port: credentials.imapPort,
    tls: credentials.imapSecurity === 'ssl' || credentials.imapSecurity === 'tls',
    tlsOptions: { 
      rejectUnauthorized: false,
      servername: credentials.imapHost
    },
    connTimeout: 60000,
    authTimeout: 30000,
    keepalive: false
  });
}

// Helper function to parse email headers
function parseHeaders(headers) {
  const parsed = {};
  if (headers.subject && headers.subject.length > 0) {
    parsed.subject = headers.subject[0];
  }
  if (headers.from && headers.from.length > 0) {
    parsed.from = headers.from[0];
  }
  if (headers.date && headers.date.length > 0) {
    parsed.date = headers.date[0];
  }
  return parsed;
}

// Helper function to decode email content
function decodeEmailContent(content, encoding) {
  if (!content) return '';
  
  try {
    if (encoding === 'quoted-printable') {
      return utf8.decode(quotedPrintable.decode(content));
    } else if (encoding === 'base64') {
      return Buffer.from(content, 'base64').toString('utf8');
    }
    return content.toString();
  } catch (error) {
    console.error('Error decoding content:', error);
    return content.toString();
  }
}

// Test IMAP connection endpoint
app.post('/api/email/test-connection', async (req, res) => {
  const { email, password, imapHost, imapPort, imapSecurity } = req.body;

  if (!email || !password || !imapHost || !imapPort) {
    return res.status(400).json({
      success: false,
      error: 'Missing required credentials'
    });
  }

  const imap = createImapConnection({
    email,
    password,
    imapHost,
    imapPort: parseInt(imapPort),
    imapSecurity
  });

  let connectionTimeout;

  try {
    await new Promise((resolve, reject) => {
      connectionTimeout = setTimeout(() => {
        imap.destroy();
        reject(new Error('Connection timeout after 30 seconds'));
      }, 30000);

      imap.once('ready', () => {
        clearTimeout(connectionTimeout);
        console.log('IMAP connection successful for:', email);
        
        // Test opening INBOX
        imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            reject(new Error(`Failed to open INBOX: ${err.message}`));
          } else {
            console.log('INBOX opened successfully, total messages:', box.messages.total);
            imap.end();
            resolve();
          }
        });
      });

      imap.once('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('IMAP connection error:', err);
        reject(new Error(`IMAP connection failed: ${err.message}`));
      });

      imap.connect();
    });

    res.json({
      success: true,
      message: 'Email connection successful'
    });

  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (imap.state !== 'disconnected') {
      imap.destroy();
    }
  }
});

// Fetch latest email endpoint
app.post('/api/email/fetch-latest', async (req, res) => {
  const { email, password, imapHost, imapPort, imapSecurity } = req.body;

  if (!email || !password || !imapHost || !imapPort) {
    return res.status(400).json({
      success: false,
      error: 'Missing required credentials'
    });
  }

  const imap = createImapConnection({
    email,
    password,
    imapHost,
    imapPort: parseInt(imapPort),
    imapSecurity
  });

  let connectionTimeout;

  try {
    const latestEmail = await new Promise((resolve, reject) => {
      connectionTimeout = setTimeout(() => {
        imap.destroy();
        reject(new Error('Connection timeout after 60 seconds'));
      }, 60000);

      imap.once('ready', () => {
        clearTimeout(connectionTimeout);
        
        imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            reject(new Error(`Failed to open INBOX: ${err.message}`));
            return;
          }

          if (box.messages.total === 0) {
            resolve(null);
            return;
          }

          // Search for all messages and get the latest one
          imap.search(['ALL'], (err, results) => {
            if (err) {
              reject(new Error(`Search failed: ${err.message}`));
              return;
            }

            if (!results || results.length === 0) {
              resolve(null);
              return;
            }

            // Get the latest message (highest sequence number)
            const latestSeqNo = Math.max(...results);
            
            const fetch = imap.fetch([latestSeqNo], {
              bodies: ['HEADER', 'TEXT'],
              struct: true
            });

            let emailData = {
              uid: null,
              headers: {},
              body: '',
              structure: null
            };

            fetch.on('message', (msg, seqno) => {
              emailData.uid = seqno;

              msg.on('body', (stream, info) => {
                let buffer = '';
                stream.on('data', (chunk) => {
                  buffer += chunk.toString('ascii');
                });
                
                stream.once('end', () => {
                  if (info.which === 'HEADER') {
                    emailData.headers = Imap.parseHeader(buffer);
                  } else if (info.which === 'TEXT') {
                    emailData.body = buffer;
                  }
                });
              });

              msg.once('attributes', (attrs) => {
                emailData.uid = attrs.uid;
                emailData.structure = attrs.struct;
              });
            });

            fetch.once('error', (err) => {
              reject(new Error(`Fetch failed: ${err.message}`));
            });

            fetch.once('end', () => {
              imap.end();
              
              // Parse the email data
              const parsedHeaders = parseHeaders(emailData.headers);
              
              // Try to get a preview of the email content
              let snippet = 'No preview available';
              if (emailData.body) {
                const bodyText = decodeEmailContent(emailData.body, 'quoted-printable');
                snippet = bodyText.replace(/\s+/g, ' ').trim().substring(0, 150);
                if (snippet.length === 150) snippet += '...';
              }

              const result = {
                uid: emailData.uid,
                subject: parsedHeaders.subject || 'No Subject',
                from: parsedHeaders.from || 'Unknown Sender',
                date: parsedHeaders.date ? new Date(parsedHeaders.date) : new Date(),
                snippet: snippet
              };

              resolve(result);
            });
          });
        });
      });

      imap.once('error', (err) => {
        clearTimeout(connectionTimeout);
        console.error('IMAP fetch error:', err);
        reject(new Error(`IMAP connection failed: ${err.message}`));
      });

      imap.connect();
    });

    if (latestEmail) {
      res.json({
        success: true,
        email: latestEmail
      });
    } else {
      res.json({
        success: true,
        email: null,
        message: 'No emails found in inbox'
      });
    }

  } catch (error) {
    console.error('Fetch latest email failed:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  } finally {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
    }
    if (imap.state !== 'disconnected') {
      imap.destroy();
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email IMAP server running on port ${PORT}`);
  console.log(`📧 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
});

module.exports = app;