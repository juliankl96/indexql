import {SelectClause} from "./select-clause";
import {FromClause} from "./from-clause";
import {WhereClause} from "./where-clause";
import {GroupByClause} from "./group-by-clause";
import {HavingClause} from "./having-clause";
import {OrderByClause} from "./order-by-clause";
import {LimitClause} from "./limit-clause";
import {Statement} from "../statement";

export class SelectStatement implements Statement {
    private select: SelectClause;
    private from: FromClause;
    private where?: WhereClause;
    private groupBy?: GroupByClause;
    private having?: HavingClause;
    private orderBy?: OrderByClause;
    private limit?: LimitClause;

    toSql(): string {
        return "UNIMPLEMENTED";
    }
}