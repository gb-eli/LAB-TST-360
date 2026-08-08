# Tour Routing — v0.33.0

Exemplo:

```json
{
  "mode":"branch-and-converge",
  "entryStepId":"entrada",
  "decisionStepId":"entrada",
  "branchStepIds":["equipamento","segunda-zona"],
  "convergeStepId":"missao"
}
```

Rota A:
`entrada → equipamento → segunda-zona → missao`

Rota B:
`entrada → segunda-zona → equipamento → missao`

`nextStepId()` respeita a decisão.
`previousStepId()` prefere `historyStepIds`.
