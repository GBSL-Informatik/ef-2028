import { DocumentModelType } from '@tdev-api/document';
import Answer from '@tdev-components/Answer';
import { QuillV2Component } from '@tdev-components/documents/QuillV2';
import Button from '@tdev-components/shared/Button';
import { useStore } from '@tdev-hooks/useStore';
import type iCode from '@tdev-models/documents/iCode';
import type QuillV2Model from '@tdev-models/documents/QuillV2';
import type User from '@tdev-models/User';
import { mdiArrowLeft, mdiClipboardCheckOutline, mdiPrinter } from '@mdi/js';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { orderBy } from 'es-toolkit/array';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { documentRootIds, EXAM, ExamItem } from './_exam';
import styles from './styles.module.scss';

type LoadState = 'idle' | 'loading' | 'done' | 'error';

const DOC_TYPE: { [kind in ExamItem['kind']]: (item: ExamItem) => string } = {
    code: (item) => (item.kind === 'code' ? item.docType : 'code'),
    text: () => 'quill_v2'
};

const highlightLang = (lang: string) => (lang === 'py' ? 'python' : lang);

/**
 * finds the main document of a document root for a specific author
 */
const useFindDoc = () => {
    const documentStore = useStore('documentStore');
    return (item: ExamItem, authorId?: string): DocumentModelType | undefined => {
        if (!authorId) {
            return undefined;
        }
        const type = DOC_TYPE[item.kind](item);
        const docs = documentStore
            .findByDocumentRoot(item.id)
            .filter((d) => d.type === type && d.authorId === authorId);
        return orderBy(docs, [(d) => (d.uniqOnRoot === 'main' ? 0 : 1), 'createdAt'], ['asc', 'asc'])[0];
    };
};

/* ---------------------------------------------------------------------------------------------- */
/*                                Default: eigene Antworten (editierbar)                          */
/* ---------------------------------------------------------------------------------------------- */

const EditableItem = ({ item }: { item: ExamItem }) => {
    switch (item.kind) {
        case 'code':
            return (
                <CodeBlock
                    className={`language-${item.lang}`}
                    metastring={`${item.liveCode} id=${item.id}${item.versioned ? ' versioned' : ''}`}
                    title={item.title}
                >
                    {''}
                </CodeBlock>
            );
        case 'text':
            return <Answer type="text" id={item.id} placeholder={item.label} hideToolbar />;
    }
};

const SolutionEditor = () => {
    return (
        <div className={clsx(styles.solutionEditor)}>
            <p className={clsx(styles.hint)}>
                Hier werden deine Antworten (= Musterlösung) angezeigt und können bearbeitet werden. Wähle
                eine Lerngruppe und klicke auf <b>Auswerten</b>, um die Abgaben der Gruppe zu laden.
            </p>
            {EXAM.tasks.map((task, tIdx) => (
                <section key={tIdx} className={clsx(styles.task)}>
                    <h2>{task.title}</h2>
                    {task.items.map((item, iIdx) => (
                        <div key={iIdx} className={clsx(styles.editableItem)}>
                            <EditableItem item={item} />
                        </div>
                    ))}
                </section>
            ))}
        </div>
    );
};

/* ---------------------------------------------------------------------------------------------- */
/*                                       Auswertung (read-only)                                   */
/* ---------------------------------------------------------------------------------------------- */

const Empty = () => <div className={clsx(styles.empty)}>— keine Abgabe —</div>;

const StaticItem = observer(({ item, doc }: { item: ExamItem; doc?: DocumentModelType }) => {
    if (!doc) {
        return <Empty />;
    }
    switch (item.kind) {
        case 'code': {
            const code = (doc as unknown as iCode<any>).code ?? '';
            if (code.trim().length === 0) {
                return <Empty />;
            }
            return (
                <CodeBlock language={highlightLang(item.lang)} title={item.title} showLineNumbers>
                    {code}
                </CodeBlock>
            );
        }
        case 'text': {
            const quillDoc = doc as unknown as QuillV2Model;
            const isEmpty = (quillDoc.delta?.ops ?? []).every(
                (op) => typeof op.insert === 'string' && op.insert.trim().length === 0
            );
            return (
                <div className={clsx(styles.text)}>
                    <span className={clsx(styles.label)}>{item.label}</span>
                    {isEmpty ? (
                        <Empty />
                    ) : (
                        <QuillV2Component quillDoc={quillDoc} id={item.id} readonly hideToolbar />
                    )}
                </div>
            );
        }
    }
});

interface StudentProps {
    student: User;
    groupName: string;
    teacherId: string;
}

