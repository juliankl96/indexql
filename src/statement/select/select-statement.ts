import {Statement} from "../statement";
import {ResultColumn} from "../model/result-column";
import {StatementModule} from "../../statement-module-parser";

export class SelectStatement implements Statement {
    startsWith(statement: string): boolean {
        return statement.trim().substring(0, 6).toUpperCase() === "SELECT".toUpperCase();
    }


    toSql(): string {
        return "UNIMPLEMENTED";
    }

    parse(statement: string): Statement {
        return undefined;
    }
}


export function parseSelectStatement(statementModules: StatementModule[],rawStatement: string = statementModules.join(" ")): SelectStatement {
    const fromModule = statementModules.find(module => module.value.toUpperCase() === 'FROM');
    if (!fromModule) {
        throw new Error("FROM clause is required in: " + rawStatement);
    }
    const fromIndex = statementModules.indexOf(fromModule);
    const selectColumns: StatementModule[] = statementModules.slice(1, fromIndex);



    return new SelectStatement();
}