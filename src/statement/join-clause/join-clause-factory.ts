import {TokenResult} from "../util/TokenResult";
import {JoinOperator} from "./join-clause";
import {Token} from "../../token";


export class JoinClauseFactory{


}


export class JoinOperatorFactory{

    public static handleToken(token: Token): TokenResult<JoinOperator>{
        return TokenResult.empty(token);
    }
}