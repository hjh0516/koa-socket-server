export default {
    "env": {
      "browser": true,
      "node": true,
      "es6": true
    },
    "extends": ["eslint:recommended", "prettier"],
    "globals": {
      "Atomics": "readonly",
      "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
      "ecmaVersion": 2018
    },
    "rules": {
      "no-unused-vars": "warn",
      "no-console": "off"
    },
    "parser": "babel-eslint" // Babel을 이용해서 transpiling하기 위해서 설정
  };