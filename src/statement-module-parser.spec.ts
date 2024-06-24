import {BracketModule, StatementModuleParser} from "./statement-module-parser";

describe('QueryParser', () => {

    it('should create modules from simple request', () => {
        const parser = new StatementModuleParser();
        let modules = parser.createModule('SELECT * FROM table;');
        expect(modules.length).toBe(5);
    });

    it('should create modules with quotes', () => {
        const parser = new StatementModuleParser();
        let modules = parser.createModule("SELECT * FROM table WHERE name = 'John the good one';");
        expect(modules.length).toBe(9);
        expect(modules[7].value).toBe("'John the good one'");

    });


    it('should create modules from request with brackets', () => {
        const parser = new StatementModuleParser();
        let modules = parser.createModule('SELECT * FROM (SELECT * FROM table);');
        expect(modules.length).toBe(5);
        expect(modules[3] instanceof BracketModule).toBe(true);
        expect((modules[3] as BracketModule).getModule().length).toBe(4);

    });
});