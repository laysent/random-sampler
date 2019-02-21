import { getRandomFunction, getRandomNumber } from '../utils';

class NormalReservoir<T> {
  private size: number;
  private total: number = 0;
  private result: T[] = [];
  private getRandom: getRandomFunction;
  constructor(size: number, getRandom: getRandomFunction = Math.random) {
    this.size = size;
    this.getRandom = getRandom;
  }
  public add(element: T) {
    if (this.total < this.size) {
      this.result.push(element);
    } else {
      const index = getRandomNumber(0, this.total, this.getRandom);
      if (index < this.size) {
        this.result[index] = element;
      }
    }
    this.total += 1;
  }
  public get() {
    return this.result;
  }
}

export default NormalReservoir;
