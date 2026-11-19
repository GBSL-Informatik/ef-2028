import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import type { PointerName } from '../../../../protocol';
import type { Clock } from '../../../models/Clock';
import styles from '../styles.module.scss';

interface PointerProps {
    clock: Clock;
    type: PointerName;
    /** number of ticks on the dial, used for pointers set by tick */
    ticks: number;
}

const Pointer = observer(({ clock, type, ticks }: PointerProps) => {
    const angle = clock.angle(type, ticks);
    return (
        <div
            className={clsx(styles.pointer, styles[type])}
            style={{
                transitionDuration: `${clock.transitionDurationMs}ms`,
                transform: `rotate(${angle}deg)`
            }}
        />
    );
});

export default Pointer;
