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
import {BinaryOperation, BindParameter, Column, Exp, LiteralValue, UnaryOperation} from "./exp";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";
import {Token} from "../../token";
import {UnaryOperator} from "./unnary-operation";
import {BITWISE_OPERATIONS} from "./bitwise-operation";

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
            return ExpResult.noResult(token);
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
        return ExpResult.noResult(token);
    }

    protected static handleColumn(token: Token): ExpResult {
        const columnRegex = () => /^[a-zA-Z_][a-zA-Z0-9_]*$/gmi;
        let index = token;
        const subResult: string[] = [];
        for (let i = 0; i < 3; i++) {
            if (columnRegex().test(index.value)) {
                subResult.push(index.value);
                index = index.next;
            } else {
                break;
            }
            if (index?.value === '.') {
                index = index.next;
            } else {
                break;
            }
        }
        if (subResult.length === 0) {
            return ExpResult.noResult(token);
        }
        if (subResult.length === 1) {
            return new ExpResult(index, new Column(subResult[0]));
        }
        if (subResult.length === 2) {
            return new ExpResult(index, new Column(subResult[1], subResult[0]));
        }
        if (subResult.length === 3) {
            return new ExpResult(index, new Column(subResult[2], subResult[1], subResult[0]));
        }
        return ExpResult.noResult(token);

    }

    protected static handleUnaryOperator(token: Token): ExpResult {
        switch (token.value) {
            case 'NOT':
                const expResult = ExpFactory.transformExp(token.next);
                return new ExpResult(expResult.token?.next, new UnaryOperation(UnaryOperator.NOT, expResult.exp));
            case '-':
                const expResultMinus = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultMinus.token?.next, new UnaryOperation(UnaryOperator.MINUS, expResultMinus.exp));
            case '+':
                const expResultPlus = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultPlus.token?.next, new UnaryOperation(UnaryOperator.PLUS, expResultPlus.exp));
            case '~':
                const expResultBitwiseNot = ExpFactory.transformExp(token.next);
                return new ExpResult(expResultBitwiseNot.token?.next, new UnaryOperation(UnaryOperator.BITWISE_NOT, expResultBitwiseNot.exp));
        }

        return ExpResult.noResult(token);
    }

    private static handleSimpleExp(token: Token): ExpResult {

        const handleLiteralValue = ExpFactory.handleLiteralValue(token);
        if (handleLiteralValue.exp) {
            return handleLiteralValue;
        }

        const bindParameter = ExpFactory.handleBindParameter(token);
        if (bindParameter.exp) {
            return bindParameter;
        }

        const column = ExpFactory.handleColumn(token);
        if (column.exp) {
            return column;
        }

        const unaryOperator = ExpFactory.handleUnaryOperator(token);
        if (unaryOperator) {
            return unaryOperator;
        }
        return ExpResult.noResult(token);
    }

    public static transformExp(token: Token): ExpResult {


        const leftResult = ExpFactory.handleSimpleExp(token);
        if (!leftResult.token?.hasNext()) {
            return leftResult;
        }

        const binaryOperation = this.handleBinaryOperator(leftResult.token, leftResult.exp);

        let index = leftResult.token;
        return leftResult;
    }


    private static handleBinaryOperator(token: Token, exp: Exp) {
        for (const operation of BITWISE_OPERATIONS) {
            if (operation.operator === token.value) {
                const rightResult = ExpFactory.transformExp(token.next);

                return new ExpResult(rightResult.token, new BinaryOperation(exp, operation, rightResult.exp));
            }
        }
        throw new SqliteError(SQLITE_ERROR, `unrecognized token: "${token.value}"`);
        return ExpResult.noResult(token);
    }
}