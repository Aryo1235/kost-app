import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

// Pertanyaan biasa di terminal.
export async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

// Kata sandi tidak tampil di layar. Hanya bisa lewat terminal interaktif.
export function askSecret(question: string): Promise<string> {
  if (!stdin.isTTY) {
    return Promise.reject(new Error("Kata sandi hanya bisa dimasukkan dari terminal interaktif."));
  }
  stdout.write(question);
  return new Promise((resolve) => {
    let value = "";
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.off("data", onData);
      stdin.pause();
    };
    const onData = (chunk: Buffer) => {
      for (const ch of chunk.toString("utf8")) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          cleanup();
          stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += ch;
      }
    };
    stdin.setRawMode(true);
    stdin.on("data", onData);
    stdin.resume();
  });
}
