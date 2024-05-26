import {FromClause} from "./from-clause";

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

});