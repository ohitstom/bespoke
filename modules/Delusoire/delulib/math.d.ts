export type vector = number[];
export type matrix = vector[];
export declare const oppositeVector: (u: vector) => number[];
export declare const vectorAddVector: (u: vector, v: vector) => any;
export declare const vectorMultVector: (u: vector, v: vector) => any;
export declare const vectorDotVector: (u: vector, v: vector) => any;
export declare const vectorSubVector: (u: vector, v: vector) => any;
export declare const scalarMultVector: (x: number, u: vector) => number[];
export declare const vectorDivScalar: (u: vector, x: number) => number[];
export declare const scalarAddVector: (x: number, u: vector) => number[];
export declare const vectorDist: (u: vector, v: vector) => number;
export declare const scalarLerp: (s: number, e: number, t: number) => number;
export declare const vectorLerp: (u: vector, v: vector, t: number) => any;
export declare const remapScalar: (s: number, e: number, x: number) => number;
export declare const vectorCartesianVector: (u: vector, v: vector) => (readonly [number, number])[][];
export declare function matrixMultMatrix(m1: matrix, m2: matrix): unknown[];
