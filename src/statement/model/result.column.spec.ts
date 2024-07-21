import {TokenArray} from "../../token";
import {ResultColumnFactory} from "./result-column";
import {LiteralValue} from "./exp";
import {StringType} from "./data-types";

describe('ResultColumn', () => {

    it('should create a ResultColumn from exp', () => {
        const token = TokenArray.fromString("'test'").getFirstToken()
        const resultColumnResult = ResultColumnFactory.createResultColumn(token);
        expect(resultColumnResult.result).not.toBeUndefined();
        expect(resultColumnResult.result.exp).toBeInstanceOf(LiteralValue);
        const literalValue = resultColumnResult.result.exp as LiteralValue;
        expect(literalValue.type).toBeInstanceOf(StringType);
        const stringType = literalValue.type as StringType;
        expect(stringType.value).toBe('test');
        expect(resultColumnResult.result.alias).toBeUndefined();
        expect(resultColumnResult.result.star).toBeFalsy();
    });

    it('should create a ResultColumn from exp with alias', () => {
        const token = TokenArray.fromString("'test' as Blub").getFirstToken()
        const resultColumnResult = ResultColumnFactory.createResultColumn(token);
        expect(resultColumnResult.result).not.toBeUndefined();
        expect(resultColumnResult.result.exp).toBeInstanceOf(LiteralValue);
        const literalValue = resultColumnResult.result.exp as LiteralValue;
        expect(literalValue.type).toBeInstanceOf(StringType);
        const stringType = literalValue.type as StringType;
        expect(stringType.value).toBe('test');
        expect(resultColumnResult.result.alias).toBe('Blub');
        expect(resultColumnResult.result.star).toBeFalsy();
    });

    it('should create a ResultColumn with a star', () => {
        const token = TokenArray.fromString('*').getFirstToken()
        const resultColumnResult = ResultColumnFactory.createResultColumn(token);
        expect(resultColumnResult.result).not.toBeUndefined();
        expect(resultColumnResult.result.exp).toBeUndefined();
        expect(resultColumnResult.result.alias).toBeUndefined();
        expect(resultColumnResult.result.star).toBeTruthy();
    });

    it('should create a ResultColumn with a star and a table', () => {
        const token = TokenArray.fromString('table.*').getFirstToken()
        const resultColumnResult = ResultColumnFactory.createResultColumn(token);
        expect(resultColumnResult.result).not.toBeUndefined();
        expect(resultColumnResult.result.exp).toBeUndefined();
        expect(resultColumnResult.result.alias).toBeUndefined();
        expect(resultColumnResult.result.star).toBeTruthy();
        expect(resultColumnResult.result.tableName).toBe('table');
    });

});