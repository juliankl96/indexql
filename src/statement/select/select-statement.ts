import {Statement} from "../statement";
import {ResultColumn} from "../model/result-column";

export class SelectStatement implements Statement {
    startsWith(statement: string): boolean {
        return statement.trim().substring(0, 6).toUpperCase() === "SELECT".toUpperCase();
    }

    private resultColumns: ResultColumn[];
    private tableOrSubquery: string;

    toSql(): string {
        return "UNIMPLEMENTED";
    }

    parse(statement: string): Statement {
        return undefined;
    }
}