import { expect, test, beforeEach } from 'vitest'
import { SetLogic } from '../src/game/setlogic.js';

test('test1', () => {
  const count = SetLogic.countSets([new Set(['A']), new Set(['B']), new Set(['C'])])
  expect(count).toStrictEqual(3);
})

test('test2', () => {
  const count = SetLogic.countSets([new Set(['A', 'B']), new Set(['C'])])
  expect(count).toStrictEqual(2);
})

test('test3', () => {
  const count = SetLogic.countSets([new Set(['A', 'B']), new Set(['B']), new Set(['A', 'B', 'C'])])
  expect(count).toStrictEqual(3);
})

test('test4', () => {
  const count = SetLogic.countSets([new Set(['B']), new Set(['A', 'C']), new Set(['B', 'A'])])
  expect(count).toStrictEqual(3);
})

test('test5', () => {
  const count = SetLogic.countSets([new Set(['A', 'B', 'C']), new Set(['A', 'B','C']), new Set(['A'])])
  expect(count).toStrictEqual(3);
})

test('test5', () => {
  const count = SetLogic.countSets([new Set(['A', 'B', 'C']), new Set(['A', 'B','C']), new Set([])])
  expect(count).toStrictEqual(2);
})

test('test6', () => {
  const count = SetLogic.countSets([new Set(['A']), new Set(['A']), new Set(['A'])])
  expect(count).toStrictEqual(1);
})

test('test7', () => {
  const count = SetLogic.countSets([new Set(['B']), new Set(['A']), new Set(['A'])])
  expect(count).toStrictEqual(2);
})

test('test8', () => {
  const count = SetLogic.countSets([new Set(['A', 'D']), new Set(['A', 'B', 'C']), new Set(['B'])])
  expect(count).toStrictEqual(3);
})

test('test9', () => {
  const count = SetLogic.countSets([new Set(['C', 'A']), new Set(['A', 'B']), new Set(['A']), new Set(['B']), new Set(['C'])])
  expect(count).toStrictEqual(3);
})