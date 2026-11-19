import Card from '@tdev-components/shared/Card';
import CopyBadge from '@tdev-components/shared/CopyBadge';
import { useExtensionStore } from '@tdev/pyodide-code/hooks/useExtensionStore';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import clockExtension from '../../../client';
import Pointer from './Pointer';
import styles from './styles.module.scss';

interface ClockProps {
    clockId: string;
    /** number of ticks on the dial, default: 60 */
    ticks?: number;
    /** every n-th tick is drawn bold, default: 5 */
    majorTickEvery?: number;
    hideHours?: boolean;
    hideMinutes?: boolean;
    hideSeconds?: boolean;
}

const CARD_CLASS_NAMES = { body: clsx(styles.clockCard), card: clsx(styles.card) };

const toPositiveInt = (value: number | undefined, fallback: number) => {
    if (value === undefined || !Number.isFinite(value) || value < 1) {
        return fallback;
    }
    return Math.round(value);
};

const Clock = observer((props: ClockProps) => {
    const { clockId, hideHours, hideMinutes, hideSeconds } = props;
    const ticks = toPositiveInt(props.ticks, 60);
    const majorTickEvery = toPositiveInt(props.majorTickEvery, 5);
    const clockStore = useExtensionStore(clockExtension);
    const clock = clockStore.useClock(clockId);
    const header = useMemo(
        () => (
            <h3>
                Uhr: <CopyBadge value={clockId} className={clsx(styles.id)} />
            </h3>
        ),
        [clockId]
    );
    const tickElements = useMemo(
        () =>
            Array.from({ length: ticks }, (_, index) => (
                <div
                    key={index}
                    className={clsx(styles.tick, index % majorTickEvery === 0 && styles.hourTick)}
                    style={{ transform: `rotate(${(index * 360) / ticks}deg)` }}
                />
            )),
        [ticks, majorTickEvery]
    );
    return (
        <Card classNames={CARD_CLASS_NAMES} header={header}>
            <div className={clsx(styles.dial)}>
                {tickElements}
                {!hideHours && <Pointer clock={clock} type="hours" ticks={ticks} />}
                {!hideMinutes && <Pointer clock={clock} type="minutes" ticks={ticks} />}
                {!hideSeconds && <Pointer clock={clock} type="seconds" ticks={ticks} />}
            </div>
        </Card>
    );
});

export default Clock;
