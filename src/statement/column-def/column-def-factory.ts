import {Token} from "../../token";
import {TokenResult} from "../util/TokenResult";
import {ColumnConstraint, ColumnDef} from "./column-def";

export class ColumnDefFactory {

public static handleTypeName(token: Token): string {
    // List of SQLite type names
    const typeNames = ['INT', 'INTEGER', 'TINYINT', 'SMALLINT', 'MEDIUMINT', 'BIGINT', 'UNSIGNED BIG INT', 'INT2', 'INT8',
                       'CHARACTER', 'VARCHAR',  'NCHAR', 'NATIVE CHARACTER', 'NVARCHAR', 'TEXT', 'CLOB',
                       'BLOB', 'REAL', 'DOUBLE', 'FLOAT', 'NUMERIC', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME'];

    // Check if the token value is in the list of type names
    if (typeNames.includes(token.value.toUpperCase())) {
        return token.value;
    }

    // If the token value is not a type name, return an empty string
    return '';
}
    public static handleToken(token: Token): TokenResult<ColumnDef> {
        let index  = token;
        let columnName: string = index.value;
        index = index.next;




        return TokenResult.empty(token);
    }
}