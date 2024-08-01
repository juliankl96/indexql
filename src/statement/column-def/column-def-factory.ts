import {Token} from "../../token";
import {TokenResult} from "../util/TokenResult";
import {ColumnConstraint, ColumnDef} from "./column-def";

export class ColumnDefFactory {

    protected static handleColumnConstraint(token: Token): TokenResult<ColumnConstraint> {
        return TokenResult.empty(token);
    }

    public static handleToken(token: Token): TokenResult<ColumnDef> {
        let index  = token;
        const columnName = index.value;


        return TokenResult.empty(token);
    }
}