import {TokenArray} from "../../token";
import {ResultColumnFactory} from "./result-column";

describe('ResultColumn', () => {


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