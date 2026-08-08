# Auditoria da Camada Atmosférica — v0.38.0

## Objetivo

Aumentar a identidade dos ambientes sem repetir o erro comum de usar HDRIs e pós-processamento pesado em todos os dispositivos.

## Decisão

A G10.8 usa:
- gradiente procedural;
- fog existente;
- tint das luzes existentes;
- 0/1/2 luzes extras conforme qualidade.

## Benefícios

- zero novos assets de imagem;
- Eco sem custo de shell;
- identidade visual por setor;
- cena de emergência separada da elétrica;
- integração única no ThreeViewport.

## Limites

Não é:
- simulação luminotécnica;
- medição de iluminância;
- reprodução fotométrica;
- previsão de fumaça/neblina;
- representação certificada de visibilidade.

É direção visual educacional.
