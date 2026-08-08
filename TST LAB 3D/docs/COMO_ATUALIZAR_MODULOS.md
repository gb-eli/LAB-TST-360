# Como atualizar módulos

## Atualização de um módulo existente
Exemplo EPI Lab:
- altere `modules/epi-lab/`;
- altere, se necessário, `assets/modules/epi-lab/`;
- incremente `version` em `modules/epi-lab/manifest.json`;
- não altere o `id`;
- registre a mudança no `CHANGELOG.md`.

## Novo módulo
Crie sua pasta em `modules/`, adicione `manifest.json` + `module.js` e registre o manifesto em `modules/modules.json`.
