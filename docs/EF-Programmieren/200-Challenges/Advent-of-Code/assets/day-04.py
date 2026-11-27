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
board = Grid(len(zeilen), len(zeilen[0]), grid_id='aoc-2025-04-teil-1')

def zeige(plan):
    """
    Stellt den Plan im Gitter dar.
    plan ist eine Liste von Zeilen, z.B. ['..@@.', '@@@.@'] oder [['.', '.', '@'], ...]
    """
    for zeile_nr, zeile in enumerate(plan):
        for spalte_nr, zeichen in enumerate(zeile):
            cell = board[zeile_nr][spalte_nr]
            if zeichen == '@':
                cell.color = 'peru'
                cell.text = '@'
            else:
                cell.color = 'whitesmoke'
                cell.text = ''
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
