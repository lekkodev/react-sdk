module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "plugin:@typescript-eslint/recommended",
    "standard-with-typescript",
    "plugin:react/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: ["src/**/*.ts", "src/**/*.tsx"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.eslint.json",
  },
  plugins: ["react", "jsx-a11y", "react-hooks", "@typescript-eslint"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    indent: "off",
  },
}
