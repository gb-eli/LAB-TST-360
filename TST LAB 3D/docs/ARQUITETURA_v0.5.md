# TST 360 — Arquitetura v0.5 / G3

## Novo pipeline de assets

A v0.5 introduz `AssetManager` com carregamento GLB sob demanda, cache por URL, clonagem de instâncias e descarte por referência.

```text
Laboratório
  -> Renderer 2D/SVG (fallback)
  -> Renderer 3D/Three.js
       -> AssetManager
          -> manifest do pacote
          -> seleção LOD pela qualidade
          -> GLTFLoader
          -> cache / referências
          -> instância na cena
```

## Perfis e LOD

Cada definição de asset pode mapear `eco`, `medium`, `high` e `ultra` para arquivos GLB diferentes. Uma alteração de qualidade solicita a variante adequada sem mudar a lógica pedagógica.

## Assets G3 incluídos

### EPI Lab
- capacete: 3 LODs;
- óculos: 2 LODs;
- respirador: 2 LODs;
- cinturão/harness: 2 LODs.

### Canteiro
- escada: 2 LODs;
- pallet: 2 LODs;
- cone: 2 LODs.

Os modelos foram produzidos como assets próprios e leves para validar o pipeline. Eles são deliberadamente simples: na evolução futura podem ser substituídos por GLBs de maior fidelidade mantendo IDs, manifests e contratos.

## PBR

Os GLBs usam materiais PBR básicos (cor base, rugosidade e metalicidade). A próxima evolução pode adicionar normal maps, ORM, KTX2 e lightmaps.

## Regra de memória

Assets carregados são geridos pelo `AssetManager`. O `ThreeViewport` não destrói geometria/material compartilhado de uma instância gerenciada; em vez disso devolve a referência ao manager no `dispose()`.

## Próxima etapa sugerida

G4: personagens e equipamentos de maior fidelidade, animação, catálogo visual de assets e preparação para KTX2/Meshopt/Draco.
