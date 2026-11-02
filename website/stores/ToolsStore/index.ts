import { RootStore } from '@site/src/stores/rootStore';
import { action, observable, observableRef } from 'mobx';

type Source = 'text' | 'cipher';

export class ToolsStore {
    textFieldPlaygrounds = observable.map<string, string>();

    constructor(private root: RootStore) {}

    @action
    setTextFieldValue(id: string, value: string) {
        this.textFieldPlaygrounds.set(id, value);
    }
}
