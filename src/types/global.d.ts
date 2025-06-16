/// <reference types="node" />

// 使用 Node.js 的 File 类型
import type { File as NodeFile } from "node:buffer";

declare global {
  const File: typeof NodeFile;
  type File = NodeFile;
}
