import {FromClause} from "./from-clause";

describe('FromClause', () => {

    it('should handle multiple tables', () => {
        const fromClause = new FromClause('person p', 'address a');
        const aliases = fromClause.aliases;
        expect(aliases.length).toBe(2);
    });

});