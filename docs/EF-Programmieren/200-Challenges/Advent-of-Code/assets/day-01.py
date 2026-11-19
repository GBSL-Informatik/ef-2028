from clock import use_clock
from time import sleep

# Dauer der Animation pro Drehung in Sekunden.
# Für Ihren richtigen Input (tausende Zeilen) auf 0 setzen!
ANIMATION = 0.5

dial = use_clock('aoc-2025-01-teil-1')

# Datei öffnen und den Inhalt in die Variable raw einlesen.
with open("./demo.txt") as file:
    raw = file.read()
print(raw)

# nur für Demo - diese Positionen müssen aus dem Input selber berechnet werden!
positionen = [50, 82, 52, 0, 95, 55, 0, 99, 0, 14, 32]

position = 50
dial.set_pointer('seconds', position)
passwort = 0

for position in positionen:
    if ANIMATION > 0:
        dial.set_pointer('seconds', position, within=ANIMATION)
        sleep(ANIMATION)

print('Passwort:', passwort)