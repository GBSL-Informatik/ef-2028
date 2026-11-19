import { action, computed, observable, observableRef } from 'mobx';
import type { PointerName } from '../../protocol';

/** 'deg': the value is an angle in degrees, 'tick': the value is a tick on the dial */
export type PointerUnit = 'deg' | 'tick';

export class Clock {
    /** raw pointer values, interpreted according to `units` */
    @observable accessor hours: number = 0;
    @observable accessor minutes: number = 0;
    @observable accessor seconds: number = 0;
    /** per pointer animation duration, overrides `transitionDurationMs` when set */
    @observableRef accessor transitionsMs: Readonly<Record<PointerName, number | undefined>> = {
        hours: undefined,
        minutes: undefined,
        seconds: undefined
    };
    @observableRef accessor units: Readonly<Record<PointerName, PointerUnit>> = {
        hours: 'deg',
        minutes: 'deg',
        seconds: 'deg'
    };
    @observable accessor animationSpeed = 0;

    @computed
    get transitionDurationMs() {
        if (this.animationSpeed <= 0) {
            return 0;
        }
        return 1000 / this.animationSpeed;
    }

    pointerTransitionMs(name: PointerName) {
        return this.transitionsMs[name] ?? this.transitionDurationMs;
    }

    /**
     * @returns the angle in degrees of the given pointer on a dial with `ticks` ticks
     */
    angle(name: PointerName, ticks: number) {
        const value = this[name];
        if (this.units[name] === 'tick') {
            return (value * 360) / ticks;
        }
        return value;
    }

    @action
    setAnimationSpeed(speed: number) {
        this.animationSpeed = speed;
    }

    @action
    reset() {
        this.setClock(0, 0, 0);
    }

    @action
    private setValue(name: PointerName, value: number, unit: PointerUnit, transitionMs?: number) {
        this[name] = value;
        if (this.transitionsMs[name] !== transitionMs) {
            this.transitionsMs = { ...this.transitionsMs, [name]: transitionMs };
        }
        if (this.units[name] !== unit) {
            this.units = { ...this.units, [name]: unit };
        }
    }

    @action
    setHours(deg: number) {
        this.setValue('hours', deg, 'deg');
    }

    @action
    setMinutes(deg: number) {
        this.setValue('minutes', deg, 'deg');
    }

    @action
    setSeconds(deg: number) {
        this.setValue('seconds', deg, 'deg');
    }

    /**
     * point the given pointer to a tick of the dial (independent of the number of ticks)
     * @param transitionMs optional animation duration for this movement
     */
    @action
    setPointer(name: PointerName, tick: number, transitionMs?: number) {
        this.setValue(name, tick, 'tick', transitionMs);
    }

    @action
    setClock(hourDeg: number, minutesDeg: number, secondsDeg: number) {
        this.setHours(hourDeg);
        this.setMinutes(minutesDeg);
        this.setSeconds(secondsDeg);
    }

    // for brython usage
    set_hours = this.setHours;
    set_minutes = this.setMinutes;
    set_seconds = this.setSeconds;
    set_pointer = this.setPointer;
    set_clock = this.setClock;
    set_animation_speed = this.setAnimationSpeed;
}
