# Auditoria Gráfica — TST 360 v0.35.0 / G10.5

## Objetivo
Aumentar realismo e identidade dos ambientes sem transformar a plataforma em um pacote pesado.

## Diagnóstico
A arquitetura já tinha boa cobertura 3D/360, mas vários cenários ainda compartilhavam linguagem visual muito semelhante. O problema principal não era falta de engine, e sim falta de **identidade material/contextual por setor**.

## Mudança aplicada
Foi criada uma camada transversal:

```text
ThreeViewport
→ ContextualDressingManager
→ SectorVisualProfile
```

Cada cena pode declarar um perfil visual sem duplicar lógica.

## Ganhos
### Porto
- material de piso contextual tipo asphalt;
- volumes periféricos e painéis genéricos;
- identidade visual portuária sem adicionar novos modelos.

### Saúde
- material visual tipo tile;
- contexto mais limpo e institucional;
- elementos periféricos controlados por qualidade.

### Escritório
- material visual tipo wood;
- ambientação mais quente;
- dressing reduzido no estúdio de objeto.

### Indústria / Elétrica
- material visual tipo epoxy;
- volumes técnicos genéricos e sinalização visual.

### Construção / Almoxarifado / Oficina
- base concrete com dressing próprio de ambiente.

## Performance
A camada usa criação incremental:
- Eco 1;
- Médio 3;
- Alto 5;
- Ultra 7.

No pior caso teórico atual, a camada adiciona aproximadamente 21 drawables e ~534 triângulos — muito abaixo do custo dos modelos principais.

## Pontos ainda a evoluir
1. materiais dos GLBs ainda dependem do próprio asset;
2. props procedurais melhoram contexto, mas não substituem props 3D detalhados quando houver necessidade;
3. panoramas de referência continuam menos realistas que fotografia 360 real;
4. personagens ainda são low-poly e devem evoluir progressivamente.

## Próxima prioridade recomendada
G10.6:
- props setoriais G2 leves e reutilizáveis;
- pequenos packs GLB por contexto;
- LOD obrigatório;
- instancing para repetição;
- zero dependência de um grande cenário monolítico.

## Limitação da auditoria
A auditoria interativa via Chromium headless foi tentada, mas o runtime deste ambiente não encerrou corretamente por dependências de sistema/DBus. Portanto, não há alegação de aprovação visual automatizada em navegador real nesta release.
