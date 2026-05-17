/**
 * Request Logger Middleware
 * Logs incoming HTTP requests to the console for easier backend monitoring during development.
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  // Track start time
  const start = Date.now();

  // Listen to response finish event to capture duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Choose status color representation (basic logging styles)
    let statusString = status.toString();
    if (status >= 200 && status < 300) {
      statusString = `\x1b[32m${status}\x1b[0m`; // Green for success
    } else if (status >= 300 && status < 400) {
      statusString = `\x1b[36m${status}\x1b[0m`; // Cyan for redirects
    } else if (status >= 400 && status < 500) {
      statusString = `\x1b[33m${status}\x1b[0m`; // Yellow for client errors
    } else {
      statusString = `\x1b[31m${status}\x1b[0m`; // Red for server errors
    }

    console.log(`[${timestamp}] ${method} ${url} - ${statusString} (${duration}ms)`);
  });

  next();
};

module.exports = requestLogger;
