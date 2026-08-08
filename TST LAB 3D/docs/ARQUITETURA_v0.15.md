# TST 360 — Arquitetura v0.15.0 / G8.5

## 1. Objetivos

A v0.15 acrescenta:

1. segundo setor profissional 3D — Saúde/Hospital;
2. Campus Virtual TST como navegação geral;
3. unificação das rotas entre home, setores, ferramentas, campus e laboratórios.

## 2. CampusHub

Arquivo:

```text
js/campus/campus-hub.js
```

O Campus não conhece diretamente ModuleManager ou SectorHub.

Ele emite:

```js
events.emit('campus:navigate', {
  type: 'sector' | 'lab' | 'tools' | 'home',
  id
})
```

O `app.js` resolve a navegação.

Isso mantém o Campus desacoplado da implementação interna dos módulos.

## 3. Navegação unificada

O `app.js` usa:

```text
hideAll()
├── fecha módulo
├── desmonta Central TST
├── desmonta SectorHub
├── desmonta CampusHub
└── oculta views
```

Depois abre somente o destino desejado.

Objetivo: evitar listeners duplicados, cenas WebGL esquecidas ou duas superfícies ativas simultaneamente.

## 4. SectorHub multi-3D

Antes:

```text
Porto → createPortSector3D()
demais → SVG
```

Agora:

```text
Porto → createPortSector3D()
Saúde → createHealthSector3D()
demais → SVG
```

A factory recebe:

```js
{
  missionId,
  found,
  activeRiskIds,
  variant,
  onRisk
}
```

## 5. Saúde 3D

Arquivo:

```text
js/graphics/three-scenes-sector-health.js
```

### Apoio hospitalar

- corredor;
- carrinho;
- resíduos;
- armários;
- trabalhador de apoio;
- TST;
- piso molhado didático;
- hotspots.

### Transporte interno

- corredor;
- carrinho;
- leito/equipamento;
- armário;
- rota;
- cabo;
- trabalhador articulado;
- TST;
- hotspots.

## 6. Pack hospitalar

```text
assets/sectors/saude/g1/
├── manifest.json
├── bed_lod0.glb
├── bed_lod1.glb
├── cart_lod0.glb
├── cart_lod1.glb
├── waste_bin_lod0.glb
├── waste_bin_lod1.glb
├── cabinet_lod0.glb
└── cabinet_lod1.glb
```

## 7. Campus responsivo

Desktop:

```text
mapa esquemático
+ vias
+ zonas
+ Central TST
+ Pavilhão de Labs
```

Mobile:

```text
grade de zonas
+ Central
+ Labs
```

Nenhum recurso crítico depende do layout absoluto do mapa.

## 8. Performance

Novos IDs de budget:

```text
sector-saude-apoio-hospitalar
sector-saude-transporte-interno
```

A mesma infraestrutura de SceneMetrics é usada.

## 9. Fallback

```text
Hospital GLB/LOD
↓ falha de asset
procedural 3D
↓ WebGL indisponível
SVG setorial
↓
mesma missão / evidência / relatório
```

## 10. Limite pedagógico

O Hospital 3D treina reconhecimento de riscos ocupacionais em ambientes de saúde. Ele não simula assistência clínica, não substitui biossegurança institucional e não prescreve procedimentos de atendimento.
