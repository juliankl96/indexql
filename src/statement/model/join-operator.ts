export interface JoinOperator{
    toSql(): string;
}




export class Comma implements JoinOperator{
    toSql(): string {
        return ',';
    }
}