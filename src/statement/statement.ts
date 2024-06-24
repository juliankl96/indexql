import {SelectStatement} from "./select/select-statement";


export interface Statement {

    toSql(): string;

    startsWith(statement: string): boolean;

    parse(statement: string): Statement;
}

const statements: Statement[] = [
    new SelectStatement(),
];

export function parseStatement(statement: string) {
    for (const stmt of statements) {
        if (stmt.startsWith(statement)) {
            return stmt.parse(statement);
        }
    }
    throw new Error("Statement not found");
}