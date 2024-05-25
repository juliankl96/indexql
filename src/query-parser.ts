function whitespace(...values: string[]) {
    return values.join("\\s+")
}

export class QueryParser {


    private static readonly COMMANDS = [
        'SELECT',
        'FROM',
        'WHERE',
        whitespace('ORDER', 'BY'),
        'LIMIT',
        'OFFSET',
        whitespace('GROUP', 'BY'),
        'HAVING']

    public static createRegex(): RegExp {
        const commands = QueryParser.COMMANDS.map(value => `(${value})`).join('|')
        return new RegExp(`((${commands})([^,]))`, 'gmi')
    }

    private static readonly QUERY_REGEX: RegExp = QueryParser.createRegex()



}