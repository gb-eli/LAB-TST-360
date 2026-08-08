# TST 360 — Arquitetura v0.16.0 / G8.6

## 1. Objetivos

A v0.16 acrescenta:

1. terceiro setor profissional 3D — Escritório/Administrativo;
2. Campus Virtual com maquete Three.js;
3. Performance Manager aplicado a qualquer cena 3D ativa.

## 2. Campus 3D

Arquivo:

```text
js/campus/three-campus.js
```

Factory:

```js
createCampus3D(host, context, { onNavigate })
```

A cena contém:

- terreno;
- vias;
- oito prédios setoriais;
- Central TST;
- Pavilhão de Laboratórios;
- sinalização textual via sprites;
- objetos repetidos via InstancedMesh.

Cada prédio recebe um identificador de picking:

```text
sector:construcao
sector:industria
sector:porto-logistica
sector:saude
sector:escritorio
sector:almoxarifado
sector:oficina
sector:obras-eletricas
```

A Central e o pavilhão usam:

```text
campus:tools
campus:home
```

## 3. CampusHub

O `CampusHub` mantém:

```text
mode = 2d | 3d
```

A preferência fica em:

```text
campus:view
```

Ao entrar no 3D, o Campus emite um contexto de performance:

```text
module:opened → campus-3d
```

Ao sair:

```text
module:closed
```

## 4. Escritório 3D

Arquivo:

```text
js/graphics/three-scenes-sector-office.js
```

Factory:

```js
createOfficeSector3D(host, context, state)
```

### Postos de trabalho

O renderer utiliza:

- mesa;
- cadeira;
- monitor;
- personagem sentado;
- cabos;
- caixas;
- postos repetidos;
- marcadores dos riscos.

### Emergência

O renderer utiliza:

- saída;
- sinalização;
- extintor;
- conexão/extensão;
- mobiliário;
- rota;
- trabalhador;
- TST.

## 5. Pack de Escritório

```text
assets/sectors/escritorio/g1/
├── manifest.json
├── desk_lod0.glb
├── desk_lod1.glb
├── chair_lod0.glb
├── chair_lod1.glb
├── monitor_lod0.glb
├── monitor_lod1.glb
├── extinguisher_lod0.glb
└── extinguisher_lod1.glb
```

## 6. SectorHub

Factories setoriais:

```text
porto-logistica → createPortSector3D
saude          → createHealthSector3D
escritorio     → createOfficeSector3D
demais         → SVG setorial
```

## 7. Performance Auto

Antes, `PerformanceManager.sample()` era acionado somente quando `runtime` estava aberto.

Agora a regra é:

```text
scene:metrics disponível
        ↓
amostrar frame time
        ↓
PerformanceManager
        ↓
Auto Quality
```

Quando nenhuma cena 3D está ativa:

```text
samples = []
```

Isso inclui corretamente:

- laboratórios principais;
- Porto 3D;
- Hospital 3D;
- Escritório 3D;
- Campus 3D.

## 8. Fallback

```text
Campus 3D indisponível
↓
Mapa 2D

Escritório GLB falha
↓
procedural 3D
↓
WebGL indisponível
↓
SVG setorial
```

## 9. Limite pedagógico

O setor administrativo trabalha ergonomia, circulação, organização e emergência. Não existe uma configuração ergonômica universal fixa: ajustes reais dependem do trabalhador, da tarefa, do tempo de exposição e da avaliação aplicável.
