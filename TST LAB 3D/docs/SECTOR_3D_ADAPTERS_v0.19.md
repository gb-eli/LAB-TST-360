# Adapters Setoriais 3D — v0.19.0

## Construção

### Abertura de frente

| Missão | Cena Canteiro |
|---|---|
| edge | edge-open |
| route | cables |
| ladder | ladder |
| ppe | worker-ppe |

### Movimentação e altura

| Missão | Cena Canteiro |
|---|---|
| load | suspended-load |
| height | worker-height |
| base | cables |
| isolation | worker-ppe |

## Indústria

### Linha de produção

| Missão | Cena Indústria |
|---|---|
| guard | unguarded-machine |
| pedestrian | forklift-pedestrian |
| noise | noise-source |
| stop | emergency-stop |

### Abastecimento interno

| Missão | Cena Indústria |
|---|---|
| forklift | forklift-pedestrian |
| stack | boxes-route |
| extinguisher | blocked-extinguisher |
| floor | emergency-stop |

O marcador interno `emergency-stop` é reposicionado pelo adapter para representar material no corredor nesta missão. Ele funciona apenas como âncora técnica de picking; o risco mostrado ao usuário continua sendo `floor`.

## Obras Elétricas

### Preparação da área

| Missão | Cena Eletricidade |
|---|---|
| access | restricted-access |
| panel | open-panel |
| floor | working-zone |
| sign | warning |

### Instalação temporária

| Missão | Cena Eletricidade |
|---|---|
| cables | cable-route |
| box | open-panel |
| water | working-zone |
| materials | worker-position |

Marcadores reaproveitados podem receber offsets-base para se aproximar visualmente do elemento da missão.

## Regra

O ID interno do renderer nunca deve aparecer como resultado pedagógico.

O contrato público continua sendo o ID da missão profissional.
