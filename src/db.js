// utils/db.js
const fs = require('fs');
const path = require('path');

// Use process.cwd() so Railway can read/write the file in the root directory
const dbFile = path.join(process.cwd(), 'data.json');

// Create file if it doesn't exist
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]));

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch (err) {
    console.error('Error reading DB', err);
    return [];
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing DB', err);
  }
}

module.exports = { readDB, writeDB };
