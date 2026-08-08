# Experiências de Ambiente — v0.28.0

## Matriz inicial

| Setor | Panorama | Objeto 3D | Missão 3D |
|---|---|---|---|
| Construção | Canteiro 360 | Andaime | Movimentação e altura |
| Indústria | Fábrica 360 | Máquina | Linha de produção |
| Porto | Pátio 360 | Reach stacker | Pátio de contêineres |
| Saúde | Hospital 360 | Cama | Transporte interno |
| Escritório | Escritório 360 | Cadeira | Posto de trabalho |
| Almoxarifado | Armazenagem 360 | Rack | Armazenamento |
| Oficina | Oficina 360 | Esmeril | Corte/esmerilhamento |
| Elétrica | Área elétrica 360 | Painel | Preparação da área |

## Total

```text
8 panoramas
8 objetos em foco
8 missões
=
24 experiências
```

## Uso em aula

O professor pode:

- projetar;
- girar;
- aproximar;
- tocar em hotspots;
- alternar para tela de apresentação.

O aluno pode executar exatamente as mesmas ações.

Não existe bloqueio ou interface diferente.

## Uso individual

No celular:

- panorama usa pointer/touch horizontal;
- hotspot pode ser tocado;
- objeto 3D usa OrbitControls;
- cards empilham em uma coluna.

## Evolução

Cada arquivo setorial pode receber novas experiências.

Exemplo:

```text
porto-logistica.json
├── panorama-patio
├── panorama-doca
├── reach-stacker
├── container
├── caminhão
└── missão
```

sem modificar `saude.json` ou `oficina.json`.
