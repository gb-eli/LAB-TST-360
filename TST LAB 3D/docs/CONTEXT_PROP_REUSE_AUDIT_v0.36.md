# Auditoria de Reuso de Props — v0.36.0

## Decisão de engenharia

A primeira hipótese para G10.6 seria criar vários novos GLBs por setor.

A auditoria mostrou que os packs existentes já possuem objetos suficientes para uma primeira camada de contexto.

Por isso a v0.36 prioriza:

```text
reuso > duplicação
```

## Benefícios

- ZIP praticamente não cresce por assets;
- cache do AssetManager é reaproveitado;
- LOD existente continua válido;
- manutenção de um único arquivo por objeto;
- menor risco de divergência visual entre cópias.

## Limite

Alguns objetos existentes também aparecem em situações de risco das cenas principais.

Para reduzir confusão, as instâncias contextuais:
- ficam em posições periféricas;
- não são pickables;
- são marcadas `tstIgnoreRisk`;
- não entram em evidências ou relatórios.

Em fases futuras, props exclusivamente cenográficos podem ser criados quando houver ganho visual suficiente para justificar novos arquivos.
