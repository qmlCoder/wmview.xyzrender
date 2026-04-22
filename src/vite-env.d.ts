/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Vue from "vue";
import * as Three from "three";
import * as ElementPlus from "element-plus";
import type { WmAPI } from "./WmApi";

declare global {
  define: interface Window {
    vue: typeof Vue;
    "element-plus": typeof ElementPlus;
    three: typeof Three;
    WmAPI: WmAPI;
    process: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}
export {};
