import {TokenArray} from "../../token";
import {JoinOperatorFactory} from "./join-clause-factory";
import {CommaOperator} from "./join-clause";

describe("join-clause-factory.ts", () => {



    describe("JoinOperationFactory", () => {


        it('should handle comma', () => {
            const token = TokenArray.fromString(",").getFirstToken();
            const result = JoinOperatorFactory.handleToken(token);
            expect(result.hasResult()).toBeTruthy();
            expect(result.result).toBeInstanceOf(CommaOperator)
        });

        describe("should handle outer join", () => {
            it('should handle natural left outer join', () => {
                const token = TokenArray.fromString("NATURAL LEFT OUTER JOIN").getFirstToken();
                const tokenResult = JoinOperatorFactory.handleToken(token);
                expect(tokenResult.hasResult()).toBeTruthy();
                expect(tokenResult.result).not.toBeUndefined();
            });
        })

    })
});