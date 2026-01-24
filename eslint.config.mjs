import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import unusedImports from "eslint-plugin-unused-imports";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig([{
    extends: [...next],

    plugins: {
        "unused-imports": unusedImports,
    },

    rules: {
        "react/display-name": "warn",
        "react/no-children-prop": "warn",
        "unused-imports/no-unused-imports": "error",
    },
}]);