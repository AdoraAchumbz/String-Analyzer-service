// src/index.js
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const stringsRouter = require('./routes/strings');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use('/strings', stringsRouter);

app.get('/', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unexpected error', err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`String Analyzer running on port ${port}`));

module.exports = app;
