import {StatementModule, WordModule} from "../../statement-module-parser";
import {
    BlobType,
    CurrentDateType,
    CurrentTimestampType,
    CurrentTimeType,
    FalseType,
    IntegerType,
    NullType,
    StringType,
    TrueType
} from "./data-types";
import {BindParameter, Column, Exp, LiteralValue} from "./exp";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";

export class ExpFactory {


    public static createExp(selectModules: StatementModule[], rawStatement: string = selectModules.join(" ")): Exp {
        if (selectModules.length === 1 && selectModules[0] instanceof WordModule) {
            return ExpFactory.handleOneWordModule(selectModules[0] as WordModule);
        }
        // handle column Expression
        if (selectModules.length == 3 && selectModules[0] instanceof WordModule && selectModules[1].value === '.' && selectModules[2] instanceof WordModule) {
            return new Column(selectModules[2].value, selectModules[0].value);
        }
        if (selectModules.length == 5 && selectModules[0] instanceof WordModule && selectModules[1].value === '.' && selectModules[2] instanceof WordModule && selectModules[3].value === '.' && selectModules[4] instanceof WordModule) {
            return new Column(selectModules[4].value, selectModules[0].value, selectModules[2].value);
        }


        throw new Error("Not implemented");
    }

    private static handleOneWordModule(statementModule: WordModule): Exp {
        switch (statementModule.value.toUpperCase()) {
            case 'NULL':
                return new LiteralValue(new NullType());
            case 'FALSE':
                return new LiteralValue(new FalseType());
            case 'TRUE':
                return new LiteralValue(new TrueType());
            case 'CURRENT_TIME':
                return new LiteralValue(new CurrentTimeType());
            case 'CURRENT_DATE':
                return new LiteralValue(new CurrentDateType());
            case 'CURRENT_TIMESTAMP':
                return new LiteralValue(new CurrentTimestampType());
        }
        // handle bind-parameter
        if (statementModule.value.startsWith(":") || statementModule.value.startsWith("@") || statementModule.value.startsWith("$") || statementModule.value.startsWith("?")) {
            return new BindParameter(statementModule.value);
        }
        if (statementModule.value.toLowerCase().startsWith("x'") && statementModule.value.endsWith("'")) {
            const blobRegex = /^X'([0-9a-f]{2})+'$/gmi;
            const match = blobRegex.exec(statementModule.value);
            if (!match) {
                throw new SqliteError(SQLITE_ERROR, `unrecognized token: "${statementModule.value}"`);
            }
            return new LiteralValue(new BlobType(statementModule.value.substring(2, statementModule.value.length - 1)));
        }

        const literalValue: RegExp = /^(\d+)|('.*')$/gmi;
        const regExpExecArray: RegExpMatchArray = literalValue.exec(statementModule.value)
        if (!regExpExecArray) {
            return new Column(statementModule.value);
        }
        if (regExpExecArray[1]) {
            return new LiteralValue(new IntegerType(parseInt(regExpExecArray[0])));
        }
        if (regExpExecArray[2] && regExpExecArray[0].startsWith("'") && regExpExecArray[0].endsWith("'")) {
            let string = regExpExecArray[0].substring(1, regExpExecArray[0].length - 1);
            return new LiteralValue(new StringType(string));
        }
        if (regExpExecArray[3] && regExpExecArray[0].startsWith("X'") && regExpExecArray[0].endsWith("'")) {
            const blob = regExpExecArray[0].substring(2, regExpExecArray[0].length - 1);
            return new LiteralValue(new BlobType(blob));
        }

        throw new SqliteError(SQLITE_ERROR, `unrecognized token: "${statementModule.value}"`);
    }

}