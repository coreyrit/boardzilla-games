import { expect, test, beforeEach } from 'vitest'
import { IdSet, SetLogic } from '../src/game/setlogic.js';
import { truncate } from 'fs/promises';

test('threeByThreeOtherwise1', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A']), 
    new IdSet('A', ['B']), 
    new IdSet('A', ['C'])
  ])).toStrictEqual(true);
})

test('threeByThreeOtherwise2', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A', 'B']), 
    new IdSet('A', ['C'])
  ])).toStrictEqual(false);
})

test('threeByThreeOtherwise3', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A', 'B']), 
    new IdSet('A', ['B']), 
    new IdSet('A', ['A', 'B', 'C'])
  ])).toStrictEqual(true);
})

test('threeByThreeOtherwise4', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['B']), 
    new IdSet('A', ['A', 'C']), 
    new IdSet('A', ['B', 'A'])
  ])).toStrictEqual(true);
})

test('threeByThreeOtherwise5', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A', 'B', 'C']), 
    new IdSet('A', ['A', 'B','C']), 
    new IdSet('A', ['A'])
  ])).toStrictEqual(true);
})

test('threeByThreeOtherwise6', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A', 'B', 'C']), 
    new IdSet('A', ['A', 'B','C']), 
    new IdSet('A', [])
  ])).toStrictEqual(false);
})

test('threeByThreeOtherwise7', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A']), 
    new IdSet('A', ['A']), 
    new IdSet('A', ['A'])
  ])).toStrictEqual(false);
})

test('threeByThreeOtherwise8', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['B']), 
    new IdSet('A', ['A']), 
    new IdSet('A', ['A'])
  ])).toStrictEqual(false);
})

test('threeByThreeOtherwise9', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['A', 'D']), 
    new IdSet('A', ['A', 'B', 'C']), 
    new IdSet('A', ['B'])
  ])).toStrictEqual(true);
})

test('threeByThreeOtherwise10', () => {
  expect(SetLogic.threeByThreeOtherwise([
    new IdSet('A', ['C', 'A']), 
    new IdSet('A', ['A', 'B']), 
    new IdSet('B', ['A']), 
    new IdSet('B', ['B']), 
    new IdSet('A', ['C'])
  ])).toStrictEqual(true);
})

test('twoByTwo1', () => {
  expect(SetLogic.twoByTwo([
    new IdSet('A', ['A', 'B']),
    new IdSet('A', ['B', 'C']),
  ])).toStrictEqual(true);
})

test('twoByTwo2', () => {
  expect(SetLogic.twoByTwo([
    new IdSet('A', ['A', 'B']),
    new IdSet('A', ['B']),
  ])).toStrictEqual(false);
})

test('twoByTwo3', () => {
  expect(SetLogic.twoByTwo([
    new IdSet('A', ['A', 'B']),
    new IdSet('B', ['B', 'C']),
  ])).toStrictEqual(false);
})

test('fiveColors1', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A', 'B', 'C', 'D', 'E']),
  ])).toStrictEqual(true);
})

test('fiveColors2', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['D', 'E']),
  ])).toStrictEqual(true);
})

test('fiveColor3', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A']),
    new IdSet('A', ['B']),
    new IdSet('A', ['C']),
    new IdSet('A', ['D']),
    new IdSet('A', ['E']),
  ])).toStrictEqual(true);
})

test('fiveColors4', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['B', 'E']),
  ])).toStrictEqual(false);
})

test('fiveColor5', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A']),
    new IdSet('A', ['B']),
    new IdSet('A', ['C']),
    new IdSet('A', ['D']),
  ])).toStrictEqual(false);
})

test('fiveColors6', () => {
  expect(SetLogic.fiveColors([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A', 'B', 'D']),
  ])).toStrictEqual(false);
})

test('oneByFive1', () => {
  expect(SetLogic.oneByFive([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A', 'B', 'D']),
  ])).toStrictEqual(false);
})

test('oneByFive2', () => {
  expect(SetLogic.oneByFive([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A', 'B', 'D']),
    new IdSet('A', ['A']),
    new IdSet('A', ['B']),
    new IdSet('A', ['A', 'D']),
  ])).toStrictEqual(true);
})

test('twoPairs1', () => {
  expect(SetLogic.twoPairs([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A', 'B', 'D']),
  ])).toStrictEqual(true);
})

test('twoPairs2', () => {
  expect(SetLogic.twoPairs([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A']),
    new IdSet('A', ['B']),
  ])).toStrictEqual(true);
})

test('twoPairs3', () => {
  expect(SetLogic.twoPairs([
    new IdSet('A', ['A', 'C']),
    new IdSet('A', ['A', 'D']),
  ])).toStrictEqual(false);
})

test('threeByThreeLikewise1', () => {
  expect(SetLogic.threeByThreeLikewise([
    new IdSet('A', ['A', 'C']),
    new IdSet('A', ['A', 'D']),
    new IdSet('A', ['A']),
  ])).toStrictEqual(true);
})

test('threeByThreeLikewise2', () => {
  expect(SetLogic.threeByThreeLikewise([
    new IdSet('A', ['A', 'A']),
    new IdSet('A', ['A', 'D']),
  ])).toStrictEqual(false);
})

test('threeByThreeLikewise3', () => {
  expect(SetLogic.threeByThreeLikewise([
    new IdSet('A', ['A']),
    new IdSet('A', ['A', 'D']),
    new IdSet('A', ['B', 'D']),
  ])).toStrictEqual(false);
})

test('twoByThree1', () => {
  expect(SetLogic.twoByThree([
    new IdSet('A', ['A']),
    new IdSet('A', ['A', 'D']),
    new IdSet('A', ['B', 'D']),
  ])).toStrictEqual(false);
})

test('twoByThree2', () => {
  expect(SetLogic.twoByThree([
    new IdSet('A', ['A', 'B', 'C']),
    new IdSet('A', ['A', 'D']),
    new IdSet('A', ['B', 'D']),
  ])).toStrictEqual(true);
})

test('twoByThree3', () => {
  expect(SetLogic.twoByThree([
    new IdSet('A', ['A', 'B', 'C']),
  ])).toStrictEqual(false);
})