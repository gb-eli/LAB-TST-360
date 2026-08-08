# TST 360 — Arquitetura v0.17.0 / G8.7

## Objetivos

1. adicionar o quarto setor profissional 3D;
2. explorar instancing em um cenário de alta repetição;
3. transformar progresso pedagógico em informação visual do Campus;
4. manter animações ambientais subordinadas ao perfil gráfico.

## SectorHub

Factories 3D:

```text
porto-logistica → createPortSector3D
saude           → createHealthSector3D
escritorio      → createOfficeSector3D
almoxarifado    → createWarehouseSector3D
demais          → SVG setorial
```

## Almoxarifado 3D

Arquivo:

```text
js/graphics/three-scenes-sector-warehouse.js
```

### Armazenamento

Elementos:
- racks;
- pallets;
- pilhas;
- corredor;
- item elevado;
- TST;
- hotspots.

### Picking

Elementos:
- racks;
- caixas;
- carrinho;
- trabalhador em crouch;
- trabalhador em reach;
- embalagem no piso;
- TST;
- hotspots.

## Instancing

É aplicado em:

```text
racks repetidos
postes de rack
prateleiras
caixas
```

Objetivo: aumentar densidade visual sem proporcionalmente aumentar draw calls.

## Campus 3D com progresso

`CampusHub` calcula:

```js
{
  completed,
  total,
  sessions
}
```

por setor e envia para:

```js
createCampus3D(host, context, {
  progress,
  sectors3D,
  onNavigate
})
```

Cada prédio recebe:

- barra visual de progresso;
- label `concluídas/total`;
- marca `3D` quando aplicável;
- teto emissivo quando o setor possui renderer 3D.

## Animações adaptativas do Campus

A maquete cria dois veículos ambientais leves.

Visibilidade:

```text
eco    → 0
medium → 1
high   → 2
ultra  → 2
```

Isso permite dar vida ao Campus sem transformar a animação em requisito de navegação.

## Fallback

```text
Almoxarifado GLB falha
↓
procedural 3D
↓
WebGL indisponível
↓
SVG setorial

Campus 3D falha
↓
Mapa 2D
```

## Segurança pedagógica

Capacidade de racks, limites de carga, empilhamento e métodos de movimentação reais dependem do sistema, material, fabricante, processo e avaliação aplicável. O cenário não define valores operacionais oficiais.
