import {LiteralValue} from "./exp";
import {Token} from "../../token";
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
});