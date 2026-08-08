# TST 360 — Arquitetura v0.4 / G2

## Mudança principal

A plataforma agora possui renderização híbrida:

```text
Módulo pedagógico
├── Renderer 2D/SVG (fallback permanente)
└── Renderer 3D/Three.js (sob demanda)
```

O 3D não é importado durante a abertura da home nem durante laboratórios que não o utilizam.

## Three Runtime

Arquivo compartilhado:

```text
js/graphics/three-runtime.js
```

Responsabilidades:
- detectar WebGL;
- importar Three.js e OrbitControls somente quando solicitado;
- criar renderer, câmera e iluminação;
- aplicar pixel ratio e sombras conforme QualityManager;
- ResizeObserver;
- picking/raycast;
- descarte de geometria, materiais e contexto WebGL;
- reagir a mudança de qualidade.

## Cenas procedimentais G2

```text
js/graphics/three-scenes.js
```

Na v0.4 contém:
- `createEpi3D()`;
- `createCanteiro3D()`.

Os modelos são construídos com primitivas 3D para validar câmera, interação, desempenho, sombras, picking e ciclo de vida antes da entrada de GLB externos.

## Dependência

Three.js está fixado em `0.185.1` via import map. Core e addons usam a mesma versão e origem.

Se a dependência não puder ser carregada ou WebGL não estiver disponível, o módulo volta automaticamente ao renderer 2D.

## Próximo estágio G3

- AssetManager para GLB;
- GLTFLoader;
- modelos otimizados;
- texturas PBR;
- LOD;
- KTX2 / Meshopt conforme o pipeline amadurecer;
- manter as cenas procedimentais como fallback/benchmark.
