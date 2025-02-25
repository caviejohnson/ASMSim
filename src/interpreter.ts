import converter from "javascript-binary-converter";

import { Token, TokenType, trustMeBro } from "./types"
import { values } from ".";

export default class Interpreter {
	constructor(public code: Token[][]) { }

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
		if (!test) this.log();
		else return this.memory
	}

	log() {
		this.memory.forEach((v, i) => {
			if (i < parseInt(values["screen-start"])) return;
			if (i % Math.sqrt(this.memory.length) === 0) {
				console.write("\n");
			}
			console.write(v ? "⬜" : "⬛");
		});
	}
}