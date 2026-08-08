# TST 360 — Arquitetura v0.31.0 / G10.1

## Nova camada

```text
EnvironmentExperienceHub
↓
PanoramaAuthoringTool
├── PanoramaGraphLoader
├── PanoramaAuthoringModel
└── EquirectangularPanoramaRuntime (preview)
```

## Separação

`PanoramaAuthoringModel` não usa DOM.

Ele concentra:
- validação;
- coordenadas;
- ações;
- export.

`PanoramaAuthoringTool` cuida da UI e de arquivos locais.

`EquirectangularPanoramaRuntime` continua responsável apenas pela visualização esférica.

## Coordenadas duplas

```text
x/y
→ procedural

imageX/imageY
→ equiretangular
```

Isso evita quebrar os panoramas procedurais quando uma fotografia possui composição visual diferente.

## Arquivo local

```text
File
↓
Object URL
↓
img / TextureLoader
```

Nenhum backend.

## Export

```text
Canvas
↓
toBlob(image/webp)
↓
Medium / High / Ultra
```

## Node JSON

`buildPanoramaNodeExport()` gera contrato G10.1 pronto para inserção no graph.

## Preview

O preview cria um contexto de qualidade próprio e não altera globalmente o QualityManager.

## Lifecycle

Ao sair da ferramenta:
- preview é disposed;
- Object URL é revogado;
- listeners são removidos;
- imagem local não é persistida.
