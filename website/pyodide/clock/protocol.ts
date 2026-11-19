export type PointerName = 'hours' | 'minutes' | 'seconds';

export const POINTER_NAMES: readonly PointerName[] = ['hours', 'minutes', 'seconds'];

export interface ClockTime {
    hours: number;
    minutes: number;
    seconds: number;
}

export type ClockUpdate = Partial<ClockTime> & {
    /** pointer positions in ticks of the dial (e.g. 0-99 for a dial with 100 ticks) */
    ticks?: Partial<Record<PointerName, number>>;
};
