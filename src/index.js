// utils/db.js
const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '../data.json');

// Create the file if it doesn't exist
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]));

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
