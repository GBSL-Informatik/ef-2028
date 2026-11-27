import numpy as np
from grid import Grid
from time import sleep
from random import randint

# Pause nach jeder Darstellung in Sekunden.
# Für Ihren richtigen Input (viele Iterationen) z.B. auf 0.05 verkleinern.
ANIMATION = 0.5

# Datei öffnen und den Inhalt in die Variable raw einlesen.
with open("./demo.txt") as file:
    raw = file.read()


plan = [['.', '.', '@', '@', '.', '@', '@', '@', '@', '.'], ['@', '@', '@', '.', '@', '.', '@', '.', '@', '@'], ['@', '@', '@', '@', '@', '.', '@', '.', '@', '@'], ['@', '.', '@', '@', '@', '@', '.', '.', '@', '.'], ['@', '@', '.', '@', '@', '@', '@', '.', '@', '@'], ['.', '@', '@', '@', '@', '@', '@', '@', '.', '@'], ['.', '@', '.', '@', '.', '@', '.', '@', '@', '@'], ['@', '.', '@', '@', '@', '.', '@', '@', '@', '@'], ['.', '@', '@', '@', '@', '@', '@', '@', '@', '.'], ['@', '.', '@', '.', '@', '@', '@', '.', '@', '.']]
board = Grid(len(plan), len(plan[0]), grid_id='aoc-2025-04-teil-1', palette=['yellow', 'black'])
_angezeigt = np.zeros(board.size, dtype=np.uint8)

def show(data):
    zustand = np.array([[1 if zeichen == '@' else 0 for zeichen in zeile] for zeile in data], dtype=np.uint8)
    # alle Farben auf einmal setzen
    board.set_cells(zustand)
    _angezeigt[:] = zustand
    board.show()
    if ANIMATION > 0:
        sleep(ANIMATION)

show(plan)
# TODO mache etwas sinnvolles ;)
for i in range(20):
    x = randint(0, len(plan[0]) - 1)
    y = randint(0, len(plan) - 1)
    plan[y][x] = '.'
    show(plan)