# TST 360 — Arquitetura v0.19.0 / G8.9

## 1. Objetivo

Completar 8/8 setores profissionais em 3D sem criar cópias de Canteiro, Indústria ou Eletricidade.

## 2. Camadas

```text
Missão setorial
      ↓
InspectionLab
      ↓
Sector 3D Registry
      ↓
┌────────────────────────────┐
│ renderer setorial nativo   │
│ ou                         │
│ semantic lab adapter       │
└────────────────────────────┘
      ↓
Three.js / GLB / procedural
```

## 3. Adapter

Arquivo:

```text
js/sectors/sector-lab-scene-adapters.js
```

A função interna recebe:

```js
{
  missionId,
  found,
  activeRiskIds,
  variant,
  onRisk
}
```

e produz o estado esperado pelo laboratório reutilizado.

## 4. Transformações

### `found`

```text
sector risk ID → lab risk ID
```

### `activeRiskIds`

A variante setorial continua decidindo quais riscos existem naquela sessão.

### `markerOffsets3d`

O adapter combina:

```text
baseOffset do adapter
+
offset da variante
```

Isso permite reutilizar um marcador interno até quando a posição pedagógica da missão setorial precisa ser diferente.

### `onRisk`

O picking volta no sentido inverso:

```text
lab risk ID
↓
sector risk ID
↓
InspectionLab
```

## 5. Cobertura

### Construção

Renderer:

```text
createCanteiro3D
```

Missões adaptadas:

```text
abertura-frente
movimentacao-altura
```

### Indústria

Renderer:

```text
createIndustria3D
```

Missões:

```text
linha-producao
abastecimento-interno
```

### Obras Elétricas

Renderer:

```text
createEletricidade3D
```

Missões:

```text
preparacao-area
instalacao-temporaria
```

## 6. Registry

O registry agora possui oito entradas.

```text
3 adapters de laboratório
+
5 renderers setoriais nativos
=
8 setores 3D
```

## 7. Performance

Os IDs setoriais possuem budgets próprios, mesmo quando usam a mesma cena-base.

Isso preserva métricas por experiência:

```text
sector-construcao-abertura-frente
sector-construcao-movimentacao-altura

sector-industria-linha-producao
sector-industria-abastecimento-interno

sector-obras-eletricas-preparacao-area
sector-obras-eletricas-instalacao-temporaria
```

## 8. Benefício arquitetural

A v0.19 adiciona seis experiências 3D setoriais sem adicionar modelos GLB.

A geometria é compartilhada, mas:

- risco;
- variante;
- evidência;
- sessão;
- relatório;
- progresso

continuam pertencendo à missão setorial.
