import {TableName, TableOrSubquery} from "./table-or-subquery";
import {TokenResult} from "../util/TokenResult";
import {Token} from "../../token";

export class TableOrSubqueryFactory {

    protected static handleTableName(token: Token): TokenResult<TableOrSubquery> {
        let index = token;
        let schemaName: string | undefined;
        let tableName: string;
        let alias: string | undefined;
        let indexName: string | undefined;
        let notIndexSet = false;
        if (index.next && index.next.value === '.') {
            schemaName = index.value;
            index = index.next.next;
        }
        tableName = index.value;
        index = index.next;
        if (index && index.value.toUpperCase() === "AS") {
            alias = index.next.value;
            index = index.jump(2);
        }
        if (index && index.test('INDEXED', 'BY')) {
            index = index.jump(2);
            indexName = index.value;
            index = index.next;
        } else if (index &&  index.test('NOT', 'INDEXED')) {
            index = index.jump(3);
            notIndexSet = true;
        } else {
            index = index?.next;
        }
        return TokenResult.of(new TableName(tableName, schemaName, alias, indexName, notIndexSet), index);
    }

    public static handleToken(token: Token): TokenResult<TableOrSubquery> {
        const tableNameResult = this.handleTableName(token);
        if (tableNameResult.hasResult()) {
            return tableNameResult;
        }
        return TokenResult.empty(token);
    }
}