export class SignedNumber{
    private _number: number;
    private _sign?: '+' | '-';

    constructor(number: number, sign?: '+' | '-') {
        this._number = number;
        this._sign = sign;
    }

    get number(): number {
        return this._number;
    }

    get sign(): string {
        return this._sign;
    }
}