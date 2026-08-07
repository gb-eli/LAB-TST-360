# TST 360 — v0.1.0

Base modular pronta para GitHub Pages.

## Publicar
1. Extraia o ZIP.
2. Envie **todo o conteúdo extraído** para a raiz do repositório.
3. O `index.html` deve ficar na raiz.
4. GitHub > Settings > Pages > Deploy from a branch > branch principal > `/ (root)`.

## Adicionar módulo
1. Crie `modules/novo-modulo/manifest.json`.
2. Crie `modules/novo-modulo/module.js`.
3. Adicione o caminho do manifesto em `modules/modules.json`.
4. Assets exclusivos em `assets/modules/novo-modulo/`.

O `js/app.js` não precisa ser editado para cada novo laboratório.

## Atualizar só um módulo
Substitua apenas a pasta do módulo e seus assets exclusivos, mantendo o mesmo `id` no manifesto e incrementando a versão.

## Testar localmente
Use servidor HTTP, por exemplo: `python -m http.server 8000`.
