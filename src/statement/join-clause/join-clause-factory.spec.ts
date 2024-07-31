import {TokenArray} from "../../token";
import {JoinConstrainFactory, JoinOperatorFactory} from "./join-clause-factory";
import {
    CommaOperator,
    CrossJoinOperator,
    EmptyJoin,
    FullJoinOperator,
    LeftJoinOperator, OnConstrain,
    RightJoinOperator, UsingConstrain
} from "./join-clause";
import {SqliteError} from "../../error/sqlite-error";
import {LiteralValue} from "../model/exp";
import {StringType} from "../model/data-types";

describe("join-clause-factory.ts", () => {


    describe("JoinConstrainFactory", () => {

        it('should handle OnConstrain', () => {
            const token = TokenArray.fromString("ON 'Test 123'").getFirstToken();
            const result = JoinConstrainFactory.handleToken(token);
            expect(result.hasResult()).toBeTruthy();
            expect(result.result).not.toBeUndefined();
            expect(result.result).toBeInstanceOf(OnConstrain)
            const onConstrain: OnConstrain = result.result as OnConstrain;
            expect(onConstrain.exp).not.toBeUndefined();
            expect(onConstrain.exp).toBeInstanceOf(LiteralValue)
            const literalValue: LiteralValue = onConstrain.exp as LiteralValue;
            expect(literalValue.type).toBeInstanceOf(StringType)
            const stringType: StringType = literalValue.type as StringType;
            expect(stringType.value).toBe("Test 123");
        });

         it('should handle UsingConstrain', () => {
            const token = TokenArray.fromString("USING (column1, column2)").getFirstToken();
            const result = JoinConstrainFactory.handleToken(token);
            expect(result.hasResult()).toBeTruthy();
            expect(result.result).not.toBeUndefined();
            expect(result.result).toBeInstanceOf(UsingConstrain)
            const usingConstrain: UsingConstrain = result.result as UsingConstrain;
            expect(usingConstrain.columnNames).not.toBeUndefined();
            expect(usingConstrain.columnNames).toHaveLength(2);
            expect(usingConstrain.columnNames).toContain("column1");
            expect(usingConstrain.columnNames).toContain("column2");
        });




    })

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