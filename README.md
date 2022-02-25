# @public-js/eslint-plugin-react-native

[![Build](https://github.com/public-js/eslint-plugin-react-native/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/public-js/eslint-plugin-react-native/actions/workflows/build.yml)
[![Version](https://img.shields.io/npm/v/@public-js/eslint-plugin-react-native?style=flat)](https://www.npmjs.com/package/@public-js/eslint-plugin-react-native)
[![Downloads](https://img.shields.io/npm/dw/@public-js/eslint-plugin-react-native?style=flat)](https://www.npmjs.com/package/@public-js/eslint-plugin-react-native)
[![Size](https://packagephobia.com/badge?p=@public-js/eslint-plugin-react-native)](https://packagephobia.com/result?p=@public-js/eslint-plugin-react-native)

[![Codacy](https://app.codacy.com/project/badge/Grade/PROJECT_ID)](https://www.codacy.com/gh/public-js/eslint-plugin-react-native/dashboard)
[![LGTM](https://img.shields.io/lgtm/grade/javascript/g/public-js/eslint-plugin-react-native?logo=lgtm)](https://lgtm.com/projects/g/public-js/eslint-plugin-react-native/context:javascript)
[![Codecov](https://codecov.io/gh/public-js/eslint-plugin-react-native/branch/main/graph/badge.svg?token=TOKEN)](https://codecov.io/gh/public-js/eslint-plugin-react-native)
[![Code Climate](https://api.codeclimate.com/v1/badges/PROJECT_ID/maintainability)](https://codeclimate.com/github/public-js/eslint-plugin-react-native/maintainability)

Helpful ESLint rules for React Native

---

## Installing

Add the package to your project by running:

```shell
npm i -D @public-js/eslint-plugin-react-native
```

Add the following to your ESLint config or modify the existing properties:

```javascript
module.exports = {
  // ...
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
  plugins: [
    // ...
    '@public-js/eslint-plugin-react-native',
  ],
  // ...
};
```

## Rules

- 🔧 - Some problems reported by the rule can be fixed automatically by the `--fix` option
- 💡 - Some problems reported by the rule can be fixed manually with IDE suggestions

| Name&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Description                                               |     |     |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :-- | :-- |
| stylesheet-rational-order                                                                                                                                                                                                                            | Sorts related property declarations by grouping together. | 🔧  | 💡  |

## Resources

- [Changelog](CHANGELOG.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

MIT, [full license text](LICENSE).
Read more about it on [TLDRLegal](https://www.tldrlegal.com/l/mit).
