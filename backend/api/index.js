// Vercel serverless entry point
// Prevents app.listen() from firing in the serverless runtime
process.env.NODE_ENV = 'test';

const app = require('../server');

module.exports = app;
