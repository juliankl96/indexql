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
import {
    BinaryOperation,
    BindParameter,
    Cast,
    Collate,
    Column,
    Exp,
    ExpressionList,
    FunctionCall,
    IsExp,
    LiteralValue,
    NullExp,
    PatternMatching,
    UnaryOperation
} from "./exp";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";
import {Token} from "../../token";
import {UnaryOperator} from "./unnary-operation";
import {BITWISE_OPERATIONS} from "./bitwise-operation";
import {FilterClaus} from "../clause/filter-clause";
import {OverClause} from "../clause/over-clause";
import {TokenResult} from "../util/TokenResult";

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

    protected static handleFilterClause(token: Token): ExpResult {
        if (!token.test("FILTER", "(", "WHERE")) {
            return ExpResult.noResult(token);
        }
        let index = token.jump(3)
        const expResult = ExpFactory.transformExp(index);
        if (expResult.exp) {
            index = expResult.token;
        } else {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        index = index?.next
        if (index.value !== ')') {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        return new ExpResult(index, expResult.exp);
    }

    protected static handleOverClause(_index: Token) {
        throw new Error("Method not implemented.");
    }

    protected static handleExpressionList(token: Token): ExpResult {
        if (token.value !== '(') {
            return ExpResult.noResult(token);
        }
        let index = token.next;
        const elements: Exp[] = [];
        while (index?.value !== ')') {
            const expResult = ExpFactory.transformExp(index);
            if (expResult.exp) {
                elements.push(expResult.exp);
                index = expResult.token;
            } else {
                throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
            }
            if (index?.value === ',') {
                index = index.next;
            }
        }
        index = index.next;
        return new ExpResult(index, new ExpressionList(elements));
    }


    protected static handleFunction(token: Token): ExpResult {
        let filterClause: FilterClaus = undefined;
        let overClause: OverClause = undefined;
        const functionNamePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/gmi;
        if (!functionNamePattern.test(token.value)) {
            return ExpResult.noResult(token);
        }
        const functionName = token.value;
        let index = token.next;
        if (index?.value !== '(') {
            return ExpResult.noResult(token);
        }
        index = index.next;
        const args: string[] = [];
        while (index?.value !== ')') {
            args.push(index.value);
            index = index.next;
            if (index?.value === ',') {
                index = index.next;
            }
        }
        index = index?.next;
        if (index === undefined) {
            return new ExpResult(index, new FunctionCall(functionName, args));
        }

        const filterClauseResult = ExpFactory.handleFilterClause(index);
        if (filterClauseResult.exp) {
            index = filterClauseResult.token;
            filterClause = new FilterClaus(filterClauseResult.exp);
        }
        // const overClauseResult = ExpFactory.handleOverClause(index);

        return new ExpResult(index, new FunctionCall(functionName, args, filterClause, overClause));
    }

    protected static handleCast(token: Token) {
        if (token.value.toUpperCase() !== 'CAST') {
            return ExpResult.noResult(token);
        }
        let index = token.next;
        if (index?.value !== '(') {
            return ExpResult.noResult(token);
        }
        index = index.next;
        const expResult = ExpFactory.transformExp(index);
        if (!expResult.exp) {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        index = expResult.token;
        if (index?.value !== 'AS') {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        index = index.next;
        const type = index.value;
        index = index.next;
        if (index?.value !== ')') {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        index = index.next;
        return new ExpResult(index, new Cast(expResult.exp, type));
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

        const castExp = ExpFactory.handleCast(token);
        if (castExp.exp) {
            return castExp;
        }

        const functionExp = ExpFactory.handleFunction(token);
        if (functionExp.exp) {
            return functionExp;
        }

        const expressionList = ExpFactory.handleExpressionList(token);
        if (expressionList.exp) {
            return expressionList;
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

    protected static handleCollate(token: Token, exp: Exp) {
        if (token.value.toUpperCase() !== 'COLLATE') {
            return ExpResult.noResult(token);
        }
        const collateName = token.next.value;
        return new ExpResult(token.next.next, new Collate(exp, collateName));
    }


    private static handleBinaryOperator(token: Token, exp: Exp) {
        for (const operation of BITWISE_OPERATIONS) {
            if (operation.operator === token.value) {
                const rightResult = ExpFactory.transformExp(token.next);

                return new ExpResult(rightResult.token, new BinaryOperation(exp, operation, rightResult.exp));
            }
        }
        return ExpResult.noResult(token);
    }

    protected static handlePatternMatcher(token: Token, exp: Exp) {
        let not: boolean = false;
        let index: Token = token;
        let escape: Exp = undefined;
        if (index.value.toUpperCase() === 'NOT') {
            not = true;
            index = index.next;
        }

        if (index.value.toUpperCase() !== 'LIKE') {
            return ExpResult.noResult(token);
        }
        index = index.next;
        const subExpResult = ExpFactory.transformExp(index);
        if (!subExpResult.exp) {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        index = subExpResult.token;

        if (index.value.toUpperCase() !== 'ESCAPE') {
            return ExpResult.noResult(token);
        }
        index = index.next;
        const escapeExpResult = ExpFactory.transformExp(index);
        if (!escapeExpResult.exp) {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        escape = escapeExpResult.exp;
        index = escapeExpResult.token;
        return new ExpResult(index, new PatternMatching(subExpResult.exp, not, escape));

    }

    protected static handleIsExp(token: Token, exp: Exp) {
        let index: Token = token;
        let not: boolean = false;
        let distinctFrom: boolean = false;
        if (index.value.toUpperCase() !== 'IS') {
            return ExpResult.noResult(token);
        }
        index = index.next;
        if (index.value.toUpperCase() === 'NOT') {
            not = true;
            index = index.next;
        }
        if (index.value.toUpperCase() === 'DISTINCT') {
            index = index.next;
            if (index.value.toUpperCase() !== 'FROM') {
                return ExpResult.noResult(token);
            }
            distinctFrom = true;
            index = index.next;
        }
        const fromExpResult = ExpFactory.transformExp(index);
        if (!fromExpResult.exp) {
            throw new SqliteError(SQLITE_ERROR, `near "${index.value}": syntax error`);
        }
        return new ExpResult(fromExpResult.token, new IsExp(fromExpResult.exp, fromExpResult.exp, not, distinctFrom));

    }


    public static handleNull(token: Token, exp: Exp): ExpResult {
        if (token.value.toUpperCase() == 'ISNULL') {
            const nullExp: NullExp = new NullExp(exp, "ISNULL");
            return new ExpResult(token.next, nullExp);
        }
        if (token.value.toUpperCase() == 'NOTNULL') {
            const nullExp: NullExp = new NullExp(exp, "NOTNULL");
            return new ExpResult(token.next, nullExp);
        }
        if (token.value.toUpperCase() !== 'NOT') {
            return ExpResult.noResult(token);
        }
        const index = token.next
        if (index?.value?.toUpperCase() !== 'NULL') {
            return ExpResult.noResult(token);
        }
        return new ExpResult(index.next, new NullExp(exp, "NOT NULL"));
    }

    public static transformExp(token: Token): ExpResult {

        const leftResult = ExpFactory.handleSimpleExp(token);
        if (!leftResult.token) {
            return leftResult;
        }

        const binaryOperation = this.handleBinaryOperator(leftResult.token, leftResult.exp);
        if (binaryOperation.exp) {
            return binaryOperation;
        }

        const collate = this.handleCollate(leftResult.token, leftResult.exp);
        if (collate.exp) {
            return collate;
        }

        const subExp = this.handlePatternMatcher(leftResult.token, leftResult.exp);
        if (subExp.exp) {
            return subExp;
        }

        const nullExp = this.handleNull(leftResult.token, leftResult.exp);
        if (nullExp.exp) {
            return nullExp;
        }

        const isExp = this.handleIsExp(leftResult.token, leftResult.exp);
        if (isExp.exp) {
            return isExp;
        }

        return leftResult;
    }


    public static handleToken(token: Token): TokenResult<Exp> {
        const expTokenResult = this.transformExp(token);
        if (expTokenResult.exp) {
            return TokenResult.of(expTokenResult.exp, expTokenResult.token)
        }
        return TokenResult.empty(token);
    }
}