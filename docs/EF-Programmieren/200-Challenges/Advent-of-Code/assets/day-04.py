import asyncio
from grid import Grid

# Pause nach jeder Iteration in Sekunden.
# Für Ihren richtigen Input (viele Iterationen) z.B. auf 0.05 verkleinern.
ANIMATION = 0.5

# Farben für die Darstellung
LEER = 'whitesmoke'       # kein Papier
ROLLE = 'peru'            # Papierrolle
ENTFERNT = 'crimson'      # in der letzten Iteration entfernt
VERBLASST = 'navajowhite' # in einer früheren Iteration entfernt

# Datei öffnen und den Inhalt in die Variable raw einlesen.
with open("./demo.txt") as file:
    raw = file.read()
print(raw)

zeilen = raw.splitlines()

# Das Gitter dient nur zur Anzeige - rechnen Sie mit Ihren eigenen Listen!
board = Grid(len(zeilen), len(zeilen[0]), LEER, grid_id='aoc-2025-04-teil-1')
for zeile_nr, zeile in enumerate(zeilen):
    for spalte_nr, zeichen in enumerate(zeile):
        if zeichen == '@':
            board[zeile_nr][spalte_nr] = ROLLE
await board.render()

zuletzt_entfernt = []

async def zeige_entfernt(positionen):
    """
    Färbt die Rollen an den Positionen [(zeile, spalte), ...] rot ein.
    Die zuvor entfernten Rollen werden verblasst dargestellt.
    """
    for (zeile_nr, spalte_nr) in zuletzt_entfernt:
        board[zeile_nr][spalte_nr] = VERBLASST
    for (zeile_nr, spalte_nr) in positionen:
        board[zeile_nr][spalte_nr] = ENTFERNT
    zuletzt_entfernt.clear()
    zuletzt_entfernt.extend(positionen)
    await board.render()
    if ANIMATION > 0:
        await asyncio.sleep(ANIMATION)

# nur für Demo - diese Positionen müssen aus dem Input selber berechnet werden!
zugaenglich = [(0, 2), (0, 3), (0, 5), (0, 6), (0, 8), (1, 0), (2, 6), (4, 0), (4, 9), (7, 0), (9, 0), (9, 2), (9, 8)]
await zeige_entfernt(zugaenglich)

anzahl = 0
print('Anzahl zugängliche Rollen:', anzahl)
