/**
 * Schätzt die Anzahl gedruckter Seiten pro Schüler:in und fügt bei ungerader Seitenzahl
 * eine Leerseite ein, damit beim doppelseitigen Druck jede Prüfung auf einem neuen Blatt beginnt.
 *
 * Voraussetzung: Die Auswertung wird am Bildschirm in derselben Breite und Schriftgrösse
 * gerendert wie im Druck (siehe `.evaluation` in `styles.module.scss`).
 */

/** muss mit `@page { size: A4 portrait; margin: ... }` in styles.module.scss übereinstimmen */
const PAGE_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 12;
const PX_PER_MM = 96 / 25.4;
const PAGE_CONTENT_HEIGHT = (PAGE_HEIGHT_MM - 2 * PAGE_MARGIN_MM) * PX_PER_MM;

export const UNIT_ATTR = 'data-print-unit';
/** Bewertung (Punkte/Note): wird ans Ende der letzten Seite geschoben */
export const FOOTER_ATTR = 'data-print-footer';
/** Abstandhalter vor der Bewertung */
export const SPACER_ATTR = 'data-print-spacer';
export const STUDENT_ATTR = 'data-student';
export const PAD_ATTR = 'data-pad';
export const PAGES_ATTR = 'data-pages';
export const SPACER_VAR = '--print-spacer-height';

/**
 * Sicherheitsabstand, damit die Bewertung wegen Rundungsfehlern
 * nicht auf eine zusätzliche Seite rutscht
 */
const SAFETY_MARGIN = 8 * PX_PER_MM;

interface Layout {
    pages: number;
    /** Höhe des Abstandhalters vor der Bewertung (in px) */
    spacer: number;
}

/**
 * Simuliert den Seitenumbruch: Elemente mit `data-print-unit` werden nicht umgebrochen
 * (`break-inside: avoid`) und rutschen bei Platzmangel auf die nächste Seite.
 * Anschliessend wird die Bewertung (`data-print-footer`) ans Ende der letzten Seite gesetzt.
 */
export const computeLayout = (article: HTMLElement): Layout => {
    const units = Array.from(article.querySelectorAll<HTMLElement>(`[${UNIT_ATTR}]`));
    let pages = 1;
    let used = 0;
    let prevBottom: number | undefined;
    for (const unit of units) {
        const rect = unit.getBoundingClientRect();
        const gap = prevBottom === undefined ? 0 : Math.max(0, rect.top - prevBottom);
        prevBottom = rect.bottom;
        if (used > 0 && used + gap + rect.height > PAGE_CONTENT_HEIGHT) {
            pages += 1;
            used = rect.height;
        } else {
            used += (used > 0 ? gap : 0) + rect.height;
        }
        /** zu grosse Elemente werden trotzdem umgebrochen */
        while (used > PAGE_CONTENT_HEIGHT) {
            pages += 1;
            used -= PAGE_CONTENT_HEIGHT;
        }
    }
    const footer = article.querySelector<HTMLElement>(`[${FOOTER_ATTR}]`);
    if (!footer) {
        return { pages, spacer: 0 };
    }
    const rect = footer.getBoundingClientRect();
    const gap = prevBottom === undefined ? 0 : Math.max(0, rect.top - prevBottom);
    const free = PAGE_CONTENT_HEIGHT - used - gap - rect.height - SAFETY_MARGIN;
    if (free >= 0) {
        return { pages, spacer: free };
    }
    /** passt nicht mehr: Bewertung ans Ende der nächsten Seite */
    const restOfPage = Math.max(0, PAGE_CONTENT_HEIGHT - used);
    return {
        pages: pages + 1,
        spacer: restOfPage + Math.max(0, PAGE_CONTENT_HEIGHT - gap - rect.height - SAFETY_MARGIN)
    };
};

/**
 * - setzt die Bewertung ans Ende der letzten Seite
 * - markiert alle Prüfungen mit ungerader Seitenzahl, damit die nachfolgende Leerseite gedruckt wird
 */
export const preparePrint = (root: ParentNode = document) => {
    root.querySelectorAll<HTMLElement>(`[${STUDENT_ATTR}]`).forEach((article) => {
        const { pages, spacer } = computeLayout(article);
        article.style.setProperty(SPACER_VAR, `${Math.floor(spacer)}px`);
        article.setAttribute(PAGES_ATTR, `${pages}`);
        article.setAttribute(PAD_ATTR, pages % 2 === 1 ? 'true' : 'false');
    });
};
