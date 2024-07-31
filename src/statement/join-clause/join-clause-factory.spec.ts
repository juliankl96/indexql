import {TokenArray} from "../../token";
import {JoinOperatorFactory} from "./join-clause-factory";
import {
    CommaOperator,
    CrossJoinOperator,
    EmptyJoin,
    FullJoinOperator,
    LeftJoinOperator,
    RightJoinOperator
} from "./join-clause";
import {SqliteError} from "../../error/sqlite-error";

describe("join-clause-factory.ts", () => {


    describe("JoinOperationFactory", () => {


        it('should handle comma', () => {
            const token = TokenArray.fromString(",").getFirstToken();
            const result = JoinOperatorFactory.handleToken(token);
            expect(result.hasResult()).toBeTruthy();
            expect(result.result).toBeInstanceOf(CommaOperator)
        });

        describe("Cross Join Operator", () => {
            it('should handle cross join', () => {
                const token = TokenArray.fromString("CROSS JOIN").getFirstToken();
                const result = JoinOperatorFactory.handleToken(token);
                expect(result.hasResult()).toBeTruthy();
                expect(result.result).toBeInstanceOf(CrossJoinOperator)

            });


            it('should handle invalid cross join', () => {
                const token = TokenArray.fromString("CROSS Joi").getFirstToken();
                expect(() => JoinOperatorFactory.handleToken(token)).toThrow("SQLITE_ERROR: sqlite3 result code 1:Unknown token: Joi")
            });
        });


        describe("should handle outer join", () => {
            it('should handle natural left outer join', () => {
                const token = TokenArray.fromString("NATURAL LEFT OUTER JOIN").getFirstToken();
                const tokenResult = JoinOperatorFactory.handleToken(token);
                expect(tokenResult.hasResult()).toBeTruthy();
                expect(tokenResult.result).not.toBeUndefined();
                expect(tokenResult.result).toBeInstanceOf(LeftJoinOperator)
                const leftJoinOperator: LeftJoinOperator = tokenResult.result as LeftJoinOperator;
                expect(leftJoinOperator.natural).toBeTruthy();
                expect(leftJoinOperator.outer).toBeTruthy();

            });

            it('should handle natural right outer join', () => {
                const token = TokenArray.fromString("NATURAL RIGHT OUTER JOIN").getFirstToken();
                const tokenResult = JoinOperatorFactory.handleToken(token);
                expect(tokenResult.hasResult()).toBeTruthy();
                expect(tokenResult.result).not.toBeUndefined();
                expect(tokenResult.result).toBeInstanceOf(RightJoinOperator)
                const rightJoinOperator: RightJoinOperator = tokenResult.result as RightJoinOperator;
                expect(rightJoinOperator.natural).toBeTruthy();
                expect(rightJoinOperator.outer).toBeTruthy();
            });

            it('should handle natural full outer join', () => {
                const token = TokenArray.fromString("NATURAL FULL OUTER JOIN").getFirstToken();
                const tokenResult = JoinOperatorFactory.handleToken(token);
                expect(tokenResult.hasResult()).toBeTruthy();
                expect(tokenResult.result).not.toBeUndefined();
                expect(tokenResult.result).toBeInstanceOf(FullJoinOperator)
                const fullJoinOperator: FullJoinOperator = tokenResult.result as FullJoinOperator;
                expect(fullJoinOperator.natural).toBeTruthy();
                expect(fullJoinOperator.outer).toBeTruthy();
            })

            it('should handle natural empty join', () => {
                const token = TokenArray.fromString("NATURAL JOIN").getFirstToken();
                const tokenResult = JoinOperatorFactory.handleToken(token);
                expect(tokenResult.hasResult()).toBeTruthy();
                expect(tokenResult.result).not.toBeUndefined();
                expect(tokenResult.result).toBeInstanceOf(EmptyJoin)
                const emptyJoin: EmptyJoin = tokenResult.result as EmptyJoin;
                expect(emptyJoin.natural).toBeTruthy();
            });
        })


    })
});