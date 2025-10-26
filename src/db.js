const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.sqlite');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS strings (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  length INTEGER NOT NULL,
  is_palindrome INTEGER NOT NULL,
  unique_characters INTEGER NOT NULL,
  word_count INTEGER NOT NULL,
  sha256_hash TEXT NOT NULL,
  character_frequency_map TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

const insertStmt = db.prepare(`
INSERT INTO strings (id, value, length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map, created_at)
VALUES (@id, @value, @length, @is_palindrome, @unique_characters, @word_count, @sha256_hash, @character_frequency_map, @created_at)
`);

const getByIdStmt = db.prepare(`SELECT * FROM strings WHERE id = ?`);
const getByValueStmt = db.prepare(`SELECT * FROM strings WHERE value = ?`);
const deleteByIdStmt = db.prepare(`DELETE FROM strings WHERE id = ?`);
const allStmt = db.prepare(`SELECT * FROM strings`);

module.exports = {
  insert(obj) {
    insertStmt.run(obj);
    return obj;
  },
  getById(id) {
    return getByIdStmt.get(id);
  },
  getByValue(value) {
    return getByValueStmt.get(value);
  },
  deleteById(id) {
    return deleteByIdStmt.run(id);
  },
  all() {
    return allStmt.all();
  }
};
