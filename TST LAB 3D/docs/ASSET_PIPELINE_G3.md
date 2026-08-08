# Pipeline de Assets G3

## Como substituir um modelo sem alterar o laboratório

1. Coloque o novo `.glb` na pasta do módulo.
2. Atualize somente o caminho correspondente no `manifest.json` do pacote G3.
3. Preserve o ID lógico (`helmet`, `ladder`, etc.).
4. Ajuste `transform` se necessário.
5. Mantenha uma variante leve para Eco/Médio.

Exemplo:

```json
"helmet": {
  "lod": {
    "eco": "helmet_lod0.glb",
    "medium": "helmet_lod0.glb",
    "high": "helmet_lod1.glb",
    "ultra": "helmet_lod2.glb"
  }
}
```

## Diretriz de peso

Preferir vários assets pequenos e compartilháveis a um único cenário monolítico. Texturas grandes e modelos detalhados devem ser carregados apenas quando visíveis ou necessários.
