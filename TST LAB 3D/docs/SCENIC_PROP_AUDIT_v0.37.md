# Auditoria dos Scenic Props — v0.37.0

## Resultado

- assets exclusivos: **16**
- GLBs: **32**
- peso GLB total: **85.6 KB**
- triângulos somados dos arquivos-fonte: **2,976**
- maior arquivo: **6.6 KB**
- maior LOD: **312 triângulos**
- GLBs single-mesh: **32/32**

Todos os props marcados `repeatable` são single-mesh e podem ser convertidos
em `THREE.InstancedMesh`.

## Tabela

| Asset | LOD | KB | Triângulos | Repetível |
|---|---:|---:|---:|---|
| pilha de agregado | lod0 | 1.7 | 40 | não |
| pilha de agregado | lod1 | 2.3 | 72 | não |
| caçamba cenográfica | lod0 | 2.0 | 60 | não |
| caçamba cenográfica | lod1 | 2.3 | 72 | não |
| tote de material | lod0 | 1.7 | 36 | sim |
| tote de material | lod1 | 2.1 | 60 | sim |
| coluna utilitária | lod0 | 1.7 | 36 | não |
| coluna utilitária | lod1 | 1.9 | 48 | não |
| cabeço de amarração cenográfico | lod0 | 2.6 | 92 | sim |
| cabeço de amarração cenográfico | lod1 | 3.8 | 156 | sim |
| luminária de cais | lod0 | 2.9 | 104 | sim |
| luminária de cais | lod1 | 4.0 | 168 | sim |
| carrinho de roupa | lod0 | 4.3 | 184 | não |
| carrinho de roupa | lod1 | 6.6 | 312 | não |
| biombo | lod0 | 1.9 | 48 | não |
| biombo | lod1 | 2.1 | 60 | não |
| móvel com impressora | lod0 | 1.7 | 36 | não |
| móvel com impressora | lod1 | 1.9 | 48 | não |
| jardineira | lod0 | 2.8 | 100 | sim |
| jardineira | lod1 | 5.8 | 268 | sim |
| tote plástico | lod0 | 1.4 | 24 | sim |
| tote plástico | lod1 | 1.9 | 48 | sim |
| suporte de identificação | lod0 | 2.1 | 64 | sim |
| suporte de identificação | lod1 | 2.7 | 96 | sim |
| baú de ferramentas | lod0 | 1.9 | 48 | não |
| baú de ferramentas | lod1 | 2.4 | 72 | não |
| gaveteiro de peças | lod0 | 2.1 | 60 | sim |
| gaveteiro de peças | lod1 | 3.3 | 120 | sim |
| carretel cenográfico | lod0 | 3.4 | 132 | não |
| carretel cenográfico | lod1 | 5.0 | 228 | não |
| marcador de área | lod0 | 1.7 | 36 | sim |
| marcador de área | lod1 | 1.9 | 48 | sim |

## Interpretação

A soma de triângulos acima é a soma dos 32 arquivos de dois LODs, não o custo
simultâneo de uma cena.

Em runtime:

```text
Eco    → 0 tipos
Médio  → 0 tipos
Alto   → 1 tipo
Ultra  → 2 tipos
```

Ou seja, apenas uma pequena fração do pack pode estar ativa no mesmo viewport.

## Semântica

Esses objetos são cenografia low-poly e não são referências técnicas de
dimensão, capacidade, posicionamento ou procedimento.
