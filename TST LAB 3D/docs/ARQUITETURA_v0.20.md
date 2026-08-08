# TST 360 — Arquitetura v0.20.0 / G9.0

## Objetivo

A v0.20 muda a estratégia gráfica:

```text
antes
mais módulos / mais cenas

agora
mesmas cenas
+
camada compartilhada de realismo
```

O objetivo é melhorar gradualmente os 8 laboratórios e os 8 setores sem criar versões paralelas pesadas.

## ThreeViewport

Fluxo atual:

```text
ThreeViewport
├── EnvironmentManager
├── SceneMetrics
├── RealismManager
│   └── MaterialLibrary
├── QualityManager
└── render loop
```

## RealismManager

Responsabilidades:

- detectar materiais novos adicionados à cena;
- aplicar ajustes conforme Eco/Médio/Alto/Ultra;
- ativar hooks gráficos dos personagens;
- reaplicar parâmetros quando a qualidade muda;
- evitar editar individualmente todos os módulos.

O scan ocorre no primeiro frame e periodicamente para detectar objetos adicionados depois do `init()`.

## MaterialLibrary

A biblioteca gera pequenas texturas por `CanvasTexture`.

Não existem novos downloads de PNG/JPG nesta fase.

Exemplo:

```text
concrete
metal
rubber
painted
```

Na v0.20, o uso automático principal é microtextura de piso em Alto/Ultra.

## Personagens

`CharacterRig.root.userData.tstApplyGraphicsQuality` cria um hook genérico para o viewport.

Isso permite:

```text
quality:changed
↓
RealismManager
↓
CharacterRig.setGraphicsQuality()
```

## Efeitos

Smoke/Sparks alocam capacidade até Ultra, mas usam:

```js
geometry.setDrawRange(0, desiredCount)
```

Assim a quantidade pode mudar em tempo real sem reconstrução da geometria.

## Compatibilidade

Nenhuma cena precisa importar o RealismManager diretamente.

As cenas existentes continuam usando:

```js
new ThreeViewport(...)
```

e recebem G9 automaticamente.

## Limites atuais

G9.0 ainda não inclui:

- humano GLB fotorealista;
- SkinnedMesh de produção;
- mocap;
- HDRI pesado;
- texturas 2K/4K;
- ray tracing.

Esses recursos não devem ser introduzidos indiscriminadamente porque a plataforma precisa continuar funcionando em GitHub Pages e dispositivos escolares.
