// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // Curly quotes/apostrophes in user-facing copy are fine as-is.
      "react/no-unescaped-entities": "off",
      // React Compiler-era rules: noisy for standard RN data-fetch patterns
      // (declare-after-use in render bodies is safe because effects run post-render).
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
]);
