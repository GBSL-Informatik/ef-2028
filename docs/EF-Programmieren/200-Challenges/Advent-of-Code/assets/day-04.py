import numpy as np
from grid import Grid
from time import sleep

# Pause nach jeder Darstellung in Sekunden.
# Für Ihren richtigen Input (viele Iterationen) z.B. auf 0.05 verkleinern.
ANIMATION = 0.5

# Datei öffnen und den Inhalt in die Variable raw einlesen.
with open("./demo.txt") as file:
    raw = file.read()
print(raw)

zeilen = raw.splitlines()

# Farben: Index 0 = leer, Index 1 = Papierrolle
board = Grid(len(zeilen), len(zeilen[0]), grid_id='aoc-2025-04-teil-1', palette=['whitesmoke', 'peru'])
_angezeigt = np.zeros(board.size, dtype=np.uint8)

def zeige(plan):
    """
    Stellt den Plan im Gitter dar.
    plan ist eine Liste von Zeilen, z.B. ['..@@.', '@@@.@'] oder [['.', '.', '@'], ...]
    """
    zustand = np.array([[1 if zeichen == '@' else 0 for zeichen in zeile] for zeile in plan], dtype=np.uint8)
    # alle Farben auf einmal setzen
    board.set_cells(zustand)
    # Text nur bei den Zellen anpassen, die sich verändert haben
    for zeile_nr, spalte_nr in np.argwhere(zustand != _angezeigt):
        board[zeile_nr][spalte_nr].text = '@' if zustand[zeile_nr, spalte_nr] else ''
    _angezeigt[:] = zustand
    board.show()
    if ANIMATION > 0:
        sleep(ANIMATION)

zeige(zeilen)

# nur für Demo - die zugänglichen Rollen müssen selber berechnet werden!
demo = [list(zeile) for zeile in zeilen]
for (zeile_nr, spalte_nr) in [(0, 2), (0, 3), (0, 5), (0, 6), (0, 8), (1, 0), (2, 6), (4, 0), (4, 9), (7, 0), (9, 0), (9, 2), (9, 8)]:
    demo[zeile_nr][spalte_nr] = '.'
zeige(demo)

anzahl = 0
print('Anzahl zugängliche Rollen:', anzahl)
