import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
      // Numeric algorithms intentionally preallocate arrays by length.
      "unicorn/no-new-array": "off",
    },
  },
  fmt: {
    ignorePatterns: ["docs/**", "llm.md", "llms.txt", "test/data/**"],
  },
  test: { env: { TZ: "America/Toronto" }, testTimeout: 60000 },
  pack: {
    entry: ["src/index.ts", "src/web.ts"],
    sourcemap: true,
  },
});
