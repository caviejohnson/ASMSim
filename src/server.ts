import Interpreter from "./interpreter";
import Parser from "./parser";
import { trustMeBro } from "./types";

Bun.serve({
  port: "2000",

  routes: {
    "/play": async (req) => {
      const body = await req.json();
      const parser = new Parser(body.code);
      const parsed = parser.parse(true);
      const interpreter = new Interpreter(parser.tokens);
      const ran = interpreter.run(false, true);
      if (ran === undefined)
        return new Response(
          JSON.stringify({ parsed: parsed, ran: "No return value" }),
          { status: 200 }
        );
      if (!trustMeBro<{ mem: boolean[]; res: string }>(ran))
        return new Response(JSON.stringify("wtf"), { status: 200 });
      parser.log();
      return new Response(JSON.stringify({ parsed: parsed, ran: ran }), {
        status: 200,
      });
    },
  },
});
