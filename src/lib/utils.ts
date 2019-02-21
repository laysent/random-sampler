export type getRandomFunction = () => number;

export function getRandomNumber(
  min: number,
  max: number,
  getRandom: getRandomFunction
) {
  return Math.floor(getRandom() * (max + 1 - min)) + min;
}
