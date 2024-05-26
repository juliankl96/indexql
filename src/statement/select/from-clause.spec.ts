import {FromClause, NO_TABLE_DEFINED_EXCEPTION} from "./from-clause";

describe('FromClause', () => {

    it('should handle multiple tables', () => {
        const fromClause = new FromClause('person p', 'address a');
        const aliases = fromClause.aliases;
        expect(aliases.length).toBe(2);

        expect(aliases[0].alias).toBe("p")
        expect(aliases[0].table).toBe("person")

        expect(aliases[1].alias).toBe("a")
        expect(aliases[1].table).toBe("address")
    });

    it('should handle one table', () => {
        const fromClause = new FromClause('person');
        const aliases = fromClause.aliases;
        expect(aliases.length).toBe(1);

        expect(aliases[0].table).toBe("person")
        expect(aliases[0].alias).toBeUndefined();
    });

    it('should handle multiple tables without aliases', () => {
        const fromClause = new FromClause("Person", "Job")
        const aliases = fromClause.aliases

        expect(aliases.length).toBe(2)
        expect(aliases[0].table).toBe("Person")
        expect(aliases[0].alias).toBeUndefined();

        expect(aliases[1].table).toBe("Job")
        expect(aliases[1].alias).toBeUndefined();
    });

    it('should throw an error if no table is defined', () => {
        expect(() =>new FromClause()).toThrowError(NO_TABLE_DEFINED_EXCEPTION)
    });

    it('should throw an error if table is empty', () => {
        expect(() =>new FromClause("")).toThrowError(NO_TABLE_DEFINED_EXCEPTION)
    });
    it('should throw an error if table is blan', () => {
        expect(() => new FromClause("    ")).toThrowError(NO_TABLE_DEFINED_EXCEPTION)
    });


});