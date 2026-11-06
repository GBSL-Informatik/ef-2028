import { DocumentModelType } from '@tdev-api/document';
import Answer from '@tdev-components/Answer';
import CmsCode from '@tdev-components/documents/CmsText/Code';
import { QuillV2Component } from '@tdev-components/documents/QuillV2';
import Button from '@tdev-components/shared/Button';
import { useStore } from '@tdev-hooks/useStore';
import type CmsTextModel from '@tdev-models/documents/CmsText';
import type iCode from '@tdev-models/documents/iCode';
import type QuillV2Model from '@tdev-models/documents/QuillV2';
import type User from '@tdev-models/User';
import { mdiAccountCheckOutline, mdiArrowLeft, mdiClipboardCheckOutline, mdiPrinter } from '@mdi/js';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import { orderBy } from 'es-toolkit/array';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { documentRootIds, EXAM, ExamItem, ExamTask } from './_exam';
import { FOOTER_ATTR, preparePrint, SPACER_ATTR, STUDENT_ATTR, UNIT_ATTR } from './_pagination';
import styles from './styles.module.scss';

type LoadState = 'idle' | 'loading' | 'done' | 'error';
/**
 * group: Abgaben der gewählten Lerngruppe
 * test: Testdruck (2 Exemplare, um auch die Leerseiten zwischen zwei Prüfungen zu testen)
 */
type EvaluationMode = 'group' | 'test';
const TEST_COPIES = 2;

const DOC_TYPE: { [kind in ExamItem['kind']]: (item: ExamItem) => string } = {
    code: (item) => (item.kind === 'code' ? item.docType : 'code'),
    text: () => 'quill_v2',
    cms: () => 'cms_text'
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
        const docs = orderBy(
            documentStore.findByDocumentRoot(item.id).filter((d) => d.type === type),
            [(d) => (d.authorId === authorId ? 0 : 1), (d) => (d.uniqOnRoot === 'main' ? 0 : 1), 'createdAt'],
            ['asc', 'asc', 'asc']
        );
        const doc = docs[0];
        if (!doc) {
            return undefined;
        }
        /** cms texte können auch geteilt (nicht pro Schüler:in) erfasst sein */
        if (doc.authorId === authorId || item.kind === 'cms') {
            return doc;
        }
        return undefined;
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
        case 'cms':
            return (
                <>
                    <p>{item.label}:</p>
                    <CmsCode
                        id={item.id}
                        codeBlockProps={{ language: item.lang, children: '' }}
                        showActions
                    />
                </>
            );
    }
};

const Placeholder = ({ task }: { task: ExamTask }) => (
    <div className={clsx(styles.placeholder)}>{task.placeholder}</div>
);

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
                    {task.placeholder && <Placeholder task={task} />}
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
            return <CodeBlock language={highlightLang(item.lang)}>{code}</CodeBlock>;
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
        case 'cms': {
            const text = (doc as unknown as CmsTextModel).text ?? '';
            return (
                <CodeBlock language={highlightLang(item.lang)} title={item.label}>
                    {text}
                </CodeBlock>
            );
        }
    }
});

interface RowProps {
    item: ExamItem;
    studentId: string;
    teacherId: string;
}

const Row = observer(({ item, studentId, teacherId }: RowProps) => {
    const findDoc = useFindDoc();
    if (item.kind === 'cms') {
        return (
            <div className={clsx(styles.row, styles.fullWidth)}>
                <div className={clsx(styles.cell)}>
                    <StaticItem item={item} doc={findDoc(item, studentId)} />
                </div>
            </div>
        );
    }
    return (
        <div className={clsx(styles.row, item.kind !== 'code' && styles.compact)}>
            <div className={clsx(styles.cell)}>
                <StaticItem item={item} doc={findDoc(item, studentId)} />
            </div>
            <div className={clsx(styles.cell, styles.solution)}>
                <StaticItem item={item} doc={findDoc(item, teacherId)} />
            </div>
        </div>
    );
});

const unit = { [UNIT_ATTR]: true };

/**
 * Eine Aufgabe: Titel und erste Zeile bilden eine Einheit (kein Seitenumbruch direkt nach dem Titel),
 * die weiteren Zeilen sind je eine eigene, nicht umbrechbare Einheit.
 */
