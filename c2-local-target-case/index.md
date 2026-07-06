# Case-sensitive local target repro

The `{apitest}` directive below registers two targets with *exact-case*
identifiers, the way a Python API-docs plugin would: `sample.Match`
(a class) and `sample.match` (a function).

```{apitest} sample
```

Class reference: [](#sample.Match)

Function reference: [](#sample.match)
