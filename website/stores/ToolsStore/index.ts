import { RootStore } from '@site/src/stores/rootStore';
import { action, observable, observableRef } from 'mobx';
import ClockStore from './ClockStore';
import LedStore from './LedStore';

type Source = 'text' | 'cipher';

export class ToolsStore {
    @observableRef accessor clockStore = new ClockStore();
    @observableRef accessor ledStore = new LedStore();

    textFieldPlaygrounds = observable.map<string, string>();

    constructor(private root: RootStore) {}

    @action
    setTextFieldValue(id: string, value: string) {
        this.textFieldPlaygrounds.set(id, value);
    }
}
