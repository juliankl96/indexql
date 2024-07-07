import {BinaryOperation, BindParameter, Column, FunctionCall, LiteralValue, UnaryOperation} from "./exp";
import {Token, TokenArray} from "../../token";
import {ExpFactory} from "./exp-factory";
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
import {UnaryOperator} from "./unnary-operation";

describe('Exp', () => {

    describe('LiteralValue', () => {


        it('should handle a integer', () => {
            const token = new Token("1", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(IntegerType);
            expect((expResult.exp as LiteralValue).type.value).toBe(1);
        });

        it('should handle a string', () => {
            const token = new Token("'string'", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(StringType);
            expect((expResult.exp as LiteralValue).type.value).toBe('string');
        });

        it('should handle null', () => {
            const token = new Token("NULL", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(NullType);
            expect((expResult.exp as LiteralValue).type.value).toBeNull();
        });

        it('should handle a blob', () => {
            const token = new Token("X'12f3'", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(BlobType);
            expect((expResult.exp as LiteralValue).type.value).toBe('BLOB');
        });

        it('should handle FALSE', () => {
            const token = new Token("FALSE", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(FalseType);
            expect((expResult.exp as LiteralValue).type.value).toBe(false);
        });

        it('should handle TRUE', () => {
            const token = new Token("TRUE", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(TrueType);
            expect((expResult.exp as LiteralValue).type.value).toBe(true);
        });

        it('should handle CURRENT_TIME', () => {
            const token = new Token("CURRENT_TIME", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(CurrentTimeType);
            const format = new RegExp('([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]');
            expect(format.test((expResult.exp as LiteralValue).type.value)).toBe(true);
        });

        it('should handle CURRENT_DATE', () => {
            const token = new Token("CURRENT_DATE", 0);
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(CurrentDateType);
            const format = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2}');
            expect(format.test((expResult.exp as LiteralValue).type.value)).toBe(true);
        });

        it('should handle CURRENT_TIMESTAMP', () => {
            const token = new Token("CURRENT_TIMESTAMP", 0);
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as LiteralValue).type).toBeInstanceOf(CurrentTimestampType);
            const format = new RegExp('[0-9]{4}-[0-9]{2}-[0-9]{2} [01]?[0-9]|2[0-3]:[0-5][0-9]:[0-5][0-9]');
            expect(format.test((expResult.exp as LiteralValue).type.value)).toBe(true);
        });

    });

    it('should handle BindParameter', () => {

        const token = new Token("$1", 0);
        let expResult = ExpFactory.transformExp(token);
        expect(expResult.exp).toBeInstanceOf(BindParameter);
        expect((expResult.exp as BindParameter).parameter).toBe("$1");

    });

    describe('Column', () => {

        it('should handle a column', () => {
            const token = new Token("column", 0);
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(Column);
            expect((expResult.exp as Column).column).toBe("column");
        });

        it('should handle a column with table', () => {
            const token = TokenArray.fromString("table.column").getFirstToken();
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(Column);
            expect((expResult.exp as Column).column).toBe("column");
            expect((expResult.exp as Column).table).toBe("table");
        });

        it('should handle a column with table and schema', () => {
            const token = TokenArray.fromString("schema.table.column").getFirstToken();
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(Column);
            expect((expResult.exp as Column).column).toBe("column");
            expect((expResult.exp as Column).table).toBe("table");
            expect((expResult.exp as Column).schema).toBe("schema");
        });

    });

    describe('UnaryOperation', () => {

        it('should handle Minus', () => {
            const token = TokenArray.fromString("- 'test'").getFirstToken();
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(UnaryOperation);
            const unaryOperation = expResult.exp as UnaryOperation;
            expect(unaryOperation.operator).toBe(UnaryOperator.MINUS);
            expect(unaryOperation.exp).toBeInstanceOf(LiteralValue);
        });

        it('should handle Plus', () => {
            const token = TokenArray.fromString("+ 'test'").getFirstToken();
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(UnaryOperation);
            const unaryOperation = expResult.exp as UnaryOperation;
            expect(unaryOperation.operator).toBe(UnaryOperator.PLUS);
            expect(unaryOperation.exp).toBeInstanceOf(LiteralValue);
        });

        it('should handle BitwiseNot', () => {
            const token = TokenArray.fromString("~ 'test'").getFirstToken();
            let expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(UnaryOperation);
            const unaryOperation = expResult.exp as UnaryOperation;
            expect(unaryOperation.operator).toBe(UnaryOperator.BITWISE_NOT);
            expect(unaryOperation.exp).toBeInstanceOf(LiteralValue);
        });
    });

    describe('BinaryOperation', () => {

        it('should handle a or binary operation', () => {
            const token = TokenArray.fromString("1 | 2").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(BinaryOperation);
        });

        it('should handle a and binary operation', () => {
            const token = TokenArray.fromString("1 & 2").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(BinaryOperation);
        });

        it('should handle a left shift binary operation', () => {
            const token = TokenArray.fromString("1 << 2").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(BinaryOperation);
        });

        it('should handle a right shift binary operation', () => {
            const token = TokenArray.fromString("1 >> 2").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(BinaryOperation);
        });

        it('should handle multiple or operations', () => {
            const token = TokenArray.fromString("1 | 2 | 3").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(BinaryOperation);
            expect((expResult.exp as BinaryOperation).left).toBeInstanceOf(LiteralValue);
            expect((expResult.exp as BinaryOperation).right).toBeInstanceOf(BinaryOperation);
            const right = (expResult.exp as BinaryOperation).right as BinaryOperation;
            expect(right.left).toBeInstanceOf(LiteralValue);
            expect(right.right).toBeInstanceOf(LiteralValue);
        });

    });

    describe('Functions', () => {

        it('should handle ltrim', () => {
            const token = TokenArray.fromString("ltrim('test')").getFirstToken();
            const expResult = ExpFactory.transformExp(token);
            expect(expResult.exp).toBeInstanceOf(FunctionCall);
            expect((expResult.exp as FunctionCall).name).toBe('ltrim');
            expect((expResult.exp as FunctionCall).arguments.length).toBe(1);
        });

    });
});