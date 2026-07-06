# mystmd case-sensitivity reproducers

[![Reproduce case-sensitivity bugs](https://github.com/coretl/mystmd-repro-repo/actions/workflows/repro.yml/badge.svg)](https://github.com/coretl/mystmd-repro-repo/actions/workflows/repro.yml)

Minimal reproducers for two independent bugs that break **case-sensitive
cross-references** in MyST, the kind needed for Python API docs, where
`re.match` (a function) and `re.Match` (a class) are different objects that
must be different link targets.

CI runs each reproducer as a matrix: against the released/upstream code
(**expecting the bug**) and against a fixed branch (**expecting correct
behaviour**). All jobs green means both bugs and both fixes are demonstrated.

## C1: `$` inventory anchors are expanded lowercased

- Issue: [jupyter-book/mystmd#1758](https://github.com/jupyter-book/mystmd/issues/1758)
- Prior fix attempt: [continuous-foundation/intersphinx#5](https://github.com/continuous-foundation/intersphinx/pull/5)
- Fixed branch used here: [coretl/intersphinx `fix/dollar-anchor-case`](https://github.com/coretl/intersphinx/tree/fix/dollar-anchor-case)

A Sphinx v2 `objects.inv` row may abbreviate its uri with `$`, meaning
"substitute the object name here". Sphinx expands it **verbatim** and only
ever *writes* `$` when the anchor equals the name byte-for-byte, so the only
correct expansion is case-preserved, for **all** domains (including
`std:term`: Sphinx publishes a capitalized glossary term as
`Match std:term index.html#term-$` whose real HTML anchor is `#term-Match`).
The `intersphinx` package expands `$` with
`.toLowerCase().replace(/\s+/g, '-')`, so `re.Match` collapses onto
`re.match`, for every case-distinct pair in every real Sphinx inventory,
including docs.python.org.

`c1-dollar-anchor-case/` contains a 3-row `$`-form inventory
(regenerate with `make_inventory.py`) and a check script:

```bash
npx intersphinx list c1-dollar-anchor-case/objects.inv --includes re.Match
# released 1.0.2:  py:class (re.Match) -> library/re.html#re.match   ← WRONG
# fixed branch:    py:class (re.Match) -> library/re.html#re.Match   ← matches Sphinx
```

## C2: resolved links discard the matched target's case

- Fixed branch used here: [coretl/mystmd `fix/xref-identifier-case`](https://github.com/coretl/mystmd/tree/fix/xref-identifier-case)

Any mdast node with an `identifier` registers as a link target, and
`resolveReferenceLinksTransform` already looks targets up by the **verbatim**
identifier before falling back to the normalized (lowercased) form. But the
resulting cross-reference is then always given the *normalized* identifier
(`packages/myst-transforms/src/enumerate.ts`), so a link to an exact-case
target silently re-points at its lowercase sibling.

`c2-local-target-case/` is a tiny MyST project whose plugin directive
registers `sample.Match` (py:class) and `sample.match` (py:function) with
exact-case identifiers, then links `[](#sample.Match)` and
`[](#sample.match)`:

```bash
cd c2-local-target-case
myst build --all
node check.mjs _build/site/content/index.json bug    # released mystmd: both refs -> sample.match
node check.mjs _build/site/content/index.json fixed  # fixed branch: sample.Match / sample.match
```

## Why this matters

These two bugs are the remaining blockers for case-sensitive Python API
documentation in MyST (context:
[jupyter-book/mystmd#1259](https://github.com/jupyter-book/mystmd/issues/1259)).
Fixing C1 makes consuming real Sphinx inventories correct; fixing C2 makes
locally-registered case-sensitive targets referenceable. Everything else
needed already works in mystmd today.
