import {TokenArray} from "../../token";
import {TableOrSubqueryFactory} from "./table-or-subquery-factory";
import {TableName} from "./table-or-subquery";

describe('TableOrSubqueryFactory', () => {

    it('should handle only table-name', () => {
        const token = TokenArray.fromString("table1").getFirstToken();
        const tokenResult = TableOrSubqueryFactory.handleToken(token);
        expect(tokenResult.hasResult()).toBeTruthy()
        expect(tokenResult.result).toBeInstanceOf(TableName)
        const tableName = tokenResult.result as TableName
        expect(tableName.tableName).toEqual("table1")
    });

    it('should handle table name with schema', () => {
        const token = TokenArray.fromString("schema.table1").getFirstToken();
        const tokenResult = TableOrSubqueryFactory.handleToken(token);
        expect(tokenResult.hasResult()).toBeTruthy()
        expect(tokenResult.result).toBeInstanceOf(TableName)
        const tableName = tokenResult.result as TableName
        expect(tableName.tableName).toEqual("table1")
        expect(tableName.schemaName).toEqual("schema")
    });

    it('should handle table name with schema and alias', () => {
        const token = TokenArray.fromString("schema.table1 as alias").getFirstToken();
        const tokenResult = TableOrSubqueryFactory.handleToken(token);
        expect(tokenResult.hasResult()).toBeTruthy()
        expect(tokenResult.result).toBeInstanceOf(TableName)
        const tableName = tokenResult.result as TableName
        expect(tableName.tableName).toEqual("table1")
        expect(tableName.schemaName).toEqual("schema")
        expect(tableName.alias).toEqual("alias")
    });

    it('should handle table name with alias', () => {
        const token = TokenArray.fromString("table1 as alias").getFirstToken();
        const tokenResult = TableOrSubqueryFactory.handleToken(token);
        expect(tokenResult.hasResult()).toBeTruthy()
        expect(tokenResult.result).toBeInstanceOf(TableName)
        const tableName = tokenResult.result as TableName
        expect(tableName.tableName).toEqual("table1")
        expect(tableName.alias).toEqual("alias")
        expect(tableName.schemaName).toBeUndefined();
    });
});