# Campus Virtual TST — v0.16.0

## Dois modos

### Mapa 2D

- padrão leve;
- funciona sem WebGL;
- zonas setoriais;
- atalhos de laboratório;
- Central TST;
- progresso local.

### Maquete 3D

- Three.js carregado sob demanda;
- câmera orbital;
- prédios clicáveis;
- labels;
- vias;
- Central TST;
- pavilhão de laboratórios;
- SceneMetrics;
- budget próprio.

## Navegação

O Campus nunca abre o destino diretamente.

Ele emite:

```js
campus:navigate
```

O `app.js` resolve o destino.

## Dispositivos móveis

Abaixo da maquete 3D existem botões dos setores. Eles funcionam como alternativa ao picking tridimensional em telas pequenas.

Se o 3D falhar, o Campus retorna automaticamente ao mapa 2D.