const TaskEvaluation = ({
    task,
    studentId,
    teacherId
}: {
    task: ExamTask;
    studentId: string;
    teacherId: string;
}) => {
    const [first, ...rest] = task.items;
    return (
        <section className={clsx(styles.task)}>
            <div className={clsx(styles.unit)} {...unit}>
                <h3>{task.title}</h3>
                {task.placeholder && <Placeholder task={task} />}
                {first && <Row item={first} studentId={studentId} teacherId={teacherId} />}
            </div>
            {rest.map((item, idx) => (
                <div key={idx} className={clsx(styles.unit)} {...unit}>
                    <Row item={item} studentId={studentId} teacherId={teacherId} />
                </div>
            ))}
        </section>
    );
};

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
        <article className={clsx(styles.student)} {...{ [STUDENT_ATTR]: student.id }}>
            <div className={clsx(styles.unit)} {...unit}>
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
            </div>
            {EXAM.tasks.map((task, tIdx) => (
                <TaskEvaluation key={tIdx} task={task} studentId={student.id} teacherId={teacherId} />
            ))}
            {/* schiebt die Bewertung im Druck an das Ende der letzten Seite */}
            <div className={clsx(styles.spacer)} {...{ [SPACER_ATTR]: true }} />
            <div className={clsx(styles.grading, styles.unit)} {...{ [FOOTER_ATTR]: true }}>
                <span>Punkte:</span>
                <span className={clsx(styles.gradingLine)} />
                <span>Note:</span>
                <span className={clsx(styles.gradingLine)} />
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
    const [mode, setMode] = React.useState<EvaluationMode | null>(null);

    const current = userStore.current;
    const groups = orderBy(
        groupStore.studentGroups.filter((g) => g.isActive),
        [(g) => g.parentIds.length, 'name'],
        ['asc', 'asc']
    );
    const group = groups.find((g) => g.id === groupId);
    const students =
        mode === 'test' && current
            ? Array.from({ length: TEST_COPIES }, () => current)
            : group
              ? orderBy(group.students, ['lastName', 'firstName'], ['asc', 'asc'])
              : [];
    const groupName = mode === 'test' ? 'Testdruck' : (group?.name ?? '');
    const showEvaluation = mode === 'test' || (mode === 'group' && !!group);

    React.useEffect(() => {
        /** auch beim Drucken via Ctrl+P die Leerseiten berechnen */
        const onBeforePrint = () => preparePrint();
        window.addEventListener('beforeprint', onBeforePrint);
        return () => window.removeEventListener('beforeprint', onBeforePrint);
    }, []);

    const evaluate = (evaluationMode: EvaluationMode) => {
        setLoadState('loading');
        documentStore
            .apiLoadDocumentsFrom(documentRootIds(EXAM))
            .then(() => {
                setLoadState('done');
                setMode(evaluationMode);
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
                                onClick={() => evaluate('group')}
                                disabled={!group || loadState === 'loading'}
                                spin={loadState === 'loading'}
                            />
                            <Button
                                text="Testdruck"
                                icon={mdiAccountCheckOutline}
                                title="Zeigt deine eigenen Antworten als Schüler:innen-Abgabe an (2 Exemplare), um Layout und doppelseitigen Druck zu testen"
                                onClick={() => evaluate('test')}
                                disabled={loadState === 'loading'}
                            />
                            {showEvaluation && (
                                <>
                                    <Button
                                        text="Drucken"
                                        icon={mdiPrinter}
                                        color="secondary"
                                        onClick={() => {
                                            preparePrint();
                                            window.print();
                                        }}
                                    />
                                    <Button
                                        text="Meine Antworten"
                                        icon={mdiArrowLeft}
                                        onClick={() => setMode(null)}
                                    />
                                </>
                            )}
                            {loadState === 'error' && (
                                <span className="badge badge--danger">Fehler beim Laden der Abgaben</span>
                            )}
                        </div>
                        {showEvaluation ? (
                            students.length === 0 ? (
                                <div className="alert alert--info">
                                    Die Lerngruppe enthält keine Schüler:innen.
                                </div>
                            ) : (
                                <div className={clsx(styles.evaluation)}>
                                    {students.map((student, idx) => (
                                        <React.Fragment key={`${student.id}-${idx}`}>
                                            <StudentEvaluation
                                                student={student}
                                                groupName={groupName}
                                                teacherId={current.id}
                                            />
                                            <div className={clsx(styles.blankPage)}>
                                                Diese Seite wurde absichtlich leer gelassen.
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
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
