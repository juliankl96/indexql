import {ResultSet} from "./result-set";

export interface Operation {


    execute(): Promise<ResultSet>;
}