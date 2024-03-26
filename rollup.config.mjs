import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import { nodeResolve } from "@rollup/plugin-node-resolve"

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
      // Directive at top of bundle
      banner: '"use client";',
    },
    {
      file: "dist/index.mjs",
      format: "es",
      sourcemap: true,
      // Directive at top of bundle
      banner: '"use client";',
    },
  ],
  plugins: [typescript(), commonjs(), nodeResolve()],
  external: [/node_modules/, "tslib"],
}
