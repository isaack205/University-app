// Imports
const morgan = require('morgan'); // HTTP request logger middleware
const path = require('path'); // Node.js utility for file paths
const fs = require('fs'); // File system module

// Define the path to the project root directory
const projectRoot = process.cwd();

// Create a writable stream for logging access logs to 'access.log' file in append mode
const accessLogStream = fs.createWriteStream(
    path.join(projectRoot, 'access.log'),
    { flags: 'a' }
);

// Define the log format for production (includes date, IP, method, URL, status, etc.)
const prodFormat = ':date[iso] :remote-addr :method :url :status :res[content-length]- :response-time ms ":referrer" ":user-agent"';

// Create the morgan logger using the defined format and stream
const logger = morgan(prodFormat, { stream: accessLogStream });

// Export the logger middleware to be used in the Express app
module.exports = logger;
