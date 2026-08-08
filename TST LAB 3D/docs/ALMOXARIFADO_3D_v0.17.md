# Almoxarifado 3D — v0.17.0

## Missão 1 — Armazenamento e prateleiras

Riscos:
- empilhamento desalinhado;
- organização/carga em rack;
- corredor reduzido;
- objeto em posição elevada.

## Missão 2 — Separação e movimentação

Riscos:
- levantamento manual;
- carrinho no corredor;
- embalagem no piso;
- alcance elevado.

## Assets

```text
assets/sectors/almoxarifado/g1/
├── rack_lod0.glb
├── rack_lod1.glb
├── pallet_stack_lod0.glb
├── pallet_stack_lod1.glb
├── picking_cart_lod0.glb
├── picking_cart_lod1.glb
├── carton_lod0.glb
└── carton_lod1.glb
```

## Otimização

Racks e caixas repetidos são instanciados sempre que possível. Os GLBs são usados nos objetos focais da missão.

## Variantes

As configurações A/B/C alteram:
- posição dos objetos;
- riscos ativos;
- posição dos marcadores;
- contexto operacional.
