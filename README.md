# EF 2028

by [hfr](https://github.com/bh0fer) and [brr](https://github.com/SilasBerger)


## Material Synchronisieren

- `yarn sync` synchronisiert die Materialien aus dem `docs` Ordner gemäss der `material_config.yaml` Datei in die `versioned_docs` Ordner.
- `yarn cleanup` löscht die synchronisierten Materialien aus den `versioned_docs` Ordnern, so dass der Entwicklungsprozess weniger RAM benötigt.
    ```bash
    yarn run remove [source] [[--from="v1,v2"]]

    examples:

    yarn run remove docs/byod-basics/v24/ --from="24a,24b"
    ```
- `yarn run add` ist eine Helfer-Funktion zum Hinzufügen von Material zum `material_config.yaml` File:

    ```bash
    yarn run add [source] [[--to="v1,v2"]] [[--as="destination-name"]] [[--ignore="file1,file2"]]
    
     # examples:

    yarn run add docs/byod-basics/v24/ --to="24a,24b"   # --> adds /byod-basics/v24 to 24a & 24b
    yarn run add docs/byod-basics/v24/ --to="24a,24b" --as="My-Material" # --> adds /byod-basics to 24a & 24b
    yarn run add byod-basics/v24/ --to="24a,24b" --as="My-Material" # same as above
    yarn run add byod-basics/v24 --to="24a,24b" --as="My-Material"  # same as above
    yarn run add docs/byod-basics/v24/ --to="24a,24b" --as="My-Material" --ignore="_category_.json,*.txt"
    ```

```yaml
28EF:
    - from: docs/EF-NumTrip/
      to: versioned_docs/version-28EF/12-NumTrip
      ignore:
          - _category_.yml
      open: true
```

Mit dem optionalen `open` Flag kann angezeigt werden, ob automatisch eine `_category_.json` Datei erstellt werden soll, sofern diese nicht bereits existiert und dort dann `collapsed: false` gesetzt werden soll.

