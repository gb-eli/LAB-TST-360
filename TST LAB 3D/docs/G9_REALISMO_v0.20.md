# G9 — Realismo Adaptativo v0.20.0

## Princípio

Realismo não é apenas número de polígonos.

A camada G9 prioriza:

1. iluminação coerente;
2. contato com o chão;
3. variação de superfície;
4. movimento sutil;
5. efeitos proporcionais ao hardware;
6. estabilidade de FPS.

## Perfis

| Recurso | Eco | Médio | Alto | Ultra |
|---|---:|---:|---:|---:|
| Pixel ratio cap | 1.0 | 1.25 | 1.6 | 2.0 |
| Shadow map | off | 1024 | 1536 | 2048 |
| Contact shadow personagem | off | leve | sim | reforçada |
| Piso procedural | off | off | sim | sim |
| Anisotropia | 1 | 1 | até 4 | até 8 |
| Partículas | 20% | 55% | 100% | 125% |
| Rim light | off | reduzida | alta | completa |

## Microtextura

A textura é produzida no navegador.

Benefícios:

- zero arquivo externo;
- poucos KB de memória;
- funciona offline depois do carregamento da aplicação;
- pode ser desativada instantaneamente.

## Sombra de contato

Não é uma simulação física de GI.

É uma pequena forma transparente sob o personagem para reduzir o efeito visual de “flutuação”.

## Movimento humano

Em `idle` e `inspect`:

- torso possui oscilação muito pequena;
- pescoço possui pequeno movimento lateral;
- root recebe deslocamento vertical mínimo.

Esses movimentos são deliberadamente discretos.

## Próximos marcos G9

- controlador unificado de personagem;
- suporte opcional a personagens GLB animados;
- AnimationMixer real quando houver um asset compatível;
- materiais procedurais adicionais;
- decals leves;
- sombras de contato para equipamentos focais;
- pequenas animações de máquina ligadas ao contexto.
