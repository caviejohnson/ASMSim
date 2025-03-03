import chalk from "chalk";
import { parseArgs } from "util";

import Parser from "./parser";
import Interpreter from "./interpreter";

export const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    memory: {
      type: "string",
      default: "6",
    },
    "screen-buffer": {
      type: "string",
      default: "6",
    },
    "screen-start": {
      type: "string",
      default: "0",
    },
    log: {
      type: "boolean",
      default: false,
    },
    loh: {
      type: "boolean",
      default: false,
    },
    "web-port": {
      type: "string",
      default: "3000",
    },
  },
  strict: true,
  allowPositionals: true,
});

if (!positionals[2]) {
  console.error("A path for s file has to be given.");
  console.log(chalk.redBright("Use --help for more information.\n"));
  console.log(chalk.yellow("ASMSim:"));
  console.log(chalk.green("Version: "), "0.0.1");
  console.log(chalk.green("Licence: "), "OpenLawyers Licence\n");
} else {
  Bun.file(positionals[2])
    .text()
    .then((code) => main(code));
}

function main(code: string) {
  let parser = new Parser(code);
  parser.parse();
  if (values.log) parser.log();

  let interpreter = new Interpreter(parser.tokens);
  interpreter.run();
}

export async function testFile(path: string): Promise<boolean[]> {
  return new Promise((resolve, reject) => {
    Bun.file(path)
      .text()
      .then((code) => {
        let parser = new Parser(code);
        parser.parse();
        let interpreter = new Interpreter(parser.tokens);
        let res = interpreter.run(true);
        if (res) resolve(res);
        else reject("Invalid");
      });
  });
}
