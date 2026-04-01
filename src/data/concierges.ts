// Lista de conserjes del edificio
export const CONCIERGES = ['Claudio', 'Raquel', 'Silvia', 'Elías'] as const;

export type ConciergeName = (typeof CONCIERGES)[number];
