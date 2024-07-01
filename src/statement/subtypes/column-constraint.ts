import {ConflictClause} from "../create-table-statement";

export interface ColumConstraint{
}

export class PrimaryKeyConstraint implements ColumConstraint{
    autoincrement: boolean;
    order?: 'ASC' | 'DESC';
    conflictClause?: ConflictClause;
}

