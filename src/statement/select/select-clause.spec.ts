import {EMPTY_SELECTION_ERROR, MIXED_SELECTION_ERROR, SelectClause} from "./select-clause";

describe('SelectClause', () => {

    it('should handle star import', () => {
        const selectClause = new SelectClause('*');
        expect(selectClause.starImport).toBe(true);
    });

    it('should handle raw imports', () => {
        const selectClause = new SelectClause('name', 'age');
        expect(selectClause.starImport).toBe(false);
        const selections = selectClause.resultColumn;
        expect(selections.length).toBe(2);

        expect(selections[0].key).toBe('name');
        expect(selections[0].table).toBe(undefined);

        expect(selections[1].key).toBe('age');
        expect(selections[1].table).toBe(undefined);
    });

    it('should handle table imports', () => {
        const selectClause = new SelectClause('person.name', 'person.age');
        expect(selectClause.starImport).toBe(false);
        const selections = selectClause.resultColumn;
        expect(selections.length).toBe(2);

        expect(selections[0].key).toBe('name');
        expect(selections[0].table).toBe('person');

        expect(selections[1].key).toBe('age');
        expect(selections[1].table).toBe('person');
    });

    it('should throw an error when star import is mixed with other imports', () => {
        expect(() => new SelectClause('*', 'name')).toThrowError(MIXED_SELECTION_ERROR);
    });

    it('should throw an error when input is empty', () => {
        expect(() => new SelectClause()).toThrowError(EMPTY_SELECTION_ERROR);
    });

});