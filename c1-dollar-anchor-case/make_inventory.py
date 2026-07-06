"""Regenerate objects.inv — a minimal Sphinx v2 inventory using the `$` uri shorthand.

The rows mirror what real Sphinx sites publish:
- CPython's inventory stores `re.match` (py:function) and `re.Match` (py:class)
  both as `library/re.html#$` — Sphinx expands `$` to the object name verbatim.
- A capitalized glossary term is stored as `index.html#term-$` and its real
  HTML anchor is `#term-Match` (case-preserved).

Requires: pip install sphobjinv
"""

import sphobjinv as soi

inv = soi.Inventory()
inv.project, inv.version = "repro", "1"
rows = [
    ("re.match", "py", "function", "library/re.html#$"),
    ("re.Match", "py", "class", "library/re.html#$"),
    ("Match", "std", "term", "index.html#term-$"),
]
for name, domain, role, uri in rows:
    inv.objects.append(
        soi.DataObjStr(name=name, domain=domain, role=role, priority="1", uri=uri, dispname="-")
    )
soi.writebytes("objects.inv", soi.compress(inv.data_file()))
print(f"wrote objects.inv with {len(inv.objects)} rows")
