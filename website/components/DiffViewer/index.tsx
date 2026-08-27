import * as React from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { Prism } from 'prism-react-renderer';
import { default as ReactDiffViewer } from 'react-diff-viewer';
import { MultiCode } from '@tdev-plugins/remark-code-as-attribute/plugin';

const highlightSyntax = (str: string) => {
    if (!str) {
        return;
    }
    return (
        <span
            dangerouslySetInnerHTML={{
                __html: Prism.highlight(str, Prism.languages.python, 'python')
            }}
        />
    );
};

interface Props {
    diffs: MultiCode[];
    titles: string[];
}
const SPACER = ' ';

const DiffViewer = (props: Props) => {
    const { diffs } = props;

    if (diffs?.length < 2) {
        return <div>Please provide two diffs!</div>;
    }
    const [l, r] = diffs;
    return (
        <div className={clsx(styles.diffViewer)}>
            Halo
            {l && r && (
                <ReactDiffViewer
                    leftTitle={props.titles[0]}
                    rightTitle={props.titles[1]}
                    splitView
                    oldValue={l.code.replace(/ /g, SPACER)}
                    newValue={r.code.replace(/ /g, SPACER)}
                    styles={{ marker: 'max-width: 1em; padding: 0;' }}
                    showDiffOnly={false}
                    renderContent={highlightSyntax}
                />
            )}
        </div>
    );
};

export default DiffViewer;
