export interface BitwiseOperation{
    name: string;
    operator: string;
}

export const AND: BitwiseOperation = {
    name: 'AND',
    operator: '&'
};

export const RIGHT_SHIFT: BitwiseOperation = {
    name: 'RIGHT_SHIFT',
    operator: '>>'
};

export const LEFT_SHIFT: BitwiseOperation = {
    name: 'LEFT_SHIFT',
    operator: '<<'
};

export const XOR: BitwiseOperation = {
    name: 'XOR',
    operator: '^'
};

export const BIT_COUNT: BitwiseOperation = {
    name: 'BIT_COUNT',
    operator: 'BIT_COUNT()'
};

export const OR: BitwiseOperation = {
    name: 'OR',
    operator: '|'
};

export const INVERSION: BitwiseOperation = {
    name: 'INVERSION',
    operator: '~'
};

export const BITWISE_OPERATIONS: BitwiseOperation[] = [
    AND,
    RIGHT_SHIFT,
    LEFT_SHIFT,
    XOR,
    BIT_COUNT,
    OR,
    INVERSION
];