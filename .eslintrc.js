module.exports = {
  "extends": [
    "airbnb",
    "prettier",
  ],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2020,
  },
  "env": {
    "node": true,
  },
  rules: {
    "quotes": [
     2,
     "single",
     {
        "avoidEscape": true,
        "allowTemplateLiterals": true
      }
    ],
  }
};
