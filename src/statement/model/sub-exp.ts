import {Exp} from "./exp";

export interface SubExp {

    toSql(): string;
}

export class Escape implements SubExp {
    private exp: Exp

    toSql(): string {
        return `ESCAPE ${this.exp.toSql()}`;
    }

}

export class Like implements SubExp {
    private exp: Exp | Escape

    toSql(): string {
        return `LIKE ${this.exp.toSql()}`;
    }
}

export class Glob implements SubExp {
    private exp: Exp

    toSql(): string {
        return `GLOB ${this.exp.toSql()}`;
    }
}

export class Match implements SubExp {
    private exp: Exp

    toSql(): string {
        return `MATCH ${this.exp.toSql()}`;
    }
}

export class Regexp implements SubExp {
    private exp: Exp

    toSql(): string {
        return `REGEXP ${this.exp.toSql()}`;
    }
}