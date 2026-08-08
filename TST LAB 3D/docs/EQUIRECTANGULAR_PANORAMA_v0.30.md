# Equirectangular Panorama Runtime — v0.30.0

## Objetivo

Permitir que uma zona panorâmica seja apresentada em uma esfera 360 real de projeção equiretangular.

## Controle

### Pointer / touch

- horizontal → yaw;
- vertical → pitch.

Pitch limitado:

```text
-62° … +62°
```

### Wheel

FOV:

```text
42° … 88°
```

## Hotspots

Hotspots permanecem DOM.

Vantagens:
- acessibilidade;
- CSS;
- clique/touch;
- integração com ExperienceHub.

A posição é recalculada durante o frame.

## Seleção de tier

```text
panoramaTierForQuality()
panoramaTierCandidates()
```

## Fallback de arquivo

`loadBestTier()` percorre candidates.

## Source Type atual

```text
generated-reference
```

Ou seja: panoramas raster gerados a partir da arte didática existente.

## Fotografia real

O runtime não diferencia semanticamente uma fotografia de uma referência gráfica.

Para usar fotografia:

1. preparar imagem equiretangular 2:1;
2. criar tiers;
3. substituir `src`;
4. ajustar hotspots se necessário.

## Privacidade

Caso fotos reais sejam incluídas futuramente, revisar:
- rostos;
- placas;
- documentos;
- dados visíveis;
- autorização de captura;
- direitos de uso.
