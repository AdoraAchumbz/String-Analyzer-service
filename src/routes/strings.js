// src/routes/strings.js
const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../../utils/db');

const router = express.Router();

// POST /strings
router.post('/', (req, res) => {
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'Missing "value" field' });
  if (typeof value !== 'string') return res.status(422).json({ error: '"value" must be a string' });

  const db = readDB();
  if (db.find(s => s.value === value)) return res.status(409).json({ error: 'String already exists' });

  const length = value.length;
  const is_palindrome = value.toLowerCase() === value.toLowerCase().split('').reverse().join('');
  const unique_characters = new Set(value).size;
  const word_count = value.trim().split(/\s+/).length;
  const sha256_hash = crypto.createHash('sha256').update(value).digest('hex');

  const character_frequency_map = {};
  for (const c of value) character_frequency_map[c] = (character_frequency_map[c] || 0) + 1;

  const newString = {
    id: sha256_hash,
    value,
    properties: { length, is_palindrome, unique_characters, word_count, sha256_hash, character_frequency_map },
    created_at: new Date().toISOString()
  };

  db.push(newString);
  writeDB(db);

  res.status(201).json(newString);
});

// GET /strings
router.get('/', (req, res) => {
  let db = readDB();
  const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;

  if (is_palindrome !== undefined) db = db.filter(s => s.properties.is_palindrome === (is_palindrome === 'true'));
  if (min_length) db = db.filter(s => s.properties.length >= parseInt(min_length));
  if (max_length) db = db.filter(s => s.properties.length <= parseInt(max_length));
  if (word_count) db = db.filter(s => s.properties.word_count === parseInt(word_count));
  if (contains_character) db = db.filter(s => s.value.includes(contains_character));

  res.json({ data: db, count: db.length, filters_applied: req.query });
});

// GET /strings/:value
router.get('/:value', (req, res) => {
  const db = readDB();
  const s = db.find(s => s.value === req.params.value);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

// DELETE /strings/:value
router.delete('/:value', (req, res) => {
  let db = readDB();
  const lengthBefore = db.length;
  db = db.filter(s => s.value !== req.params.value);
  if (db.length === lengthBefore) return res.status(404).json({ error: 'Not found' });
  writeDB(db);
  res.status(204).send();
});

module.exports = router;
