import {Statement} from "./statement";
import {Token} from "../token";
import {ResultColumn, ResultColumnFactory} from "./model/result-column";

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
        const resultColumns: ResultColumn[] = []
        while (true) {
            const resultColumnResult = ResultColumnFactory.createResultColumn(index);
            if (resultColumnResult.result == undefined) {
                break;
            }
            index = resultColumnResult.token?.next
            resultColumns.push(resultColumnResult.result)
            if (index.value !== ',') {
                break
            } else {
                index = index.next
            }
        }
        


    }

}