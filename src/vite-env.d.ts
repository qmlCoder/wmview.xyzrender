/* eslint-disable @typescript-eslint/no-unused-vars */

import * as Vue from "vue";
import * as Three from "three";
import * as ElementPlus from "element-plus";
import * as TauriApiPath from "@tauri-apps/api/path";
import * as TauriApiCore from "@tauri-apps/api/core";
import * as tauriApiEvent from "@tauri-apps/api/event";
import { WmAPI } from "./WmApi";

declare global {
  define: interface Window {
    vue: typeof Vue;
    "element-plus": typeof ElementPlus;
    three: typeof Three;
    WmAPI: WmAPI;
    "@tauri-apps/api/path": TauriApiPath;
    "@tauri-apps/api/core": TauriApiCore;
    "@tauri-apps/api/event": tauriApiEvent;
    process: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}
export {};
