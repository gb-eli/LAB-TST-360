# Panorama Authoring Tool — v0.31.0

## Acesso

```text
Setor
→ Experiências visuais
→ Calibrar / criar panorama 360
```

## Não é um role

A ferramenta não verifica:
- professor;
- aluno;
- conta;
- cargo.

É uma ferramenta geral.

## Etapa 1 — node

Escolha o ponto de observação já existente.

## Etapa 2 — imagem

Importe uma imagem.

O validador considera ideal:

```text
width / height ≈ 2
```

com tolerância de 4%.

## Etapa 3 — heading

Defina a direção inicial de 0 a 359°.

Conversão interna:

```text
startOffset = heading / 360 × 75
```

## Etapa 4 — hotspot

Clique na posição da imagem.

São gravados:

```text
imageX
imageY
```

em percentual.

## Etapa 5 — ação

Tipos:
- note;
- node;
- object;
- mission.

## Etapa 6 — prévia

A prévia usa o runtime equiretangular real.

## Etapa 7 — export

Baixe:
- JSON;
- Medium WebP;
- High WebP;
- Ultra WebP.

## Atenção

O navegador pode pedir autorização para múltiplos downloads ao gerar os três tiers.

## Publicação

A ferramenta prepara os arquivos, mas não publica automaticamente no GitHub.

O usuário ainda decide quais arquivos serão enviados ao repositório.
