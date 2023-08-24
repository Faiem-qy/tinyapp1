const keysMatch = function(obj1, obj2, keys) {
  for (const key of keys) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
};



console.log(keysMatch({ a: 1, b: 2 }, { a: 1 }, ['a'])); // => true
console.log(keysMatch({ a: 1, b: 2 }, { a: 1 }, ['a', 'c'])); // => true
console.log(keysMatch({ a: 1, b: 2 }, { a: 1 }, ['a', 'b'])); // => false