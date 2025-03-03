import converter from "javascript-binary-converter";

import { Token, TokenType, trustMeBro } from "./types";
import { values } from ".";

import webView from './web.html' with { type: "text" };
import chalk from "chalk";

export default class Interpreter {
  constructor(public code: Token[][]) {}

  memory: boolean[] = new Array(2 ** parseInt(values["memory"])).fill(false);

  writeToMemory(startIndex: number, data: number) {
    let newData: number[] = [];
    converter(Number(data))
      .toBinary()
      .split("")
      .forEach((v) => newData.push(parseInt(v)));

    newData.forEach((v, i) => {
      this.memory[startIndex + i] = Boolean(v);
    });
  }

  run(test: boolean = false): void | boolean[] {
    for (let i = 0; i < this.code.length; i++) {
      const exp: Token[] = this.code[i];
      let expC = exp.slice();
      let argsFinished: boolean = false;
      let args: number = 0;
      expC.forEach((t, j) => {
        if (argsFinished) return;
        if (t.type === TokenType.Action) return;
        if (t.type === TokenType.Value || t.type === TokenType.Pointer) {
          args++;
          if (t.type === TokenType.Pointer) {
            if (trustMeBro<number>(t.value))
              expC[j].value = this.memory[t.value] ? 1 : 0;
          }
        } else {
          argsFinished = true;
        }
      });

      let toRule = null;
      if (!expC[0]) continue;
      switch (expC[0].value) {
        case "OR":
          if (
            typeof expC[1].value === "number" &&
            typeof expC[2].value === "number" &&
            args === 2
          ) {
            toRule = expC[1].value || expC[2].value;
          } else {
            console.error("Invalid use of OR.");
          }
          break;
        case "AND":
          if (
            typeof expC[1].value === "number" &&
            typeof expC[2].value === "number" &&
            args === 2
          ) {
            toRule = expC[1].value && expC[2].value;
          } else {
            console.error("Invalid use of AND.");
          }
          break;
        case "ARB":
          if (typeof expC[1].value === "number" && args === 1) {
            toRule = expC[1].value;
          } else {
            console.error("Invalid use of ARB.");
          }
          break;
        case "XOR":
          if (
            typeof expC[1].value === "number" &&
            typeof expC[2].value === "number" &&
            args === 2
          ) {
            toRule = expC[1].value ^ expC[2].value;
          } else {
            console.error("Invalid use of XOR.");
          }
          break;
        case "NOT":
          if (typeof expC[1].value === "number" && args === 1) {
            toRule = !expC[1].value;
          } else {
            console.error("Invalid use of NOT.");
          }
          break;
        case "MOV":
          if (
            typeof expC[1].value === "number" &&
            typeof expC[2].value === "number" &&
            args === 2
          ) {
            if (expC[2].value) {
              i = expC[1].value;
              toRule = null;
            }
          } else {
            console.error("Invalid use of MOV.");
          }
          break;
        default:
          console.error("Expected an action, but did not get one. Parser is at fault for not throwing earlier. This may be caused by an action that has not been implemented correctly.")
          break;
      }

      if (expC[args + 1] && expC[args + 1].type === TokenType.Ruler) {
        switch (expC[args + 1].value) {
          case ">":
            this.writeToMemory(expC[args + 2].value, toRule);
            break;
        }
      }
    }
    if (!test) this.log(values.log);
    else return this.memory;
  }

  log(log: boolean) {
    if (log) {
      this.memory.forEach((v, i) => {
        if (i < parseInt(values["screen-start"])) return;
        if (i % Math.sqrt(this.memory.length) === 0) {
          console.write("\n");
        }
        console.write(v ? "⬜" : "⬛");
      });
    } else {
      const server = Bun.serve({
        
        port: values["web-port"],
        fetch: () => {
          let text = `<div style="padding: 2px 8px 8px 2px;">Memory:`;

          this.memory.forEach((v, i) => {
            if (i < parseInt(values["screen-start"])) return;
            if (i % Math.sqrt(this.memory.length) === 0) {
              text += '</div><div class="row">';
            }
            text += v
              ? '<div class="block black"></div>'
              : '<div class="block white"></div>';
          });

          text += `</div>`;

          const res = webView.replace("{{content}}", text)

          return new Response(res, {
            headers: { "Content-Type": "text/html" },
          });
        },
      });
      
      console.log(`Listening on ${chalk.underline(chalk.blueBright(server.url))}.`);
    }
  }
}
