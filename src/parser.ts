import chalk from "chalk";
import {
  actions,
  rulers,
  Token,
  TokenType,
  trustMeBro,
  type Actions,
  type Rulers,
} from "./types";

export default class Parser {
  constructor(public code: string) {}

  tokens: Token[][] = [];

  parse() {
    const exps = this.code.split("\n");

    exps.filter((v: string) => !v.startsWith(";"));

    exps.forEach((v) => {
      if (v === "\n" || v === "") return;
      const words = v.split(" ");

      let comment = false;
      let newTokens: Token[] = [];
      let nextShouldBe: TokenType[] | null = null;
      words.forEach((w: string, i: number) => {
        if (w.startsWith(";")) comment = !comment;
        if (comment) return;
        if (w.codePointAt(0) === 13) return;
        if (!w) return;

        if (i === 0) {
          if (!actions.includes(w.toUpperCase()))
            throw Error(`First word should be an action, ${w} is not.`);

          if (
            !(nextShouldBe === null || nextShouldBe?.includes(TokenType.Action))
          ) {
            console.log(
              chalk.red(`Did not expect an action, expected ${nextShouldBe}`)
            );
          }

          let W = w.toUpperCase();
          if (trustMeBro<Actions>(W)) {
            newTokens.push(new Token(TokenType.Action, W));
            nextShouldBe = [TokenType.Value, TokenType.Pointer];
          }
        } else if (rulers.includes(w)) {
          if (
            !(nextShouldBe === null || nextShouldBe?.includes(TokenType.Ruler))
          ) {
            console.log(
              chalk.red(`Did not expect a ruler, expected ${nextShouldBe}`)
            );
          }

          if (trustMeBro<Rulers>(w))
            newTokens.push(new Token(TokenType.Ruler, w));
          nextShouldBe = [TokenType.Pointer];
        } else {
          let type = TokenType.Value;
          let value = parseInt(w);

          if (w.startsWith("$")) {
            type = TokenType.Pointer;
            value = parseInt(w.replace("$", ""));
          }

          newTokens.push(new Token(type, value));
          nextShouldBe = null;
        }
      });

      this.tokens.push(newTokens);
    });
  }

  log() {
    let text: string = "";
    this.tokens.forEach((ts: Token[]) => {
      ts.forEach((t: Token) => {
        text += t.toString();
        text += " ";
      });

      text += "\n";
    });

    console.log(text);
  }
}
