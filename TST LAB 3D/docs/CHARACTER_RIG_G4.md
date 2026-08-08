# Character Rig G4

## Por que existe

Antes de introduzir personagens 3D pesados, o TST 360 precisa validar como os laboratórios comandam postura, animação e estados humanos. O G4 cria essa interface com um rig leve.

## Estados atuais

| Estado | Uso inicial |
|---|---|
| `idle` | EPI Lab / espera |
| `inspect` | TST observando atividade |
| `reach` | alcance de objeto/área |
| `walk` | circulação no canteiro |
| `climb` | representação de subida |
| `crouch` | inspeção baixa |
| `seated` | ergonomia |

## Regra de evolução

O módulo não deve conhecer ossos como `mixamorigLeftArm` ou equivalentes. A futura camada de adaptação para GLB/skinning traduzirá estados genéricos do TST 360 para o esqueleto do modelo real.
