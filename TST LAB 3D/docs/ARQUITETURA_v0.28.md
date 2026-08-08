# TST 360 — Arquitetura v0.28.0 / G9.8

## Objetivo

Permitir crescimento forte de qualidade gráfica sem criar um monólito.

## Camada nova

```text
SectorHub
↓ dynamic import
EnvironmentExperienceHub
↓
EnvironmentExperienceRegistry
↓
data/environments/index.json
↓
data/environments/<sector>.json
```

Depois o tipo determina o módulo:

```text
panorama360
→ Panorama360Viewer

object3d
→ ObjectFocusViewer

mission3d
→ missão setorial existente
```

## Granularidade de carregamento

### Nível 1 — aplicação

Não carrega bibliotecas visuais.

### Nível 2 — setor

Ao selecionar experiências:

```text
index.json
+
<sector>.json
```

### Nível 3 — experiência

Panorama:

```text
Panorama360Viewer
```

Objeto:

```text
ObjectFocusViewer
+
Three.js
+
1 GLB/LOD
```

Missão:

```text
cena setorial existente
```

## Resultado

O crescimento de Porto não aumenta automaticamente o custo de Hospital.

O crescimento de Hospital não aumenta automaticamente o custo de Oficina.

## Interface única

O sistema não possui papéis de acesso.

```text
professor
aluno
qualquer usuário
        ↓
mesma interface
```

`Tela de apresentação` é apenas uma forma de visualização.

## Futuro 360

A experiência declara renderer.

Hoje:

```text
procedural-svg-360
```

Futuro:

```text
equirectangular-image
cubemap
WebGL panorama
```

O contrato de dados permanece o mesmo.

## Assets 3D

`object3d` referencia:

```text
pack
id
```

Não copia GLB.

O AssetManager decide LOD pelo QualityManager.

## Falha

Se WebGL falhar no objeto 3D:

- o viewer mostra aviso;
- Panorama 360 continua disponível;
- missão 2D/SVG continua disponível.

A biblioteca inteira não falha junto.
