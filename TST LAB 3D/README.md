# TST 360 — Laboratório Virtual de Segurança do Trabalho v0.38.0

## G10.8 — Atmosfera adaptativa dos ambientes

A v0.38 melhora a sensação de profundidade e identidade dos ambientes sem adicionar HDRIs, fotografias de céu ou novas texturas de arquivo.

A atmosfera é criada proceduralmente no navegador.

## Nova arquitetura

```text
ThreeViewport
├── EnvironmentManager
├── EnvironmentAtmosphereManager
├── RealismManager
├── ContextualDressingManager
├── ContextPropManager
└── ScenicPropManager
```

## 12 perfis atmosféricos

- EPI;
- Construção;
- Indústria;
- Espaço Confinado;
- Investigação/Forense;
- Porto;
- Saúde;
- Escritório;
- Almoxarifado;
- Oficina;
- Elétrica;
- Emergência/Evacuação.

Cada perfil define:
- cor superior;
- horizonte;
- tom inferior;
- cor de fog;
- luz principal;
- fill;
- accent;
- secondary.

## Qualidade

```text
Eco
- sem shell
- sem luz de acento
- apenas cor/fog

Médio
- shell procedural
- 0 luzes de acento

Alto
- shell procedural
- 1 luz de acento

Ultra
- shell procedural
- 2 luzes de acento
- pulsação ambiental extremamente leve
```

## Sky shell

O shell é uma esfera interna com `CanvasTexture` gerada em runtime.

```text
64 × 128 px
gradiente procedural
sem mipmaps
```

Nenhum arquivo de imagem novo é baixado.

## Fog

O manager reutiliza a fog da cena e ajusta:
- cor;
- near;
- far;

de acordo com perfil e qualidade.

## Iluminação

Quando existe `EnvironmentManager`, a atmosfera também ajusta tonalidade de:
- sol/key;
- fill;
- hemisphere.

As luzes de acento:
- não projetam sombra;
- aparecem somente em High/Ultra;
- são sutis;
- servem para dar identidade visual ao ambiente.

## Evacuação

A cena de Incêndio/Evacuação usa:

```text
atmosphereProfile: emergency
```

em vez de herdar a atmosfera elétrica.

## Object Focus

O viewer isolado de objeto continua limpo:

```text
contextProps:false
scenicProps:false
atmosphere:false
```

## Assets

Nenhum GLB ou WebP foi adicionado.

Totais:
- 157 GLBs;
- 48 WebP.

## Performance

O custo geométrico da atmosfera é essencialmente um shell de céu.

Os budgets Medium/High/Ultra receberam apenas uma pequena margem para:
- 1 textura procedural;
- 1 geometria de shell;
- draw call associado.

Eco não recebe esse custo.
