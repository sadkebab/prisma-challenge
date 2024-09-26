# Prisma Challenge Submission

This repository is a submission for the "Take Home Challenge: Prisma Core Challenge".

My solution consists of an interactive CLI tool that allows you to query the CSV file until you interrupt it.

### Prerequisites

I have used Bun as a bundler and runtime. I haven't used any Bun-specific APIs in the implementation, but since I defined tests using Bun's test runner you will need to have [Bun installed](https://bun.sh/docs/installation).

```base
npm install -g bun
```

## Preparing the demo

First, install the project dependencies:

```bash
bun install
```

Then, create a CSV file with valid headers and a data sample like this one.

```
id,first_name,last_name,age,from
1,Alberto,Harka,27,🇦🇱
2,Maria,Rodriguez,30,🇲🇽
```

## Running the CLI

To run the CLI, you need a CSV file with headers and a data sample.

You can use any single-character delimiter, but I recommend using a comma.
After that, run the following command:

```bash
bun start <path-to-csv-file>
```

Run this if you want a custom delimiter:

```bash
bun start <path-to-csv-file> --delimiter <delimiter>
```

If you want to use semicolons as a delimiter, you need to escape it and wrap it in quotes:

```bash
bun start <path-to-csv-file> --delimiter "\;"
```

## Query syntax

The syntax is almost the same as the example in the challenge description.
You use the `PROJECT` keyword to specify the fields you want to show and the `FILTER` keyword to specify a condition.

The keywords are case-insensitive, but the fields and conditions are case-sensitive.
When you define the filter condition you need to wrap string values in backticks.

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

### CSV parsing

I started from the CSV parsing. I was thinking about creating a parser myself but I decided to use [fast-csv](https://www.npmjs.com/package/@fast-csv/parse) because I have found it very reliable in the past.

I have never run into any limitations with it so far. It parses headers automatically, It processes the rows into objects with fields that respect the header, and it trims unwanted spaces.

The package exports a Transform stream so you can support large files piping it to a file Read stream.

I am loading all the rows in memory and I filter them later, which may not be the best approach for very large files, but I wanted to keep it simple.

Performance (mostly memory impact) could be improved by filtering the rows during the processing instead of loading all the data in memory, but it would come with the trade-off of parsing the whole file for every query.

### Query parsing

Considering the simple syntax, a few regexes would probably have been enough to do the job, but that would have made it hard to evolve the syntax in the future.

I picked [ohm-js](https://www.npmjs.com/package/ohm-js) for building the query parser.
I have never used a parsing toolkit before and based my choice on how quickly it seemed I could adopt it with my limited knowledge of the subject.

I had to spend some time reading the documentation and the examples to understand how to use it and for now it works but with some limitations.

For example, I chose to define string values as alphanumeric characters wrapped only with backticks because I wanted to support quotes and double quotes in the strings, but I didn't have enough time to figure out proper escaping for special characters.

Ohm-js was very convenient for defining the syntax, but the TypeScript experience was not great. The way you define semantic operations is not typed, which means that extending or modifying the syntax will require some trial and error on the semantic operations.

The query gets evaluated by an operation that returns the list of fields and a filter function to be applied to a parsed array of CSV rows. If the list of fields is empty, it means we are showing all the fields.

### Table formatting

I used [cli-table3](https://www.npmjs.com/package/cli-table3) to format the result table.
It is a simple library that allows you to create tables in the terminal with few customization options.

It was very trivial to use and I didn't have to spend too much time on it, but the customization options could be better.

A limitation of this library is that it expects you to push the exact data you want to display, so you have to filter the fields yourself unlike with something like `console.table`.

I could have just used `console.table` but I wanted to have more control over the style of the table to make the user experience better.

### Testing

I have defined all the tests I could think of for the CSV parser and the query parser. The test coverage could be improved but I think it's good enough for now.

#### Running tests

```bash
bun test

# for coverage
bun test --coverage
```

### Extra

I have used [yargs](https://www.npmjs.com/package/yargs) to parse the command line arguments and [chalk](https://www.npmjs.com/package/chalk) to color the output for better readability.

I wanted to use [inquirer](https://www.npmjs.com/package/inquirer) to ask for user input, but it's a very complex library that would have added an unnecessary amount of dependencies for something as simple as prompting the user for a string. So I opted out for a simple prompt function written with Node's readline API.

Creating the prompt was trivial, but I ran into a bug due to how the line reader reacts to the keyboard shortcuts for SIGINT, and tricked me into thinking that there was something wrong with my code.

I am using [Biome](https://biomejs.dev/) for linting and formatting the code, with minimal customization to the default settings.
