// tslint:disable:no-expression-statement
import test, { ExecutionContext } from 'ava';
import Sampler from './sampler';

const ITERATE_TIMES = 100000;
const EPSILON = 0.01;

function sum(array: number[]) {
  return array.reduce((acc, num) => acc + num, 0);
}

function roughlyEqual(from: number, to: number, t: ExecutionContext<{}>) {
  const diff = Math.abs(to - from);
  if (diff < EPSILON) {
    t.pass(`${from} is roughly equal to ${to}`);
  } else {
    t.fail(
      `${from} is not roughly equal to ${to}, |${from} - ${to}| = ${diff}`
    );
  }
}

test('should produce even possibility if weight not provided', t => {
  const array = [1, 2, 3];
  const expected = array.reduce((acc, num) => acc + num, 0) / array.length;
  const final = [0, 0, 0];
  const sampler = new Sampler();
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const cloned = array.slice();
    sampler.shuffle(cloned);
    for (let j = 0; j < array.length; j += 1) {
      final[j] += cloned[j];
    }
  }
  final.forEach(num => {
    roughlyEqual(num / ITERATE_TIMES, expected, t);
  });
});
test('should shuffle based on weight given', t => {
  const getWeight = (element: number, index: number) => element + index;
  const array = [1, 2];
  const final = [0, 0];
  const total = array.map(getWeight).reduce((acc, num) => acc + num, 0);
  const p = array.map((element, index) => getWeight(element, index) / total);
  const expected = [
    p[0] * array[0] + p[1] * array[1],
    (1 - p[0]) * array[0] + (1 - p[1]) * array[1]
  ];
  const sampler = new Sampler();
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const cloned = array.slice();
    sampler.shuffle(cloned, getWeight);
    for (let j = 0; j < array.length; j += 1) {
      final[j] += cloned[j];
    }
  }
  final.forEach((num, i) => {
    roughlyEqual(num / ITERATE_TIMES, expected[i], t);
  });
});

test('should sample evenly when array is provided', t => {
  const array = [1, 2, 3];
  const average = array.reduce((acc, num) => acc + num, 0) / array.length;
  const sampler = new Sampler();
  let total = 0;
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const [selected] = sampler.sample(array, 1);
    total += selected;
  }
  roughlyEqual(total / ITERATE_TIMES, average, t);
});
test('should sample based on weight', t => {
  const array = [1, 2, 3];
  const all = sum(array);
  const getWeight = (element: number, index: number) => element + index;
  const weights = array.map(getWeight);
  const allWeights = sum(weights);
  function getPosibilityOfUnselect(unselected: number) {
    let possibility = 0;
    for (const a of weights) {
      if (a === unselected) {
        continue;
      }
      for (const b of weights) {
        if (b === a) {
          continue;
        }
        if (b === unselected) {
          continue;
        }
        possibility += ((a / allWeights) * b) / (b + unselected);
      }
    }
    return possibility;
  }
  const expected = array.reduce(
    (acc, num, i) => acc + getPosibilityOfUnselect(weights[i]) * num,
    0
  );
  const sampler = new Sampler();
  let unselectedSum = 0;
  let first = 0;
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const selected = sampler.sample(array, 2, getWeight);
    const unselected = all - sum(selected);
    unselectedSum += unselected;
    first += selected[0];
  }
  roughlyEqual(unselectedSum / ITERATE_TIMES, expected, t);
  roughlyEqual(
    first / ITERATE_TIMES,
    sum(weights.map((weight, i) => (weight / allWeights) * array[i])),
    t
  );
});
test('should provide add/get api to sample async data', t => {
  const sampler = new Sampler();
  const array = [1, 2, 3];
  const average = array.reduce((acc, num) => acc + num, 0) / array.length;
  let total = 0;
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const receiver = sampler.create<number>(1);
    array.forEach((num) => receiver.add(num));
    const [selected] = receiver.get();
    total += selected;
  }
  roughlyEqual(total / ITERATE_TIMES, average, t);
});
test('should provide add/get api to sample async data with weights', t => {
  const array = [1, 2, 3];
  const all = sum(array);
  const getWeight = (element: number, index: number) => element + index;
  const weights = array.map(getWeight);
  const allWeights = sum(weights);
  function getPosibilityOfUnselect(unselected: number) {
    let possibility = 0;
    for (const a of weights) {
      if (a === unselected) {
        continue;
      }
      for (const b of weights) {
        if (b === a) {
          continue;
        }
        if (b === unselected) {
          continue;
        }
        possibility += ((a / allWeights) * b) / (b + unselected);
      }
    }
    return possibility;
  }
  const expected = array.reduce(
    (acc, num, i) => acc + getPosibilityOfUnselect(weights[i]) * num,
    0
  );
  const sampler = new Sampler();
  let unselectedSum = 0;
  let first = 0;
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const receiver = sampler.create(2, getWeight);
    array.forEach((num) => { receiver.add(num); });
    const selected = receiver.get();
    const unselected = all - sum(selected);
    unselectedSum += unselected;
    first += selected[0];
  }
  roughlyEqual(unselectedSum / ITERATE_TIMES, expected, t);
  roughlyEqual(
    first / ITERATE_TIMES,
    sum(weights.map((weight, i) => (weight / allWeights) * array[i])),
    t
  );
});
test('should shuffle array evenly when all elements required', t => {
  const getWeight = (element: number, index: number) => element + index;
  const array = [1, 2];
  const final = [0, 0];
  const total = array.map(getWeight).reduce((acc, num) => acc + num, 0);
  const p = array.map((element, index) => (element + index) / total);
  const expected = [
    p[0] * array[0] + p[1] * array[1],
    (1 - p[0]) * array[0] + (1 - p[1]) * array[1]
  ];
  const sampler = new Sampler();
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const result = sampler.sample(array, array.length + 1, getWeight);
    for (let j = 0; j < array.length; j += 1) {
      final[j] += result[j];
    }
  }
  final.forEach((num, i) => {
    roughlyEqual(num / ITERATE_TIMES, expected[i], t);
  });
});
test('should shuffle array based on weight when all elements required', t => {
  const getWeight = (element: number, index: number) => element + index;
  const array = [1, 2];
  const final = [0, 0];
  const total = array.map(getWeight).reduce((acc, num) => acc + num, 0);
  const p = array.map((element, index) => getWeight(element, index) / total);
  const expected = [
    p[0] * array[0] + p[1] * array[1],
    (1 - p[0]) * array[0] + (1 - p[1]) * array[1]
  ];
  const sampler = new Sampler();
  for (let i = 0; i < ITERATE_TIMES; i += 1) {
    const sampled = sampler.sample(array, array.length + 1, getWeight);
    for (let j = 0; j < array.length; j += 1) {
      final[j] += sampled[j];
    }
  }
  final.forEach((num, i) => {
    roughlyEqual(num / ITERATE_TIMES, expected[i], t);
  });
});
test('should provide empty array when none element required', t => {
  const getWeight = (element: number, index: number) => element + index;
  const array = [1, 2, 3];
  const sampler = new Sampler();
  for (let num = -1; num <= 0; num += 1) {
    let sampled = sampler.sample(array, num);
    t.deepEqual(sampled, []);
    sampled = sampler.sample(array, num, getWeight);
    t.deepEqual(sampled, []);
  }
});
