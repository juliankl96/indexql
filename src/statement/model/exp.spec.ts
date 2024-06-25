import {BindParameter, ExpFactory, LiteralValue} from "./exp";
import {WordModule} from "../../statement-module-parser";

describe('Exp', () => {

    describe('LiteralValue', () => {


        it('should handle a integer', () => {
            let exp = ExpFactory.createExp([new WordModule('1', 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            const literalValue: LiteralValue = exp as LiteralValue;
            expect(literalValue.type.sqlType).toBe("INTEGER")
            expect(literalValue.type.value).toBe(1)

        });

        it('should handle a string', () => {
            let exp = ExpFactory.createExp([new WordModule("'test 123  blub'", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("STRING")
            expect((exp as LiteralValue).type.value).toBe("test 123  blub")
        });

        it('should handle a true', () => {
            let exp = ExpFactory.createExp([new WordModule("true", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("TRUE")
            expect((exp as LiteralValue).type.value).toBe(true)
        });

        it('should handle a false', () => {
            let exp = ExpFactory.createExp([new WordModule("false", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("FALSE")
            expect((exp as LiteralValue).type.value).toBe(false)
        });

        it('should handle a null', () => {
            let exp = ExpFactory.createExp([new WordModule("null", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("NULL")
            expect((exp as LiteralValue).type.value).toBe(null)
        });

        it('should handle BLOB type', () => {
            let exp = ExpFactory.createExp([new WordModule("X'1234'", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("BLOB")
            expect((exp as LiteralValue).type.value).toBe("1234")
        });

        it('should handle a CURRENT_TIME', () => {
            let exp = ExpFactory.createExp([new WordModule("CURRENT_TIME", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("CURRENT_TIME")
            const timeRegex: RegExp = /\d{2}:\d{2}:\d{2}/;
            const timeStamp = timeRegex.exec((exp as LiteralValue).type.value)
            expect(timeStamp[0]).toBeDefined()

        });

        it('should handle a CURRENT_DATE', () => {
            let exp = ExpFactory.createExp([new WordModule("CURRENT_DATE", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("CURRENT_DATE")
            const dateRegex: RegExp = /\d{4}-\d{2}-\d{2}/;
            const dateStamp = dateRegex.exec((exp as LiteralValue).type.value)
            expect(dateStamp[0]).toBeDefined()
        });

        it('should handle a CURRENT_TIMESTAMP', () => {
            let exp = ExpFactory.createExp([new WordModule("CURRENT_TIMESTAMP", 0, 1)]);
            expect(exp instanceof LiteralValue).toBe(true);
            expect((exp as LiteralValue).type.sqlType).toBe("CURRENT_TIMESTAMP")
            const dateRegex: RegExp = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
            const dateStamp = dateRegex.exec((exp as LiteralValue).type.value)
            expect(dateStamp[0]).toBeDefined()
        });

    });

    describe('bind-parameter', () => {

        it('should handle ? bind-parameter', () => {
            let exp = ExpFactory.createExp([new WordModule("?", 0, 1)]);
            expect(exp instanceof BindParameter).toBe(true);
            expect((exp as BindParameter).parameter).toBe("?");

        });

        it('should handle ? bind-parameter with type', () => {
            let exp = ExpFactory.createExp([new WordModule("?INTEGER", 0, 1)]);
            expect((exp instanceof BindParameter)).toBe(true);
            expect((exp as BindParameter).parameter).toBe("?INTEGER");
        });

        it('should handle @ bind parameter', () => {
            let exp = ExpFactory.createExp([new WordModule("@test", 0, 1)]);
            expect((exp instanceof BindParameter)).toBe(true);
            expect((exp as BindParameter).parameter).toBe("@test");

        });


    });


});