/**
 * Splits a long text message into an array of string chunks,
 * each staying within Telegram's max message length limit (default: 4096).
 *
 * Prefers splitting at paragraph boundaries (\n\n), line breaks (\n),
 * sentence boundaries (. / ? / !), or word boundaries to preserve readability.
 *
 * @param {string} text - The input text to be split
 * @param {number} maxLength - Maximum allowed length per chunk (default 4096)
 * @returns {string[]} Array of message chunks
 */
export function splitMessage(text, maxLength = 4096) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = -1;

    // 1. Try splitting at paragraph boundary (\n\n)
    const paraIndex = remaining.lastIndexOf('\n\n', maxLength);
    if (paraIndex > 0) {
      splitIndex = paraIndex + 2; // Include the newlines
    }

    // 2. Try splitting at line boundary (\n)
    if (splitIndex <= 0) {
      const lineIndex = remaining.lastIndexOf('\n', maxLength);
      if (lineIndex > 0) {
        splitIndex = lineIndex + 1; // Include the newline
      }
    }

    // 3. Try splitting at sentence boundary (. / ? / ! followed by space)
    if (splitIndex <= 0) {
      const sentenceMatch = remaining.substring(0, maxLength).match(/.*[.?!](\s)/s);
      if (sentenceMatch && sentenceMatch[0].length > 0) {
        splitIndex = sentenceMatch[0].length;
      }
    }

    // 4. Try splitting at word boundary (space)
    if (splitIndex <= 0) {
      const spaceIndex = remaining.lastIndexOf(' ', maxLength);
      if (spaceIndex > 0) {
        splitIndex = spaceIndex + 1;
      }
    }

    // 5. Hard split if no boundary is found
    if (splitIndex <= 0) {
      splitIndex = maxLength;
    }

    const chunk = remaining.substring(0, splitIndex);
    chunks.push(chunk);

    remaining = remaining.substring(splitIndex);
  }

  return chunks;
}
