import Heap from 'heap';
import Component from '../comopnent';
import { getRandomFunction } from '../utils';

class WeightedReservoir<T> {
  private size: number;
  private heap = new Heap((a: Component<T>, b: Component<T>) => {
    return a.key - b.key;
  });
  private getRandom: getRandomFunction;
  constructor(size: number, getRandom: getRandomFunction = Math.random) {
    this.size = size;
    this.getRandom = getRandom;
  }
  public add(element: T, weight: number) {
    const rand = this.getRandom();
    const key = rand ** (1 / weight);
    if (this.heap.size() < this.size) {
      this.heap.push(new Component(element, key));
    } else {
      if (this.heap.top().key < key) {
        this.heap.replace(new Component(element, key));
      }
    }
  }
  public get(): T[] {
    return this.heap
      .toArray()
      .map((a: Component<T>) => a.element)
      .reverse();
  }
}

export default WeightedReservoir;
