import chalk from "chalk";
import converter from "javascript-binary-converter";
import { parseArgs } from "util";

const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		memory: {
			type: "string",
			default: "6",
		},
		// "screen-buffer": {
		// 	type: "string",
		// 	default: "6",
		// },
		"screen-start": {
			type: "string",
			default: "0",
		},
		log: {
			type: "boolean",
			default: false,
		},
	},
	strict: true,
	allowPositionals: true,
});

enum TokenType {
	Action = "Action",
	Pointer = "Pointer",
	Value = "Value",
	Ruler = "Ruler",
}

type Actions = "OR" | "AND" | "ARB" | "XOR" | "NOT" | "MOV";
const actions: string[] = ["OR", "AND", "ARB", "XOR", "NOT", "MOV"] as const;
function trustMeBro<T>(obj: any): obj is T {
	return true;
}

type Rulers = ">";
const rulers: string[] = [">"] as const;

class Token {
	constructor(
		public type: TokenType,
		public value: Actions | Rulers | number
	) {}

	toString() {
		return `${chalk.green("{")} ${chalk.yellow("Type:")} ${this.type}${
			this.value === null
				? ""
				: ", " + chalk.yellow("Value: ") + this.value
		} ${chalk.green("}")}`;
	}
}

class Parser {
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
						throw Error(
							`First word should be an action, ${w} is not.`
						);

					if (
						!(
							nextShouldBe === null ||
							nextShouldBe?.includes(TokenType.Action)
						)
					) {
						console.log(
							chalk.red(
								`Did not expect an action, expected ${nextShouldBe}`
							)
						);
					}

					let W = w.toUpperCase();
					if (trustMeBro<Actions>(W)) {
						newTokens.push(new Token(TokenType.Action, W));
						nextShouldBe = [TokenType.Value, TokenType.Pointer];
					}
				} else if (rulers.includes(w)) {
					if (
						!(
							nextShouldBe === null ||
							nextShouldBe?.includes(TokenType.Ruler)
						)
					) {
						console.log(
							chalk.red(
								`Did not expect a ruler, expected ${nextShouldBe}`
							)
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

class Interpreter {
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

	run() {
		for (let i = 0; i < this.code.length; i++) {
			const exp: Token[] = this.code[i];
			let expC = exp.slice();
			let argsFinished: boolean = false;
			let args: number = 0;
			expC.forEach((t, j) => {
				if (argsFinished) return;
				if (t.type === TokenType.Action) return;
				if (
					t.type === TokenType.Value ||
					t.type === TokenType.Pointer
				) {
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
					if (typeof expC[1].value === "number" && args === 1) {
						i = expC[1].value;
						toRule = null;
					} else {
						console.error("Invalid use of MOV.");
					}
					break;
			}

			if (expC[args + 1] && (expC[args + 1].type === TokenType.Ruler)) {
				switch (expC[args + 1].value) {
					case ">":
						this.writeToMemory(expC[args + 2].value, toRule)
						break;
				}
			}
		}
		this.log();
	}

	log() {
		console.log(this.memory.length)
		this.memory.forEach((v, i) => {
			if (i < parseInt(values["screen-start"])) return;
			if (i % Math.sqrt(this.memory.length) === 0) {
				console.write("\n");
			}
			console.write(v ? "⬜" : "⬛");
		});
	}
}

if (!positionals[2]) {
	console.error("A path for s file has to be given.");
	console.log(chalk.redBright("Use --help for more information.\n"));
	console.log(chalk.yellow("ASMSim:"));
	console.log(chalk.green("Version: "), "0.0.1");
	console.log(chalk.green("Licence: "), "MIT Licence\n");
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
