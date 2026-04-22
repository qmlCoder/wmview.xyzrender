import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

import * as Vue from "vue";
import * as ElementPlus from "element-plus";
import * as Three from "three";

function externalizePlugin(deps: Record<string, Record<string, any>>) {
  return {
    name: "externalize-deps",
    enforce: "pre",
    resolveId(source: string, importer: string | undefined) {
      if (source in deps && importer && !importer.includes("node_modules")) {
        return `\0ext:${source}`;
      }
    },
    load(id: string) {
      for (const [pkg, exports] of Object.entries(deps)) {
        if (id === `\0ext:${pkg}`) {
          const keys = Object.keys(exports).filter((k) => k !== "default");
          return `
          const _m = window["${pkg}"];
          export default _m;
          export const { ${keys.join(", ")} } = _m;`;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    externalizePlugin({
      vue: Vue,
      "element-plus": ElementPlus,
      three: Three,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
    cors: true,
    hmr: true,
  },
  build: {
    minify: false,
    lib: {
      entry: "src/main.ts",
      name: "xyzrender",
      fileName: "main",
      formats: ["es"],
    },
    cssCodeSplit: false, // css全都在一个中
  },
});
