import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Agrega tus reglas personalizadas aquí
      "@typescript-eslint/explicit-function-return-type": "warn",
      "react/react-in-jsx-scope": "off", // Ejemplo común en Next.js
    },
  },
];


export default eslintConfig;
