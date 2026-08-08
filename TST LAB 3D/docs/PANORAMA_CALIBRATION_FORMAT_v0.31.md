# Formato de Calibração — v0.31.0

## Hotspot compatível

```json
{
  "id":"ponto-1",
  "x":50,
  "y":40,
  "imageX":53.2,
  "imageY":47.8,
  "label":"...",
  "note":"...",
  "category":"structure"
}
```

## Regra de leitura

Runtime equiretangular:

```text
imageX/imageY existem?
├── sim → usar diretamente
└── não → usar x/y + hotspotTransform
```

Renderer procedural:

```text
continua usando x/y
```

## Por que preservar dois sistemas

Uma fotografia real pode ter:
- câmera em outra altura;
- orientação diferente;
- composição diferente;
- objetos em outra posição visual.

Não é correto obrigar a fotografia a compartilhar exatamente as coordenadas do desenho procedural.

## Ações

### Node

```json
{
  "type":"node",
  "nodeId":"doca"
}
```

### Experience

```json
{
  "type":"experience",
  "experienceId":"reachstacker"
}
```

## Export de fotografia

`sourceType`:

```text
external-photo
```

A referência G10 atual continua:

```text
generated-reference
```
