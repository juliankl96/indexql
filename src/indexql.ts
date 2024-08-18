
import {Connection} from "./connection";
import {ParserOptions} from "sql-parser-cst";



export class Indexql {

    private _databaseName: string;
    private parseOptions: ParserOptions = {
        dialect: "sqlite",
        includeNewlines: false
    }


    public createConnection(databaseName: string) {
        return new Connection(databaseName, this.parseOptions);
    }


}
export const indexql = new Indexql();