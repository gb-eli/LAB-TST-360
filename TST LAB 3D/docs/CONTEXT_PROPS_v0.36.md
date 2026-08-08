# Context Props — v0.36.0

## Propósito

Dar mais identidade visual aos ambientes 3D usando pequenos objetos já existentes na biblioteca.

## Política por qualidade

| Perfil | Props GLB |
|---|---:|
| Eco | 0 |
| Médio | 1 |
| Alto | 2 |
| Ultra | 3 |

## Perfis e packs

O registro contém 11 perfis e referencia:
- packs de módulos;
- packs setoriais G1.

Nenhum arquivo é copiado para uma nova pasta.

## Flags

Todo prop de contexto recebe:

```text
tstDecorative
tstContextProp
tstContextOnly
tstIgnoreRisk
```

## Posicionamento

Os objetos são normalizados pela bounding box e colocados em slots periféricos definidos por tipo de layout:
- studio;
- outdoor;
- industrial;
- confined;
- port;
- corridor;
- office;
- warehouse;
- workshop;
- electrical.

## Observação

A presença de um prop é cenográfica. Ela não significa que o arranjo seja seguro, adequado, normativamente conforme ou operacionalmente recomendado.
