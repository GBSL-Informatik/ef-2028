import { defineWorkerExtension } from '@tdev/pyodide-code/extensions';
import { POINTER_NAMES, type ClockTime, type ClockUpdate, type PointerName } from './protocol';

export default defineWorkerExtension<ClockUpdate>((context) => ({
    clock: {
        use_clock: (id: string) => {
            const time: ClockTime = { hours: 0, minutes: 0, seconds: 0 };
            const update = (values: Partial<ClockTime>) => {
                Object.assign(time, values);
                context.send(id, values);
            };
            return {
                get hours() {
                    return time.hours;
                },
                get minutes() {
                    return time.minutes;
                },
                get seconds() {
                    return time.seconds;
                },
                reset: () => update({ hours: 0, minutes: 0, seconds: 0 }),
                set_time: (hours: number, minutes: number, seconds: number) =>
                    update({ hours, minutes, seconds }),
                set_hours: (hours: number) => update({ hours }),
                set_minutes: (minutes: number) => update({ minutes }),
                set_seconds: (seconds: number) => update({ seconds }),
                /**
                 * `within` (seconds) can be passed positionally or as keyword argument:
                 * pyodide collects Python kwargs into an object passed as the last argument
                 */
                set_pointer: (name: PointerName, tick: number, options?: number | { within?: number }) => {
                    if (!POINTER_NAMES.includes(name)) {
                        throw new Error(
                            `Unbekannter Zeiger '${name}'. Erlaubt sind: ${POINTER_NAMES.join(', ')}`
                        );
                    }
                    const within = typeof options === 'number' ? options : options?.within;
                    if (within !== undefined && (!Number.isFinite(within) || within < 0)) {
                        throw new Error(`'within' muss eine Zahl >= 0 sein (Sekunden), nicht ${within}`);
                    }
                    time[name] = tick;
                    context.send(id, {
                        ticks: { [name]: tick },
                        ...(within !== undefined && { transitionMs: within * 1000 })
                    });
                }
            };
        }
    }
}));