const StudentEvaluation = observer(({ student, groupName, teacherId }: StudentProps) => {
    const findDoc = useFindDoc();
    const docCount = EXAM.tasks
        .flatMap((t) => t.items)
        .filter((item) => item.kind === 'code' && findDoc(item, student.id)).length;
    return (
        <article className={clsx(styles.student)}>
            <header className={clsx(styles.studentHeader)}>
                <h2>
                    {student.lastName} {student.firstName}
                </h2>
                <div className={clsx(styles.meta)}>
                    <span>{EXAM.title}</span>
                    <span>{groupName}</span>
                    {docCount === 0 && <span className={clsx(styles.warning)}>keine Code-Abgaben</span>}
                </div>
            </header>
            <div className={clsx(styles.row, styles.columnHeader)}>
                <div>Lösung {student.firstName}</div>
                <div>Musterlösung</div>
            </div>
            {EXAM.tasks.map((task, tIdx) => (
                <section key={tIdx} className={clsx(styles.task)}>
                    <h3>{task.title}</h3>
                    {task.items.map((item, iIdx) => (
                        <div key={iIdx} className={clsx(styles.row, item.kind !== 'code' && styles.compact)}>
                            <div className={clsx(styles.cell)}>
                                <StaticItem item={item} doc={findDoc(item, student.id)} />
                            </div>
                            <div className={clsx(styles.cell, styles.solution)}>
                                <StaticItem item={item} doc={findDoc(item, teacherId)} />
                            </div>
                        </div>
                    ))}
                </section>
            ))}
            <div className={clsx(styles.grading)}>
                <span>Punkte:</span>
                <span className={clsx(styles.gradingLine)} />
                <span>Bemerkungen:</span>
                <span className={clsx(styles.gradingLine, styles.wide)} />
            </div>
        </article>
    );
});

/* ---------------------------------------------------------------------------------------------- */
/*                                               Page                                             */
/* ---------------------------------------------------------------------------------------------- */

const ExamEvaluation = observer(() => {
    const userStore = useStore('userStore');
    const groupStore = useStore('studentGroupStore');
    const documentStore = useStore('documentStore');
    const [groupId, setGroupId] = React.useState<string>('');
    const [loadState, setLoadState] = React.useState<LoadState>('idle');
    const [showEvaluation, setShowEvaluation] = React.useState(false);

    const current = userStore.current;
    const groups = orderBy(
        groupStore.studentGroups.filter((g) => g.isActive),
        [(g) => g.parentIds.length, 'name'],
        ['asc', 'asc']
    );
    const group = groups.find((g) => g.id === groupId);
    const students = group ? orderBy(group.students, ['lastName', 'firstName'], ['asc', 'asc']) : [];

    const evaluate = () => {
        setLoadState('loading');
        documentStore
            .apiLoadDocumentsFrom(documentRootIds(EXAM))
            .then(() => {
                setLoadState('done');
                setShowEvaluation(true);
            })
            .catch((err) => {
                console.warn('Error loading documents', err);
                setLoadState('error');
            });
    };

    return (
        <Layout title={`Auswertung: ${EXAM.title}`} description="Auswertung der Prüfung für eine Lerngruppe">
            <main className={clsx(styles.main)}>
                <h1 className={clsx(styles.title)}>Auswertung: {EXAM.title}</h1>
                {!current?.hasElevatedAccess ? (
                    <div className="alert alert--warning">
                        Diese Seite ist nur für Lehrpersonen verfügbar.
                    </div>
                ) : (
                    <>
                        <div className={clsx(styles.controls)}>
                            <label className={clsx(styles.groupSelect)}>
                                Lerngruppe
                                <select
                                    value={groupId}
                                    onChange={(e) => {
                                        setGroupId(e.target.value);
                                    }}
                                >
                                    <option value="">– Lerngruppe wählen –</option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.parent ? `${g.parent.name} / ${g.name}` : g.name} (
                                            {g.students.length})
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <Button
                                text="Auswerten"
                                icon={mdiClipboardCheckOutline}
                                color="primary"
                                onClick={evaluate}
                                disabled={!group || loadState === 'loading'}
                                spin={loadState === 'loading'}
                            />
                            {showEvaluation && (
                                <>
                                    <Button
                                        text="Drucken"
                                        icon={mdiPrinter}
                                        color="secondary"
                                        onClick={() => window.print()}
                                        disabled={!group}
                                    />
                                    <Button
                                        text="Meine Antworten"
                                        icon={mdiArrowLeft}
                                        onClick={() => setShowEvaluation(false)}
                                    />
                                </>
                            )}
                            {loadState === 'error' && (
                                <span className="badge badge--danger">Fehler beim Laden der Abgaben</span>
                            )}
                        </div>
                        {showEvaluation && group ? (
                            students.length === 0 ? (
                                <div className="alert alert--info">
                                    Die Lerngruppe enthält keine Schüler:innen.
                                </div>
                            ) : (
                                students.map((student) => (
                                    <StudentEvaluation
                                        key={student.id}
                                        student={student}
                                        groupName={group.name}
                                        teacherId={current.id}
                                    />
                                ))
                            )
                        ) : (
                            <SolutionEditor />
                        )}
                    </>
                )}
            </main>
        </Layout>
    );
});

export default ExamEvaluation;
