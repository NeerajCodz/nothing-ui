import assert from 'node:assert/strict';
import test from 'node:test';
import { cn } from './cn';

test('cn merges conditional classes and resolves Tailwind utility conflicts cleanly', () => {
  assert.equal(cn('px-4 py-2', 'px-6'), 'py-2 px-6');
  assert.equal(cn('text-sm', false && 'text-lg', undefined, null, 'font-mono'), 'text-sm font-mono');
  assert.equal(cn('bg-black text-white', { 'bg-red-600': true, 'opacity-50': false }), 'text-white bg-red-600');
  assert.equal(cn('rounded-md', ['rounded-full', 'border']), 'rounded-full border');
});
