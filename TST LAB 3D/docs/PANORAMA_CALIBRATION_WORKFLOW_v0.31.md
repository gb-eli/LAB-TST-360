# Fluxo de calibração de panorama — v0.31.0

## Preparação recomendada

Imagem:

```text
projeção: equiretangular
proporção: 2:1
```

Exemplos de resolução de origem:

```text
4096×2048
6000×3000
8192×4096
```

A ferramenta não exige uma resolução específica de origem.

## Posição de hotspot

As coordenadas exportadas são percentuais.

```text
imageX: 0 … 100
imageY: 0 … 100
```

Isso torna a calibração independente da resolução do tier.

## Compatibilidade com G10

Nodes antigos podem possuir:

```text
x/y
hotspotTransform
```

Ao exportar pela ferramenta G10.1:

```text
x/y
+
imageX/imageY
```

ficam disponíveis.

## Atualização de foto

Se uma nova fotografia usar o mesmo enquadramento/orientação:

- os hotspots imageX/imageY podem ser reaproveitados.

Se a costura/orientação mudar:

- recalibre.

## Revisão final

Teste pelo menos:

- Medium;
- High;
- mobile;
- tela de apresentação;
- transição de node;
- objeto 3D;
- missão 3D.
