const express = require('express');
const router = express.Router();
const db = require('../db');
const { analyze, sha256 } = require('../utils/analyzer');
const { parseNaturalLanguage } = require('../utils/nlparser');

function rowToResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    value: row.value,
    properties: {
      length: row.length,
      is_palindrome: !!row.is_palindrome,
      unique_characters: row.unique_characters,
      word_count: row.word_count,
      sha256_hash: row.sha256_hash,
      character_frequency_map: JSON.parse(row.character_frequency_map)
    },
    created_at: row.created_at
  };
}

router.post('/', (req, res) => {
  const { value } = req.body || {};
  if (value === undefined) return res.status(400).json({ error: 'Missing "value" field' });
  if (typeof value !== 'string') return res.status(422).json({ error: '"value" must be a string' });

  const properties = analyze(value);
  const id = properties.sha256_hash;

  const exists = db.getById(id) || db.getByValue(value);
  if (exists) return res.status(409).json({ error: 'String already exists in the system' });

  const record = {
    id,
    value,
    length: properties.length,
    is_palindrome: properties.is_palindrome ? 1 : 0,
    unique_characters: properties.unique_characters,
    word_count: properties.word_count,
    sha256_hash: properties.sha256_hash,
    character_frequency_map: JSON.stringify(properties.character_frequency_map),
    created_at: new Date().toISOString()
  };

  db.insert(record);
  return res.status(201).json(rowToResponse(record));
});

router.get('/:string_value', (req, res) => {
  const raw = req.params.string_value;
  const value = decodeURIComponent(raw);
  const row = db.getByValue(value);
  if (!row) return res.status(404).json({ error: 'String not found' });
  return res.status(200).json(rowToResponse(row));
});

router.get('/', (req, res) => {
  try {
    const { is_palindrome, min_length, max_length, word_count, contains_character } = req.query;
    let rows = db.all();

    if (is_palindrome !== undefined) {
      if (is_palindrome !== 'true' && is_palindrome !== 'false') {
        return res.status(400).json({ error: 'is_palindrome must be true or false' });
      }
      const wanted = is_palindrome === 'true';
      rows = rows.filter(r => !!r.is_palindrome === wanted);
    }
    if (min_length !== undefined) {
      const n = parseInt(min_length, 10);
      if (Number.isNaN(n)) return res.status(400).json({ error: 'min_length must be an integer' });
      rows = rows.filter(r => r.length >= n);
    }
    if (max_length !== undefined) {
      const n = parseInt(max_length, 10);
      if (Number.isNaN(n)) return res.status(400).json({ error: 'max_length must be an integer' });
      rows = rows.filter(r => r.length <= n);
    }
    if (word_count !== undefined) {
      const n = parseInt(word_count, 10);
      if (Number.isNaN(n)) return res.status(400).json({ error: 'word_count must be an integer' });
      rows = rows.filter(r => r.word_count === n);
    }
    if (contains_character !== undefined) {
      if (typeof contains_character !== 'string' || contains_character.length !== 1) {
        return res.status(400).json({ error: 'contains_character must be a single character' });
      }
      const ch = contains_character;
      rows = rows.filter(r => {
        const freq = JSON.parse(r.character_frequency_map);
        return Object.prototype.hasOwnProperty.call(freq, ch);
      });
    }

    const out = rows.map(rowToResponse);
    return res.status(200).json({
      data: out,
      count: out.length,
      filters_applied: {
        is_palindrome: is_palindrome === undefined ? undefined : (is_palindrome === 'true'),
        min_length: min_length === undefined ? undefined : parseInt(min_length, 10),
        max_length: max_length === undefined ? undefined : parseInt(max_length, 10),
        word_count: word_count === undefined ? undefined : parseInt(word_count, 10),
        contains_character: contains_character === undefined ? undefined : contains_character
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/filter-by-natural-language', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query parameter' });
  let parsed;
  try {
    parsed = parseNaturalLanguage(decodeURIComponent(query));
  } catch (err) {
    return res.status(err.code || 400).json({ error: err.message });
  }

  const filters = parsed.parsed_filters;
  let rows = db.all();

  if (filters.is_palindrome !== undefined) rows = rows.filter(r => !!r.is_palindrome === !!filters.is_palindrome);
  if (filters.min_length !== undefined) rows = rows.filter(r => r.length >= filters.min_length);
  if (filters.max_length !== undefined) rows = rows.filter(r => r.length <= filters.max_length);
  if (filters.word_count !== undefined) rows = rows.filter(r => r.word_count === filters.word_count);
  if (filters.contains_character !== undefined) {
    const ch = filters.contains_character;
    rows = rows.filter(r => {
      const freq = JSON.parse(r.character_frequency_map);
      return Object.prototype.hasOwnProperty.call(freq, ch);
    });
  }

  const out = rows.map(rowToResponse);
  return res.status(200).json({
    data: out,
    count: out.length,
    interpreted_query: parsed
  });
});

router.delete('/:string_value', (req, res) => {
  const value = decodeURIComponent(req.params.string_value);
  const row = db.getByValue(value);
  if (!row) return res.status(404).json({ error: 'String not found' });
  db.deleteById(row.id);
  return res.status(204).send();
});

module.exports = router;
