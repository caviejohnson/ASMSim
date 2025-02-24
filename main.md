# Darg Guide
## Chapter 1: Basics
Every expression is either followed by a new line character or a semi-colon.
```js
console.write("Hello, World!");
// Hello, World!
```

Expressions followed by ? will provide debug information which is either automaticly generated or specified in a function.
```js
console.write("Hello, World!")?

// {Line 1, Exp 1. main.darg} [Time: 3:14PM] [Took: 0.003s] [Read: 65 Bytes] [Wrote none]
// Hello, World!
```

Variables can be any non-keyword unicode string that does not contain spaces, semicolons, colons, and identifiers for diffrent types, suvh as *true*.
```go
🧓 := 89;
🧒 := 11;
difference := 🧓 - 🧒;
```

Variables may be assigned with a type.
```c#
int age = 5?
// ... [Wrote: 8 Byte] [Assigned: 5]
int | string age2 = 5?
// ... [Wrote: 65 Byte] <- Because strings take up 65 Bytes. [Assigned: 5]
```

A variables type may be changed after its creation.
```c#
int a = 5;
string a = 6?
// ... [Took: 1 second] [Read: 928 Bytes] [Wrote: 928 Bytes] [Assigned: 5] <- Effect is exaggerated
```

Variables assigned with a colon automatically get the type whatever value is returned.
```go
isValid := true?
// ... [Wrote: 1/8 Byte]
```

Functions are declared using the ***func*** keyword and **must** have a return type. 
```go
int func getAge() {
    return 5;
}
```

If statemets are written using ***if***, ***else*** and a combination of the two.
```go
if (getAge() == 5) {
    // Nothing will be logged
} else if (getAge()? > 3) {
    // Info will be logged about getAge()?
    // {Line 3, Exp 1. main.darg} [Time: 3:14PM] [Took: 0.003s] [Read nonde] [Wrote none]
} else {
    // Nothing will be logged
}
```

For loops can only loop through a list or array.
```py
for (item in items) { }
for (item in range(items))
```

Here are some other usefull keywords:
```js
while (true) {    
    continue;
    break;
}
```

Error handling is go-like.
```go
err, age := getAge();
if (err.is) {
    // handle error
}
```