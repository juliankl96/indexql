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
import {BindParameter, Column, Exp, LiteralValue, UnaryOperation} from "./exp";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";
import {Token} from "../../token";
import {UnaryOperator} from "./unnary-operation";

/**
 * Result of a expression.
 * If no result is found, the exp is undefined.
 * If a result is found, the exp is defined.
 * If the token is not used, the token is returned.
 * If the token is used, the next token is returned.
 */
export class ExpResult {
    exp?: Exp;
    token: Token;

    constructor(token: Token, exp?: Exp) {
        this.token = token;
        this.exp = exp;
    }

    static noResult(token: Token) {
        return new ExpResult(token);
    }


}

export class ExpFactory {


    protected static handleLiteralValue(token: Token): ExpResult {
        switch (token.value.toUpperCase()) {
            case 'NULL':
                return new ExpResult(token.next, new LiteralValue(new NullType()));
            case 'FALSE':
                return new ExpResult(token.next, new LiteralValue(new FalseType()));
            case 'TRUE':
                return new ExpResult(token.next, new LiteralValue(new TrueType()));
            case 'CURRENT_TIME':
                return new ExpResult(token.next, new LiteralValue(new CurrentTimeType()));
            case 'CURRENT_DATE':
                return new ExpResult(token.next, new LiteralValue(new CurrentDateType()));
            case 'CURRENT_TIMESTAMP':
                return new ExpResult(token.next, new LiteralValue(new CurrentTimestampType()));
        }
        if (token.value.toLowerCase().startsWith("x'") && token.value.endsWith("'")) {
            const blobRegex = /^X'([0-9a-f]{2})+'$/gmi;
            const match = blobRegex.exec(token.value);
            if (!match) {
                throw new SqliteError(SQLITE_ERROR, `unrecognized token: "${token.value}"`);
            }
            return new ExpResult(token.next, new LiteralValue(new BlobType(token.value.substring(2, token.value.length - 1))));
        }

        const literalValue: RegExp = /^(\d+)|('.*')$/gmi;
        const regExpExecArray: RegExpMatchArray = literalValue.exec(token.value)
        if (!regExpExecArray) {
            return new ExpResult(token.next, new Column(token.value));
        }
        if (regExpExecArray[1]) {
            return new ExpResult(token.next, new LiteralValue(new IntegerType(parseInt(regExpExecArray[0]))));
        }
        if (regExpExecArray[2] && regExpExecArray[0].startsWith("'") && regExpExecArray[0].endsWith("'")) {
            let string = regExpExecArray[0].substring(1, regExpExecArray[0].length - 1);
            return new ExpResult(token.next, new LiteralValue(new StringType(string)));
        }
        if (regExpExecArray[3] && regExpExecArray[0].startsWith("X'") && regExpExecArray[0].endsWith("'")) {
            const blob = regExpExecArray[0].substring(2, regExpExecArray[0].length - 1);
            return new ExpResult(token.next, new LiteralValue(new BlobType(blob)));
        }

        return ExpResult.noResult(token);
    }

    protected static handleBindParameter(token: Token): ExpResult {
        // handle bind-parameter
        if (token.value.startsWith(":") || token.value.startsWith("@") || token.value.startsWith("$") || token.value.startsWith("?")) {
            return new ExpResult(token, new BindParameter(token.value));
        }
        return undefined;
    }

    protected static handleColumn(token: Token): Exp | undefined {
        // column
        let index = token;
        let schema = null;
        let table = null;
        let column = index.value;
        // table.column
        if (index.hasNext() && index.next.value === '.') {
            table = column;
            index = index.next;
            column = index.next.value;
        } else {
            return new Column(column);
        }
        // schema.table.column
        if (index.hasNext() && index.next.value === '.') {
            schema = table;
            table = column;
            index = index.next;
            column = index.next.value;
        }
        return new Column(column, table, schema);

    }

    protected static handleUnaryOperator(token: Token): ExpResult {
        switch (token.value) {
            case 'NOT':
                const expResult = ExpFactory.transformExp(token.next);
                return new ExpResult(expResult.token.next, new UnaryOperation(UnaryOperator.NOT, expResult.exp));
            case '-':
                const expResultMinus = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultMinus.token.next, new UnaryOperation(UnaryOperator.MINUS, expResultMinus.exp));
            case '+':
                const expResultPlus = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultPlus.token.next, new UnaryOperation(UnaryOperator.PLUS, expResultPlus.exp));
            case '~':
                const expResultBitwiseNot = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultBitwiseNot.token.next, new UnaryOperation(UnaryOperator.BITWISE_NOT, expResultBitwiseNot.exp));
        }

        return ExpResult.noResult(token);
    }


    public static transformExp(token: Token): ExpResult {


        const handleLiteralValue = ExpFactory.handleLiteralValue(token);
        if (handleLiteralValue.exp) {
            return handleLiteralValue;
        }

        const bindParameter = ExpFactory.handleBindParameter(token);
        if (bindParameter) {
            return bindParameter;
        }

        const unaryOperator = ExpFactory.handleUnaryOperator(token);
        if (unaryOperator) {
            return unaryOperator;
        }
        return ExpResult.noResult(token);
    }


}