# Equipment Motion Controller — v0.21.0

## Objetivo

Adicionar vida a máquinas sem embutir lógica de animação em cada scene file.

## API

### rotate

```js
motion.rotate(object,{
  axis:'y',
  speed:1,
  minimum:'medium'
});
```

### vibrate

```js
motion.vibrate(object,{
  axis:'y',
  amplitude:.004,
  speed:17,
  minimum:'high'
});
```

### oscillate

```js
motion.oscillate(object,{
  property:'rotation',
  axis:'y',
  amplitude:.04
});
```

### statusLight

```js
motion.statusLight(scene,{
  position:[1,2,0],
  color:0xe25f4f,
  minimum:'medium'
});
```

## Adaptação

Motion lê a qualidade a cada frame.

Portanto:

```text
High
↓ usuário muda para Eco
↓
motion para automaticamente
```

sem recriar a cena.

## Usos atuais

### Indústria

- vibração mínima de máquina em Alto/Ultra;
- indicador de máquina;
- indicador de empilhadeira em Alto/Ultra.

### Oficina — corte

- vibração mínima do equipamento;
- indicador contextual.

### Oficina — manutenção

Somente indicador.

A máquina **não** é animada como operando durante a preparação para manutenção.
