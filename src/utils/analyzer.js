const crypto = require('crypto');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function isPalindrome(value) {
  if (typeof value !== 'string') return false;
  const s = value.toLowerCase();
  return s === s.split('').reverse().join('');
}

function uniqueCharacters(value) {
  return new Set(value).size;
}

function wordCount(value) {
  if (typeof value !== 'string' || value.trim() === '') return 0;
  return value.trim().split(/\s+/).length;
}

function characterFrequencyMap(value) {
  const map = {};
  for (const ch of value) {
    map[ch] = (map[ch] || 0) + 1;
  }
  return map;
}

function analyze(value) {
  const len = value.length;
  const pal = isPalindrome(value);
  const uniq = uniqueCharacters(value);
  const wc = wordCount(value);
  const hash = sha256(value);
  const freq = characterFrequencyMap(value);
  return {
    length: len,
    is_palindrome: pal,
    unique_characters: uniq,
    word_count: wc,
    sha256_hash: hash,
    character_frequency_map: freq
  };
}

module.exports = { analyze, sha256, isPalindrome, characterFrequencyMap };
