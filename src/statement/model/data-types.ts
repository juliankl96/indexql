export interface DataType {
    get sqlType(): string;

    get value(): any;
}


export class StringType implements DataType {

    constructor(private _value: string) {
    }

    get sqlType(): string {
        return 'STRING';
    }

    get value(): any {
        return this._value;
    }
}

export class TrueType implements DataType {

    get sqlType(): string {
        return 'TRUE';
    }

    get value(): any {
        return true;
    }
}

export class FalseType implements DataType {

    get sqlType(): string {
        return 'FALSE';
    }

    get value(): any {
        return false;
    }

}

export class NullType implements DataType {

    get sqlType(): string {
        return 'NULL';
    }

    get value(): any {
        return null;
    }
}

export class IntegerType implements DataType {

    constructor(private _value: number) {
    }

    get sqlType(): string {
        return 'INTEGER';
    }

    get value(): any {
        return this._value;
    }
}

export class BlobType implements DataType {

    constructor(private _value: string) {
    }

    get sqlType(): string {
        return 'BLOB';
    }

    get value(): any {
        return 'BLOB';
    }

    get blobValue(): string {
        return this._value;
    }
}

export class CurrentTimeType implements DataType {
    // Like "17:58:29"
    get sqlType(): string {
        return 'CURRENT_TIME';
    }

    get value(): any {
        return new Date().toLocaleTimeString("sv");
    }
}

export class CurrentDateType implements DataType {

    //value like "2024-06-25"
    get sqlType(): string {
        return 'CURRENT_DATE';
    }

    get value(): any {
        return new Date().toLocaleString("sv");
    }
}

export class CurrentTimestampType implements DataType {

    // value like "2024-06-25 17:59:08"
    get sqlType(): string {
        return 'CURRENT_TIMESTAMP';
    }

    get value(): any {
        return new Date().toLocaleString("sv") + " " + new Date().toLocaleTimeString("sv");
    }
}



