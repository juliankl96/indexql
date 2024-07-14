import {Statement} from "./statement";
import {Token} from "../token";

export class StatementFactory {


    protected static handleSelect(token: Token): Statement {

        let index = token.next;
        //TODO: Ignore with recursive


        if (index.value.toUpperCase() !== 'SELECT') {
            throw new Error('Expected SELECT');
        }
        let distinct = false;
        let all = false;
        if (index.value.toUpperCase() === 'DISTINCT') {
            distinct = true;
            index = index.next;
        } else if (index.value.toUpperCase() === 'ALL') {
            all = true;
            index = index.next;
        }
        let columns: Token[] = [];


    }

}