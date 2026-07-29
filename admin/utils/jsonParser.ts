/**
 * Safe JSON Parser for LLM Responses
 * Handles unescaped newlines, trailing commas, markdown blocks, and conversational prefixes
 */
export function safeParseJson(rawResponse: string): any {
  if (!rawResponse || typeof rawResponse !== 'string') return null;
  
  let clean = rawResponse
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // Extract content between first { and last }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  // Attempt 1: Direct JSON parse
  try {
    return JSON.parse(clean);
  } catch (e1) {
    // Continue to fallback sanitization
  }

  // Attempt 2: Sanitize control characters & fix trailing commas
  try {
    const sanitized = clean
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // remove non-printable control chars
      .replace(/,\s*([\}\]])/g, '$1'); // fix trailing commas

    return JSON.parse(sanitized);
  } catch (e2) {
    // Continue to fallback 3
  }

  // Attempt 3: Replace unescaped line breaks inside string values
  try {
    let inString = false;
    let escaped = false;
    let result = '';

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];

      if (char === '"' && !escaped) {
        inString = !inString;
        result += char;
      } else if (inString && (char === '\n' || char === '\r')) {
        result += char === '\n' ? '\\n' : '\\r';
      } else if (inString && char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }

      escaped = char === '\\' && !escaped;
    }

    const sanitized3 = result
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      .replace(/,\s*([\}\]])/g, '$1');

    return JSON.parse(sanitized3);
  } catch (e3) {
    console.warn('[safeParseJson] Failed to parse JSON response:', e3);
  }

  return null;
}
