import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitMessage } from '../src/utils/splitMessage.js';

test('splitMessage returns single chunk for short text', () => {
  const input = 'Hello, world!';
  const result = splitMessage(input, 4096);
  assert.deepEqual(result, ['Hello, world!']);
});

test('splitMessage handles empty/invalid inputs gracefully', () => {
  assert.deepEqual(splitMessage(''), []);
  assert.deepEqual(splitMessage(null), []);
  assert.deepEqual(splitMessage(undefined), []);
});

test('splitMessage splits text longer than maxLength at paragraph breaks', () => {
  const p1 = 'Paragraph 1 '.repeat(20);
  const p2 = 'Paragraph 2 '.repeat(20);
  const text = `${p1}\n\n${p2}`;
  
  // Use maxLength smaller than text length but larger than p1
  const maxLen = p1.length + 10;
  const result = splitMessage(text, maxLen);
  
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0], `${p1}\n\n`);
  assert.strictEqual(result[1], p2);
});

test('splitMessage splits long text at line breaks if no paragraph break exists', () => {
  const line1 = 'Line 1 '.repeat(20);
  const line2 = 'Line 2 '.repeat(20);
  const text = `${line1}\n${line2}`;
  
  const maxLen = line1.length + 5;
  const result = splitMessage(text, maxLen);
  
  assert.strictEqual(result.length, 2);
  assert.strictEqual(result[0], `${line1}\n`);
  assert.strictEqual(result[1], line2);
});

test('splitMessage hard splits when no spaces or breaks exist', () => {
  const longWord = 'A'.repeat(100);
  const result = splitMessage(longWord, 30);
  
  assert.strictEqual(result.length, 4);
  assert.strictEqual(result[0], 'A'.repeat(30));
  assert.strictEqual(result[1], 'A'.repeat(30));
  assert.strictEqual(result[2], 'A'.repeat(30));
  assert.strictEqual(result[3], 'A'.repeat(10));
});

test('splitMessage preserves full content length without losing words', () => {
  const text = 'Word '.repeat(1000);
  const result = splitMessage(text, 100);
  
  const reconstructed = result.join('');
  assert.strictEqual(reconstructed, text);
});
