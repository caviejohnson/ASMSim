import { testFile } from "../src/index.ts";
import { expect, test } from "bun:test";

test("Half-adder Test: ", async () => {
    let arr: boolean[] = new Array(2 ** 6).fill(false)
    arr[0] = true;
    arr[1] = true;
    arr[3] = true;
    expect(await testFile('./tests/half-adder.jsasm')).toStrictEqual(arr)
})