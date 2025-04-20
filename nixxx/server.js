const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const initializeSocket = require('./socket');
const os = require('os');

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Initialize Express app
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to the database
connectDB();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary configured with:", process.env.CLOUDINARY_CLOUD_NAME);

// Middleware
const corsOptions = {
  origin: ['http://localhost:3000', 'https://projectnexus-frontend.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/project', require('./routes/project'));
app.use('/api/document', require('./routes/document'));
app.use('/api/admin', require('./routes/admin'));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error-handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Retrieve local IP address
const networkInterfaces = os.networkInterfaces();
const localIpAddresses = Object.values(networkInterfaces)
  .flat()
  .filter(details => details.family === 'IPv4' && !details.internal)
  .map(details => details.address);
const myip = localIpAddresses[0] || 'localhost';
console.log('Local IP addresses:', myip);

// Create HTTP server and initialize socket
const server = http.createServer(app);
initializeSocket(server);

// Define the port
const PORT = process.env.PORT || config.PORT || 5000;

// Start the server with error handling
server.listen(PORT, () => {
  console.log(`Server running at ==> http://${myip}:${PORT}`);
});

// Handle server errors, specifically EADDRINUSE
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port or terminate the process using this port.`);
    process.exit(1);
  } else {
    console.error('Server encountered an error:', err);
    process.exit(1);
  }
});

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed gracefully.');
    process.exit(0);
  });
});
