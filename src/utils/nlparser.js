function parseNaturalLanguage(queryText) {
  if (!queryText || typeof queryText !== 'string') {
    const e = new Error('Invalid query');
    e.code = 400;
    throw e;
  }

  const q = queryText.toLowerCase().trim();
  const filters = {};

  if (q.includes('single word')) filters.word_count = 1;
  else {
    const wcMatch = q.match(/word(?:s)?\s*(?:count)?\s*(?:of)?\s*(\d+)/);
    if (wcMatch) filters.word_count = parseInt(wcMatch[1], 10);
  }

  if (q.includes('palindrom') || q.includes('palindrome')) filters.is_palindrome = true;

  const mLong = q.match(/longer than (\d+)/);
  if (mLong) filters.min_length = parseInt(mLong[1], 10) + 1;

  const mContainsLetter = q.match(/(?:containing|contain|that contain|with)\s+(?:the\s+)?letter\s+([a-z])/);
  if (mContainsLetter) filters.contains_character = mContainsLetter[1];
  else {
    const m2 = q.match(/containing\s+([a-z])/);
    if (m2) filters.contains_character = m2[1];
  }

  if (q.includes('first vowel')) filters.contains_character = 'a';

  if (Object.keys(filters).length === 0) {
    const e = new Error('Unable to parse natural language query');
    e.code = 400;
    throw e;
  }

  return {
    original: queryText,
    parsed_filters: filters
  };
}

module.exports = { parseNaturalLanguage };
