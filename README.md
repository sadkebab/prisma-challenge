<!-- @format -->

# Prisma Challenge Submission

This repository is my submission for "Take Home Challenge: Prisma Core Challenge".
My solution was built as an interactive CLI tool that allows you to query the CSV file until you interrupt it.

### Prerequisites

I have used Bun as a bundler and as a runtime, if I haven't used any Bun specific APIs in the implementation, but I defined the tests using Bun's test runner so you will need to have Bun installed.

```base
npm install -g bun
```

## Demo setup

First, install the dependencies:

```bash
bun install
```

Then, create a csv file with valid headers and a data sample.

```csv
id,first_name,last_name,age,from
1,Alberto,Harka,27,🇦🇱
2,Maria,Rodriguez,30,🇲🇽
```

## Running the CLI

To run the CLI, you need to have a CSV file with headers and a data sample.

You can use any single character delimiter, but I recommend using a comma.
After that, run the following command:

```bash
bun start <path-to-csv-file>
```

Or with custom delimiter:

```bash
bun start <path-to-csv-file> --delimiter <delimiter>
```

If you want to use semicolon as a delimiter, you need to escape it and wrap it in quotes:

```bash
bun start <path-to-csv-file> --delimiter "\;"
```

## Query syntax

The syntax is the same provided in the challenge description.
You use the `PROJECT` keyword to specify the fields you want to query and the `FILTER` keyword to specify the condition.
The keywords are case insensitive, but the fields and conditions are case sensitive.
When you define condition you need to wrap strings in backticks.

### Examples

#### Query all rows with all fields

```
PROJECT *
```

#### Query a specific field for all rows

```
PROJECT field
```

#### Query multiple fields for all rows

```
PROJECT field_1, field_2
```

#### Query all rows where a numeric field matches a condition

```
PROJECT * FILTER field = 11.1
PROJECT * FILTER field > 2
PROJECT * FILTER field <= 3
```

#### Query all rows where a string field matches a condition

```
PROJECT * FILTER field = `value`
```

## How I built it

### Csv parsing

I started by the csv parsing. I was thinking about creating a parser myself but I decided to use [fast-csv](https://www.npmjs.com/package/@fast-csv/parse) because I have found it very reliable in the past.

I have never run in any limitions using it so far since it parses headers automatically, builds objects with header fields for every row and will also trim unwanted spaces.

The package exports a Transform stream that you can use to parse large files piping it to a file Read stream.

For now I am loading all the rows in memory and I filter them later, which may not be the best approach for very large files, but I wanted to keep it simple.

Performance (mostly memory impact) could be improved by filtering the rows during the csv processing instead of loading all the data in memory.

### Query parsing

Considering the simple syntax, probably few regexes would have been enough to do the job, but that would have made very hard to change the syntax in the future.

I picked [ohm-js](https://www.npmjs.com/package/ohm-js) for building the query parser.
It looked like the easiest language toolkit I could find, and since I had never used a parsing toolkit before I picked based on how quickly I could adopt it with my limited knowledge of the subject.

I had to spend some time reading the documentation and the examples to understand how to use it and for now it works but with some limitations.

For example I choose to allow string values to be wrapped only with backticks because I didn't have the time to implement escaping for special characters.

Ohm-js was very convenient for defining the syntax, but the TypeScript experience is not great, since they way you define semantic operations is not really typed, which means that exentending and modifiying the syntax will require some trial and error on the semantic operations.

The query gets evaluated by an operation that will return the list of fields and a filter function to be applied to parsed array of csv rows. If the list of fields it means we are showing all the fields.

### Table formatting

I decided to use [cli-table3](https://www.npmjs.com/package/cli-table3) to format the result table.
It is a simple library that allows you to create tables in the terminal with few customization options.

Very trivial to use and I didn't have to spend too much time on it, but the customization options could be better.

Another limit is that it expects you to push the exact data you want to display, so you have to filter the fields yourself unlike with something like `console.table`.

I could have just used `console.table` but I wanted to have more control over the style of the table.

### Testing

I have built tests all the tests I could think about csv parsing and the query parsing. I have used [Bun's test runner](https://bun.sh/docs/test) and so far the test coverage could be improved but I think it's good enough for now.

#### Running tests

```bash
bun test
```

### Extra

I have used [yargs](https://www.npmjs.com/package/yargs) to parse the command line arguments and [chalk](https://www.npmjs.com/package/chalk) to color the output for better readability.

I wanted to use [inquirer](https://www.npmjs.com/package/inquirer) to ask for user input, but it's a very complex library that would have added an unnecessary amount of dependencies for something as simple as prompting the user for a string. So I decided to create a simple prompt function with Node's readline API.

Implementing the prompt was trivial, but I run into a couple of tricky bugs due to how readline reacts to keyboard shortcuts for interrupting the process and misguided me into thinking that there was something wrong with my code.

I am using [Biome](https://biomejs.dev/) for linting and formatting the code, with minimal customization to the default settings.
