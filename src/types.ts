import chalk from "chalk";

export enum TokenType {
	Action = "Action",
	Pointer = "Pointer",
	Value = "Value",
	Ruler = "Ruler",
}

export type Actions = "OR" | "AND" | "ARB" | "XOR" | "NOT" | "MOV";
export const actions: string[] = ["OR", "AND", "ARB", "XOR", "NOT", "MOV"] as const;
export function trustMeBro<T>(obj: any): obj is T {
	return true;
}

export type Rulers = ">";
export const rulers: string[] = [">"] as const;

export class Token {
	constructor(
		public type: TokenType,
		public value: Actions | Rulers | number
	) { }

	toString() {
		return `${chalk.green("{")} ${chalk.yellow("Type:")} ${this.type}${this.value === null
			? ""
			: ", " + chalk.yellow("Value: ") + this.value
			} ${chalk.green("}")}`;
	}
}