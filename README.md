# ASMSim

[![ASMSim](https://img.shields.io/badge/ASMSim-0.0.1%20Alpha-red.svg)](https://github.com/caviejohnson/ASMSim)

Finally, a language that truly sucks ass™. A kind of assembly simulator that runs on hopes and dreams (a.k.a JavaScript).

### WARNING:

THIS ISN'T SIMILAR TO ANY CPU ASM OUT THERE. THIS IS THE MOST BASIC ONE EVER AND I ONLY MADE IT IN A DAY BECAUSE WHY NOT.

## Instalation

### Dev envirenment

First, either download the repo as ZIP, or clone using Git onto your device.
To install dependencies, run:

```powershell
bun install
```

To run the program in dev mode, run:

```powershell
bun dev "./path/to/file"
```

To build, run:

```powershell
bun prod
```

### Non-Dev Use

Don't.

But if you really wanted to, as of now, you have to download the content of ./out manually and run it using bun. An API may come in the future.

```powershell
bun app "./path/to/file"
```

## Docs

### Programming

A few Instructions, called "actions", are implemented:

| Action | Explanation                                                                     | Example Usage                        |
| :----: | ------------------------------------------------------------------------------- | ------------------------------------ |
|   OR   | 2 args, return if either are powered.                                           | `OR 0 1 > 0` Space 0 in memory is 1  |
|  AND   | 2 args, return if both are powered.                                             | `AND 0 1 > 0` Space 0 in memory is 0 |
|  NOT   | 1 arg, return the reverseof it's state.                                         | `NOT 0 > 0` Space 0 in memory is 1   |
|  XOR   | 2 args, return if only one is powered.                                          | `XOR 0 1 > 0` Space 0 in memory is 1 |
|  ARB   | 1 arg, return the given value. Used for setting spaces in memory manually.      | `ARB 1 > 0` Space 0 in memory is 1   |
|  MOV   | 2 args, move execution pointer to line number n if the second condition is met. | `MOV 0 1` Goes back to the beggining |

There are also rulers used to do other things. For now, there is only one of them.

'\>' Will write anything before it to a space in memory. This space can be both written using $ as a pointer and as an arbitrary value.

Comments are indicated using ;.

### Screen Buffer

A screen buffer is built in for your convinience.
You can change this yourself.

### Args

To run a program, you can specify args for the interpreter/parser.

|       Arg        | Explanation                                                                                                     |
| :--------------: | --------------------------------------------------------------------------------------------------------------- |
|   `--memory `    | Default is 6. An even value where the memory size = 2^n.                                                        |
| `--screen-start` | Default is 0. The space of memory where the screen buffer starts.                                               |
|     `--log`      | Default is false. Boolean that specifies if tokens generated by the parser are to be logged.                    |
|     `--log`      | Default is false. Boolean that specifies if the screen should be logged instead of displaying it on a web view. |
|   `--web-port`   | Default is 3000. The port to run the screen website on.                                                         |
|  `--pixel-size`  | Default is 10. The size of each pixel in the web view in px.                                                    |

### Website

A generic web program is provided if `--web` is true. It is written in plane HTML and has a dark mode.

## Example Program

```
; Half adder implementation.
ARB 1 > 0 ; First value
ARB 0 > 1 ; Second value

XOR $1 $0 > 2 ; Get sum
AND $1 $0 > 3 ; Get carry
```
