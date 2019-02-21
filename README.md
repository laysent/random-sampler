# random-sampler

This library provides APIs that useful for sampling a set of data, using normal or weighted possibility.

## Installation

```bash
yarn add random-sampler
```

## Explaination

[算法介绍（中文）](https://laysent.github.io/blog/post/random-sampling/)

## Usage

### Initialization

By default, simply `new` an instance will provide all API that you need. In this case, `Math.random` is used as default function to generate random numbers.

```javascript
import Sampler from 'random-sampler';

const sampler = new Sampler();
```

You could also pass a random generator function when creating instance. Whenever called, it should produce [uniform distribution](https://en.wikipedia.org/wiki/Uniform_distribution_(continuous)) with range `[0, 1)`.

```javascript
import Sampler from 'random-sampler';
import MersenneTwister from 'mersenne-twister';

const generator = new MersenneTwister();
function getRandom() {
  return generator.random();
}
const sampler = new Sampler(getRandom);
```

### Shuffle Array

By default, API will use Fish-Yates shuffle algorithm to shuffle array.

```javascript
import Sampler from 'random-sampler';

const sampler = new Sampler();
const array = [1, 2, 3];
sampler.shuffle(array);
console.log(array);
```

If you provide a function to give weight for each element in array, shuffle will be based on their weights, meaning that possibility of each element to be selected first is different. In general, if there are elements `a1`, `a2`, ..., `an` with weights `w1`, `w2`, ..., `wn`, element `ai` is selected as first element will have possibility `wi / (w1 + w2 + ... + wn)`.

```javascript
import Sampler from 'random-sampler';

const sampler = new Sampler();
const array = [1, 2, 3];
function getWeight(element, index) {
  return element + index;
}
sampler.shuffler(array, getWeight);
console.log(array);
```

**Notice**: shuffle API will mutate given array. This is not a immutable API.

### Sample Iterable

By default, it will use Reservoir algorithm to sample data out of array or any other iterable with size unknown:

```javascript
import Sampler from 'random-sampler';

const sampler = new Sampler();
const array = [1, 2, 3];
const size = 2;
const result = sampler.sample(array, size);
console.log(result);
```

If you provide a function to give weight for each element in array, sample will be based on their weights, meaning that possibility of each element to be selected is different (see how shuffle with weighted value works).

```javascript
import Sampler from 'random-sampler';

const sampler = new Sampler();
const array = [1, 2, 3];
const size = 2;
function getWeight(element, index) {
  return element + index;
}
const result = sampler.sample(array, size, getWeight);
console.log(result);
```

When weights are provided, the element with larger weight will be more likely to be shown in front of sample result.

**Notice**: sample API will not mutate given array, but instead, it will produce a new array as result.
