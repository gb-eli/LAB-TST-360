# Campus Virtual TST — v0.19.0

## Cobertura 3D

A partir da v0.19:

```text
8 setores
8 setores com experiência 3D
```

O Campus obtém essa informação diretamente de:

```text
SECTOR_3D_IDS
```

Não existe lista paralela.

## Tipos de setor 3D

### Renderer setorial nativo

- Porto
- Saúde
- Escritório
- Almoxarifado
- Oficina

### Renderer reutilizado por adapter

- Construção
- Indústria
- Obras Elétricas

Para o usuário, os dois tipos funcionam da mesma forma:

```text
2D leve
3D
```

## Progresso

O progresso continua vindo exclusivamente do `InspectionSessionService`.

A origem técnica do renderer não altera o cálculo de missão concluída.
