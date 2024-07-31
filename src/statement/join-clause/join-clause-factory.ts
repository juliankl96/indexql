import {TokenResult} from "../util/TokenResult";
import {
    CommaOperator,
    CrossJoinOperator,
    EmptyJoin,
    FullJoinOperator, InnerJoinOperator,
    JoinOperator,
    LeftJoinOperator,
    RightJoinOperator
} from "./join-clause";
import {Token} from "../../token";
import {SQLITE_ERROR, SqliteError} from "../../error/sqlite-error";


export class JoinClauseFactory {


}


export class JoinOperatorFactory {


    protected static handleCross(token: Token) {
        let index = token;
        if (index.value.toUpperCase() !== "CROSS") {
            return TokenResult.empty(token);
        }
        index = index.next;
        if (index.value !== "JOIN") {
            throw new SqliteError(SQLITE_ERROR, "Unknown token: " + index.value)
        }

        const result = new CrossJoinOperator()
        return new TokenResult<JoinOperator>(result, index.next);
    }

    private static checkJoin(token: Token) {
        if (token.value.toUpperCase() !== "JOIN") {
            throw new SqliteError(SQLITE_ERROR, "Unknown token: " + token.value)
        }
        return token.next;
    }

    public static handleToken(token: Token): TokenResult<JoinOperator> {

        const commaResult = this.handleComma(token);
        if (commaResult.hasResult()) {
            return commaResult;
        }

        const crossResult = this.handleCross(token);
        if (crossResult.hasResult()) {
            return crossResult;
        }

        let natural = false;
        let index = token;
        if (index.value.toUpperCase() === 'NATURAL') {
            natural = true;
            index = index.next
        }
        const outer: boolean = index.next?.value.toUpperCase() === "OUTER"
        switch (index.value.toUpperCase()) {
            case 'JOIN':
                //Nothing
                return TokenResult.of(new EmptyJoin(natural), index.next)
            case  'LEFT':
                index = index.next
                if (outer) {
                    index = index.next
                }
                index = JoinOperatorFactory.checkJoin(index)
                return TokenResult.of(new LeftJoinOperator(natural, outer), index);
            case  'RIGHT':
                index = index.next
                if (outer) {
                    index = index.next
                }
                index = JoinOperatorFactory.checkJoin(index)
                return TokenResult.of(new RightJoinOperator(natural, outer), index);
            case  'FULL':
                index = index.next
                if (outer) {
                    index = index.next
                }
                index = JoinOperatorFactory.checkJoin(index)
                return TokenResult.of(new FullJoinOperator(natural, outer), index);
            case 'INNER':
                index = index.next
                if (outer) {
                    throw new SqliteError(SQLITE_ERROR, "OUTER not supported in Inner Query")
                }
                index = JoinOperatorFactory.checkJoin(index);
                return TokenResult.of(new InnerJoinOperator(natural), index);
            default:
                throw new SqliteError(SQLITE_ERROR, "Unknown token." + index.value)
        }


        return TokenResult.empty(token);
    }

    private static handleComma(token: Token) {
        if (token.value === ',') {
            return TokenResult.of(new CommaOperator(), token.next)
        }
        return TokenResult.empty(token);
    }
}