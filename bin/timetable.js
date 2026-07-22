const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const loadMoment = () => {
    try {
        return require('moment');
    } catch (error) {
        const globalNodeModules = execSync('npm root -g', { encoding: 'utf8' }).trim();
        return require(path.join(globalNodeModules, 'moment'));
    }
};

const moment = loadMoment();

const DAYS = {
    mo: 'Monday',
    di: 'Tuesday',
    mi: 'Wednesday',
    do: 'Thursday',
    fr: 'Friday',
    sa: 'Saturday',
    so: 'Sunday'
};
const CLASS_DAY = {
    ['28EF']: ['fr']
};
const YEAR = 2026;
const SEMESTER = 'HS';

const needsEscape = (str) => {
    return /[:&*#|]/.test(str || '');
};

const EVENTS = {
    [38]: {
        desc: 'Sonderwoche',
        type: 'holiday',
        icon: 'mdiWalletTravel'
    },
    [39]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
    [40]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
    [41]: { desc: 'Herbstferien', details: '🏝️🏖️🏖️😎', type: 'holiday' },
    [52]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
    [1]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
    [2]: { desc: 'Winterferien', details: '🏂❄️⛷️🎄🧑‍🎄', icon: 'mdiPineTreeVariantOutline', type: 'holiday' },
    [8]: { desc: 'Sportwoche', type: 'holiday', icon: 'mdiWeatherSnowyHeavy' }
};
// const EVENTS = {
//     [7]: { desc: 'Sportwoche', type: 'holiday', icon: 'mdiWeatherSnowyHeavy' },
//     [14]: { desc: 'Sonderwoche', type: 'holiday', icon: 'mdiSchool' },
//     [15]: { desc: 'Frühlingsferien', type: 'holiday', icon: 'mdiFlowerTulipOutline' },
//     [16]: { desc: 'Frühlingsferien', type: 'holiday', icon: 'mdiFlowerTulipOutline' },
//     [24]: { desc: 'Mündliche Maturwoche', type: 'holiday', icon: 'mdiSchool' },
//     [28]: { desc: 'Sommerferien', type: 'holiday', icon: 'mdiBeach' }
// };

/*
Fr. 30.10 28Gh/28mT in Bern (4 Personen)
*/
const CLASS_EVENTS = {
    ['28EF']: {}
};

const SCHOOL_EVENTS = {
    // [3]: { desc: 'Notenschluss', type: 'event', icon: 'mdiSchool' }
    [3]: { desc: 'Notenschluss EF', type: 'event', date: '20.01.2027', icon: 'mdiFlagCheckered' }
};

const SCHEDULE_EF_HS1 = [
    ['Programmieren', 'Python Grundlagen und Repetition'],
    ['Programmieren', 'Infrastruktur, Git, Markdown, Datenstrukturen - Listen'],
    ['Programmieren', 'Listen, 2D-Listen, Referenzen'],
    ['Programmieren', 'Numtrip: Spielfelderstellung, Spielregeln, Spielbrett'],
    ['Programmieren', 'Funktionen & Software Engineering'],
    ['Programmieren', '🚧'],
    ['Programmieren', 'Test Tooling und Programmier-Repe + Listen, [0.5]'],
    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', 'Test Programmieren [1]'],
    ['Programmieren', '🚧'],

    ['Programmieren', '🚧'],
    ['Programmieren', '🚧'],
    ['Programmieren', 'Abgabe Projekt [1]'],
    ['Programmieren', '🚧'][('Programmieren', '🚧')]
];

const SCHEDULE_EF_HS2 = [
    ['Datenbanken', "Relationale DB's, Einführund SQL"],
    ['Datenbanken', "Relationale DB's, Datenmodellierung, ER-Diagramme, SQL Abfragen"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CREATE, INSERT, UPDATE, DELETE"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CRUD"],
    ['Datenbanken', 'Test'],
    ['Robotik', 'Einstieg, Zustandsmaschinen, EV3'],
    ['Robotik', 'Vorbereitungen RobOlympics'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Test'],
    ['Algorithmik', 'Effizienz'],
    ['Algorithmik', 'O(n) Notation, Sortieren'],
    ['Algorithmik', 'Suchen, Sortieren'],
    ['Algorithmik', 'N+1 Problem'],
    ['Algorithmik', 'Wiederholung'],
    ['Algorithmik', 'Test']
];
const SCHEDULE_EF_FS2 = [
    ['Datenbanken', "Relationale DB's, Einführund SQL"],
    ['Datenbanken', "Relationale DB's, Datenmodellierung, ER-Diagramme, SQL Abfragen"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CREATE, INSERT, UPDATE, DELETE"],
    ['Datenbanken', "Relationale DB's, Tabellen erstellen, SQL CRUD"],
    ['Datenbanken', 'Test'],
    ['Robotik', 'Einstieg, Zustandsmaschinen, EV3'],
    ['Robotik', 'Vorbereitungen RobOlympics'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Zustandsmaschinen, Zustandsdiagramme'],
    ['Robotik', 'Test'],
    ['Algorithmik', 'Effizienz'],
    ['Algorithmik', 'O(n) Notation, Sortieren'],
    ['Algorithmik', 'Suchen, Sortieren'],
    ['Algorithmik', 'N+1 Problem'],
    ['Algorithmik', 'Wiederholung'],
    ['Algorithmik', 'Test']
];

const SCHEDULE_EF_FS4 = [
    ['Algorithmik', 'A-Stern'],
    ['Algorithmik', 'Abschluss, Repetition'],
    ['Algorithmik', 'Test'],
    ['Rechnen mit Strom', 'Logische Bausteine'],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', ''],
    ['Rechnen mit Strom', 'Test'],
    ['Wiederholung & Fragestunde', '']
];

const CLASS_SCHEDULE_MAP = {
    ['28EF']: SCHEDULE_EF_HS1
};

Object.keys(CLASS_SCHEDULE_MAP).forEach((klasse) => {
    const cells = [];
    let subjectNr = 0;
    const klass = klasse.split('-')[0];
    const SCHEDULE = CLASS_SCHEDULE_MAP[klasse];
    const colSize = SCHEDULE[0].length + 1;
    Array(
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        1,
        2,
        3,
        4,
        5,
        6,
        7
        // 6,
        // 7,
        // 8,
        // 9,
        // 10,
        // 11,
        // 12,
        // 13,
        // 14,
        // 15,
        // 16,
        // 17,
        // 18,
        // 19,
        // 20,
        // 21,
        // 22,
        // 23,
        // 24,
        // 25,
        // 26,
        // 27
    ).forEach((weekNr) => {
        const dates = CLASS_DAY[klasse].map((abbr_day) => {
            const day = DAYS[abbr_day];
            return moment()
                .year(YEAR + (SEMESTER == 'FS' ? 0 : weekNr < 30 ? 1 : 0))
                .week(weekNr)
                .day(day)
                .format('DD.MM.YYYY');
        });
        let progressSubjectNr = false;
        for (const date of dates) {
            if (EVENTS[date]) {
                cells.push({
                    cells: [date, EVENTS[date].desc, EVENTS[date].details || ''],
                    type: EVENTS[date].type,
                    icon: EVENTS[date].icon
                });
            } else if (EVENTS[weekNr]) {
                cells.push({
                    cells: [date, EVENTS[weekNr].desc, EVENTS[weekNr].details || ''],
                    type: EVENTS[weekNr].type,
                    icon: EVENTS[weekNr].icon
                });
            } else if (CLASS_EVENTS[klasse][date]) {
                cells.push({
                    cells: [date, CLASS_EVENTS[klasse][date].desc, CLASS_EVENTS[klasse][date].details || ''],
                    type: CLASS_EVENTS[klasse][date].type,
                    icon: CLASS_EVENTS[klasse][date].icon
                });
            } else if (CLASS_EVENTS[klasse][weekNr]) {
                cells.push({
                    cells: [
                        CLASS_EVENTS[klasse][weekNr].date,
                        CLASS_EVENTS[klasse][weekNr].desc,
                        CLASS_EVENTS[klasse][weekNr].details || ''
                    ],
                    type: CLASS_EVENTS[klasse][weekNr].type,
                    icon: CLASS_EVENTS[klasse][weekNr].icon
                });
            } else if (SCHEDULE[subjectNr]) {
                const isTest = /test/gi.test(SCHEDULE[subjectNr].join(' '));
                cells.push({
                    cells: [date, ...SCHEDULE[subjectNr].slice(0, 3)],
                    type: isTest ? 'test' : undefined
                });
                progressSubjectNr = true;
            }
        }
        if (progressSubjectNr) {
            subjectNr += 1;
        }
        if (SCHOOL_EVENTS[weekNr]) {
            if (Array.isArray(SCHOOL_EVENTS[weekNr])) {
                SCHOOL_EVENTS[weekNr].forEach((event) => {
                    cells.push({
                        cells: [event.date, event.desc, event.details || ''],
                        type: event.type,
                        icon: event.icon
                    });
                });
            } else {
                cells.push({
                    cells: [
                        SCHOOL_EVENTS[weekNr].date,
                        SCHOOL_EVENTS[weekNr].desc,
                        SCHOOL_EVENTS[weekNr].details || ''
                    ],
                    type: SCHOOL_EVENTS[weekNr].type,
                    icon: SCHOOL_EVENTS[weekNr].icon
                });
            }
        }
    });
    cells.forEach((row, idx) => {
        while (row.cells.length < colSize) {
            if (colSize === 4 && row.type) {
                row.cells.splice(1, 0, '');
            } else {
                row.cells.push('');
            }
        }
    });

    let first = true;
    const sortedByDate = cells.sort((a, b) => {
        const dateA = moment(a.cells[0], 'DD.MM.YYYY');
        const dateB = moment(b.cells[0], 'DD.MM.YYYY');
        return dateA.diff(dateB);
    });
    const yamlCells = sortedByDate.map((row) => {
        const cellType = row.type ? `\n  type: ${row.type}` : '';
        const icon = row.icon ? `\n  icon: ${row.icon}` : '';
        const col4 = row.cells[3] !== undefined ? `\n    - ${row.cells[3]}` : '';
        return `- cells:
    - ${needsEscape(row.cells[0]) ? `"${row.cells[0]}"` : (row.cells[0] ?? '')}
    - ${needsEscape(row.cells[1]) ? `"${row.cells[1]}"` : (row.cells[1] ?? '')}
    - ${needsEscape(row.cells[2]) ? `"${row.cells[2]}"` : (row.cells[2] ?? '')}${col4}${cellType}${icon}`;
    });
    console.log(yamlCells.join('\n'));
    console.log(`Writing ${klasse}-${SEMESTER}${YEAR}.yaml`);
    // console.log(prettyJson)
    fs.writeFileSync(
        `versioned_docs/version-${klass}/${klasse}-${SEMESTER}${YEAR}.yaml`,
        yamlCells.join('\n') + '\n',
        'utf-8'
    );
    // fs.writeFileSync(`./bin/${klasse}_${SEMESTER}${YEAR}.json`, prettyJson, 'utf8');
});
