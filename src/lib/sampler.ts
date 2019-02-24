import NormalReservoir from './reservoir/normal';
import WeightedReservoir from './reservoir/weighted';
import { fisherYatesInArrayShuffle, weightedShuffle } from './shuffle';
import { getRandomFunction } from './utils';

interface Receiver<T> {
  add: (element: T) => void;
  get: () => T[];
}

export default class Sampler {
  private getRandom: getRandomFunction;
  constructor(getRandom = Math.random) {
    this.getRandom = getRandom;
  }
  public create<T>(n: number, getWeight?: (element: T, index: number) => number): Receiver<T> {
    if (typeof getWeight !== 'undefined') {
      const reservoir = new WeightedReservoir<T>(n, this.getRandom);
      let i = 0;
      return {
        add(element: T) {
          reservoir.add(element, getWeight(element, i));
          i += 1;
        },
        get() {
          return reservoir.get();
        },
      };
    } else {
      const reservoir = new NormalReservoir<T>(n, this.getRandom);
      return {
        add(element: T) {
          reservoir.add(element);
        },
        get() {
          return reservoir.get();
        }
      };
    }
  }
  public sample<T>(
    iterable: Iterable<T>,
    n: number,
    getWeight?: (element: T, index: number) => number
  ): T[] {
    if (n <= 0) {
      return [];
    }
    if (Array.isArray(iterable) && iterable.length <= n) {
      const result = iterable.slice();
      this.shuffle(result, getWeight);
      return result;
    }
    if (getWeight === undefined) {
      const reservior = new NormalReservoir<T>(n, this.getRandom);
      for (const element of iterable) {
        reservior.add(element);
      }
      return reservior.get();
    } else {
      const reservior = new WeightedReservoir<T>(n, this.getRandom);
      let index = 0;
      for (const element of iterable) {
        reservior.add(element, getWeight(element, index++));
      }
      return reservior.get();
    }
  }
  public shuffle<T>(
    list: T[],
    getWeight?: (element: T, index: number) => number
  ) {
    if (getWeight === undefined) {
      return fisherYatesInArrayShuffle(list, this.getRandom);
    }
    return weightedShuffle<T>(list, getWeight);
  }
}
