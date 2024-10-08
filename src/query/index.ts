import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as ohm from "ohm-js";

export type QueryEvalutaion = {
	fields: string[];
	filter: (data: Record<string, unknown>) => boolean;
};

type ParserError = {
	errorMessage: string;
};

export type QueryParserResult = QueryEvalutaion | ParserError;

const definition = readFileSync(join(__dirname, "./grammar.ohm"), "utf-8");
const grammar = ohm.grammar(definition);
const semantics = grammar.createSemantics();

semantics.addOperation("eval()", {
	Projection(_, fields, __, condition) {
		const conditionFns = condition.eval();
		return { fields: fields.eval(), filter: conditionFns[0] };
	},
	Fields(listOrWildcard) {
		return listOrWildcard.eval();
	},
	FieldList(list) {
		return list.asIteration().children.map((child) => child.eval());
	},
	Wildcard(_) {
		return [];
	},
	colName(name) {
		return name.sourceString;
	},
	Condition(cond) {
		return cond.eval();
	},
	Eq(col, _, val) {
		return (data: Record<string, unknown>) => {
			const colValue = data[col.eval()];
			if (colValue === undefined || colValue === null) {
				return false;
			}
			return colValue === val.eval();
		};
	},
	Gt(col, _, val) {
		return (data: Record<string, unknown>) => {
			const colValue = data[col.eval()];
			if (colValue === undefined || colValue === null) {
				return false;
			}
			return colValue > val.eval();
		};
	},
	Gte(col, _, val) {
		return (data: Record<string, unknown>) => {
			const colValue = data[col.eval()];
			if (colValue === undefined || colValue === null) {
				return false;
			}
			return colValue >= val.eval();
		};
	},
	Lt(col, _, val) {
		return (data: Record<string, unknown>) => {
			const colValue = data[col.eval()];
			if (colValue === undefined || colValue === null) {
				return false;
			}
			return colValue < val.eval();
		};
	},
	Lte(col, _, val) {
		return (data: Record<string, unknown>) => {
			const colValue = data[col.eval()];
			if (colValue === undefined || colValue === null) {
				return false;
			}
			return colValue <= val.eval();
		};
	},
	numbericValue(sign, value) {
		if (sign.sourceString === "-") {
			return -Number(value.sourceString);
		}
		return Number(value.sourceString);
	},
	stringValue(_, value, __) {
		return value.sourceString;
	},
	_iter(...arr) {
		// called on conditions
		// biome-ignore lint/suspicious/noExplicitAny: any is fine here
		return arr.map((n: any) => n.eval());
	},
});

export function parseQuery(query: string): QueryParserResult {
	const match = grammar.match(query);

	if (match.succeeded()) {
		const evaluation = semantics(match).eval() as QueryEvalutaion;
		return evaluation;
	}

	return {
		errorMessage: match.message ?? "Unknown error",
	};
}

export function runQuery(
	query: QueryEvalutaion,
	data: Record<string, unknown>[],
) {
	const filtered = query.filter ? data.filter(query.filter) : data;

	const mapped =
		query.fields.length === 0
			? filtered
			: filtered.map((row) => {
					const result: Record<string, unknown> = {};
					query.fields.forEach((field) => {
						result[field] = row[field];
					});
					return result;
				});

	return mapped;
}
