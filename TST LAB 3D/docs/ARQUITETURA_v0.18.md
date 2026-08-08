# TST 360 — Arquitetura v0.18.0 / G8.8

## 1. Objetivos

A v0.18 executa duas mudanças principais:

1. adicionar Oficina/Manutenção como quinto setor profissional 3D;
2. remover do `SectorHub` a responsabilidade de conhecer as factories 3D individuais.

## 2. Sector 3D Registry

Arquivo:

```text
js/sectors/sector-3d-registry.js
```

API:

```js
hasSector3D(sectorId)
getSector3DDescriptor(sectorId, missionId)
listSector3D()
SECTOR_3D_IDS
SECTOR_3D_REUSE_PLAN
```

O descriptor retorna:

```js
{
  label,
  note,
  create3D
}
```

O `SectorHub` consome apenas esse contrato.

## 3. Registry atual

```text
porto-logistica → createPortSector3D
saude           → createHealthSector3D
escritorio      → createOfficeSector3D
almoxarifado    → createWarehouseSector3D
oficina         → createWorkshopSector3D
```

## 4. Plano de reutilização

Não estão habilitados ainda, mas o registry documenta:

```text
construcao
  source: createCanteiro3D
  strategy: adapter

industria
  source: createIndustria3D
  strategy: adapter

obras-eletricas
  source: createEletricidade3D
  strategy: adapter
```

O adapter futuro deve mapear:

```text
IDs da missão setorial
        ↓
IDs semânticos do laboratório principal
        ↓
renderer 3D existente
```

sem copiar geometria ou regras de renderização.

## 5. Oficina 3D

Arquivo:

```text
js/graphics/three-scenes-sector-workshop.js
```

### Corte/esmerilhamento

Renderiza:

- bancada;
- equipamento didático;
- trabalhador;
- pessoa exposta no entorno;
- ferramentas/cabos;
- TST;
- marcadores.

### Manutenção de máquina

Renderiza:

- máquina;
- painel/estado visual;
- barreira;
- ferramentas;
- trabalhador;
- terceiro;
- TST;
- marcadores.

## 6. Assets

```text
assets/sectors/oficina/g1/
├── workbench_lod0.glb
├── workbench_lod1.glb
├── grinder_lod0.glb
├── grinder_lod1.glb
├── maintenance_machine_lod0.glb
├── maintenance_machine_lod1.glb
├── barrier_lod0.glb
└── barrier_lod1.glb
```

## 7. Campus

O `CampusHub` importa `SECTOR_3D_IDS`.

Consequência:

- novos setores registrados aparecem automaticamente como `3D`;
- a contagem de setores 3D é automática;
- a lista enviada ao Campus 3D é automática;
- não existe uma segunda lista manual para manter.

## 8. Fallback

```text
GLB Oficina
↓ falha
procedural 3D
↓ WebGL indisponível
SVG setorial
```

## 9. Limite pedagógico

A cena de manutenção não ensina como executar controle de energia, remover proteções ou operar ferramentas. O objetivo é perceber condições inadequadas e estruturar uma análise preventiva.
