import Alert from '@tdev-components/shared/Alert';
import { useStore } from '@tdev-hooks/useStore';
import String, { StringAnswer } from '@tdev-models/documents/String';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface Props {
    /** id des 'string' documents, bis zu dessen Lösung das Rätsel gesperrt ist */
    stringId?: string;
    placeholder?: React.ReactNode;
    children: React.ReactNode;
}

const HideUntil = observer((props: Props) => {
    const { stringId, children } = props;
    const documentRootStore = useStore('documentRootStore');
    if (!stringId) {
        return children;
    }
    const docRoot = documentRootStore.find<'string'>(stringId);
    const doc = docRoot?.allMainDocuments.find((d) => d.type === 'string') as String | undefined;
    if (doc && !doc.hasSolution) {
        return (
            <>
                <Alert type="warning">Das Dokument mit id {stringId} hat keine Lösung.</Alert>
                {children}
            </>
        );
    }
    if (!doc || doc.answer !== StringAnswer.Correct) {
        return props.placeholder || null;
    }
    return children;
});

export default HideUntil;
