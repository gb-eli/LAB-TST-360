# TST 360 — Arquitetura v0.13.0 / G8.3

## Objetivo

A v0.13.0 adiciona uma **Biblioteca de Cenários Profissionais por Setor** sobre os motores já construídos. A biblioteca não aumenta artificialmente o registro principal de laboratórios: os 8 laboratórios continuam sendo os módulos-base e as missões setoriais funcionam como experiências reutilizáveis carregadas por um `SectorHub`.

## Estrutura

```text
TST 360
├── 8 laboratórios principais
├── Central TST
└── Biblioteca de Cenários Profissionais
    ├── Construção Civil
    ├── Indústria
    ├── Logística e Porto
    ├── Saúde e Hospital
    ├── Escritório e Administrativo
    ├── Almoxarifado
    ├── Oficina e Manutenção
    └── Obras Elétricas
```

Cada setor possui inicialmente duas missões, totalizando **16 missões funcionais**.

## SectorHub

Arquivo:

```text
js/sectors/sector-hub.js
```

Responsabilidades:

- carregar `data/sectors/sectors.json`;
- apresentar cards de setor;
- acompanhar sessões concluídas localmente;
- apresentar missões;
- instanciar `createInspectionLab()` com a configuração da missão;
- destruir a missão corretamente ao navegar para outro setor ou voltar à home.

## Reuso do motor de inspeção

As missões setoriais utilizam o mesmo `createInspectionLab()` da v0.12. Por isso recebem automaticamente:

- RiskEngine;
- RiskBridge;
- notas de evidência;
- sessão de inspeção;
- relatório JSON;
- relatório HTML;
- Central TST;
- rascunho de Plano de Ação;
- persistência local.

Não existe uma segunda implementação de inspeção para os setores.

## Dados setoriais

Arquivo:

```text
data/sectors/sectors.json
```

Cada missão descreve:

```text
id
nome
contexto
descrição
orientação
4 riscos didáticos
```

Cada risco possui:

```text
id
título
categoria
severidade
posição do hotspot
pista
explicação
controle preventivo do cenário
```

Os IDs das missões são formados como:

```text
sector-<setor>-<missao>
```

Isso evita colisão com os oito módulos principais e permite que o `InspectionSessionService` trate laboratórios e missões setoriais com a mesma estrutura.

## Camada visual setorial

Na v0.13 as novas missões usam SVG vetorial leve, com identidade visual própria para cada setor. Essa decisão permite adicionar variedade com custo mínimo no GitHub Pages.

O renderer é desacoplado da missão. Uma missão setorial poderá receber Three.js/GLB posteriormente sem alterar:

- riscos;
- sessões;
- relatórios;
- Central TST;
- evidências;
- fluxo pedagógico.

## Princípio pedagógico

A biblioteca amplia a transferência de aprendizagem: o estudante não encontra somente o risco dentro de um laboratório técnico isolado; ele pratica o raciocínio do TST em setores profissionais distintos.

Todas as missões permanecem educacionais e não substituem inspeção, medição, protocolo, norma, capacitação ou responsabilidade profissional real.
