import { getRandomFunction, getRandomNumber } from './utils';

function swap<T>(array: T[], i: number, j: number) {
  if (i === j) {
    return;
  }
  const temp = array[i];
  array[i] = array[j];
  array[j] = temp;
}

export function fisherYatesInArrayShuffle<T>(
  array: T[],
  getRandom: getRandomFunction
) {
  for (let i = array.length - 1; i >= 1; i -= 1) {
    const j = getRandomNumber(0, i, getRandom);
    swap(array, i, j);
  }
}

function partition<T>(start: number, end: number, array: T[], keys: number[]) {
  const pivot = keys[end];
  let index = start;
  for (let j = start; j < end; j += 1) {
    if (keys[j] > pivot) {
      swap<T>(array, index, j);
      swap<number>(keys, index, j);
      index += 1;
    }
  }
  swap<T>(array, index, end);
  swap<number>(keys, index, end);
  return index;
}

function sort<T>(start: number, end: number, array: T[], keys: number[]) {
  if (start >= end) {
    return;
  }
  const index = partition(start, end, array, keys);
  sort(start, index - 1, array, keys);
  sort(index + 1, end, array, keys);
}

export function weightedShuffle<T>(
  array: T[],
  getWeight: (element: T, index: number) => number
) {
  const keys = array.map((element, i) => {
    const weight = getWeight(element, i);
    const key = Math.random() ** (1 / weight);
    return key;
  });
  sort<T>(0, array.length - 1, array, keys);
}
