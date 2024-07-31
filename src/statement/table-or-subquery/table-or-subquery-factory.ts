import {TableFunctionName, TableName, TableOrSubquery} from "./table-or-subquery";
import {TokenResult} from "../util/TokenResult";
import {Token} from "../../token";
import {ExpFactory} from "../model/exp-factory";
import {Exp} from "../model/exp";

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
        } else if (index && index.test('NOT', 'INDEXED')) {
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

        const functionNameResult = this.handleFunctionName(token);

        //TODO: SelectStatement Factory
        return TokenResult.empty(token);
    }

    private static handleFunctionName(token: Token) {
        let index = token;
        let schemaName: string | undefined = undefined;
        let functionName: string;
        if (index && index.next.next?.value === '.') {
            schemaName = index.value;
            index = index.jump(2)
        }
        functionName = index.value;
        index = index.next;
        if (index?.value !== '(') {
            return TokenResult.empty(token);
        }
        const expList: Exp[] = []
        while (index) {
            const expResult = ExpFactory.handleToken(index);
            if (expResult.hasResult()) {
                index = expResult.token;
                expList.push(expResult.result as Exp);
            } else {
                throw new Error("Expected expression but found " + index.value)
            }
            if (index.value === ')') {
                break;
            }
            if (index.value !== ',') {
                throw new Error("Expected , but found " + index.value)
            }
        }
        return TokenResult.of(new TableFunctionName(functionName, expList), index);
    }
}