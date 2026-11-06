/**
 * Struktur der Prüfung `docs/EF-Programmieren/100-Exams/01-jg28-exam.mdx`.
 * Die IDs müssen mit den IDs in der MDX-Datei übereinstimmen.
 * TaskStates werden für die Auswertung ignoriert.
 */

export type ExamItem =
    | {
          kind: 'code';
          id: string;
          /** sprache für das syntax highlighting, z.B. `py`, `md` */
          lang: string;
          /** live-code typ aus dem metastring, z.B. `live_py`, `live_md` */
          liveCode: string;
          /** document typ in der DB: `live_py` -> `script`, sonst `code` */
          docType: 'script' | 'code' | 'pyodide_code';
          title?: string;
          versioned?: boolean;
      }
    /** Text-Antwort (`<Answer type="text" />` -> QuillV2) */
    | { kind: 'text'; id: string; label: string }
    /**
     * individueller CMS-Text (`<CmsCode />`), z.B. Aufgabendaten pro Schüler:in.
     * Wird in der Auswertung über beide Spalten angezeigt.
     */
    | { kind: 'cms'; id: string; label: string; lang: string };

export interface ExamTask {
    title: string;
    items: ExamItem[];
    /** Platzhalter-Text für Aufgaben ohne digitale Abgabe */
    placeholder?: string;
}

export interface Exam {
    title: string;
    tasks: ExamTask[];
}

const py = (id: string): ExamItem => ({
    kind: 'code',
    id,
    lang: 'py',
    liveCode: 'live_py',
    docType: 'script',
    versioned: true
});

const commit = (id: string): ExamItem => ({ kind: 'text', id, label: 'Commit Nachricht' });

export const EXAM: Exam = {
    title: 'Prüfung Programmieren: Wiederholung und Tooling',
    tasks: [
        {
            title: 'Aufgabe 1',
            items: [],
            placeholder: 'Keine digitale Abgabe'
        },
        {
            title: 'Aufgabe 2',
            items: [
                {
                    kind: 'code',
                    id: '04fbfdee-f4e4-49d3-8b36-8575b1c49eb7',
                    lang: 'md',
                    liveCode: 'live_md',
                    docType: 'code',
                    title: 'probe.md',
                    versioned: true
                }
            ]
        },
        {
            title: 'Aufgabe 3.a',
            items: [
                py('0de7510b-f552-4253-a848-b02af0cefac9'),
                commit('d38eab57-db2e-40e3-b4c0-51d6aab8b1b7')
            ]
        },
        {
            title: 'Aufgabe 3.b',
            items: [
                py('d5af7c4f-aa03-4d41-8bc0-d29ab9e55f52'),
                commit('6ead9a15-8b2f-4e52-9830-ddbd5f1c88eb')
            ]
        },
        {
            title: 'Aufgabe 3.c',
            items: [
                py('d7625c35-e848-46b8-bb4a-2858a79e91b8'),
                commit('57d5095b-6c5e-48bc-902e-f4b62747b38d')
            ]
        },
        {
            title: 'Aufgabe 3.d',
            items: [
                py('3a3f2127-d6c8-46ed-afe1-f7a654f37ea6'),
                commit('55da09ca-8b34-4bfe-9763-196327789a79')
            ]
        },
        {
            title: 'Aufgabe 4.a',
            items: [py('54fedd10-a91c-46f7-b8eb-51f4ac46bfe2')]
        },
        {
            title: 'Aufgabe 4.b',
            items: [py('0851d96b-875c-4af9-afe3-f4eda5716209')]
        },
        {
            title: 'Aufgabe 4.c',
            items: [py('11da7fa6-3dda-44c2-8277-70d0ee258f01')]
        },
        {
            title: 'Aufgabe 5',
            items: [
                {
                    kind: 'cms',
                    id: 'de555f92-e415-49fa-a009-90797bc2953b',
                    label: 'Zahlen-Liste',
                    lang: 'python'
                },
                py('fd582889-5570-4d00-b84f-fb31f5c3db90')
            ]
        },
        {
            title: 'Aufgabe 6',
            items: [py('f8a95788-ceb5-4324-b1a2-ef8def97db5e')]
        }
    ]
};

export const documentRootIds = (exam: Exam) => [
    ...new Set(exam.tasks.flatMap((task) => task.items.map((item) => item.id)))
];
