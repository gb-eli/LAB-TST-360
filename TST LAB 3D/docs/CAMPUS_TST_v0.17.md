# Campus Virtual TST — v0.17.0

## Evolução do 3D

Cada prédio agora apresenta:

- nome;
- missões concluídas/total;
- barra de progresso;
- destaque de setor 3D.

Setores 3D atuais:

1. Porto/Logística
2. Saúde/Hospital
3. Escritório
4. Almoxarifado

## Animação ambiental

Veículos decorativos percorrem as vias somente quando a qualidade permite.

Eles não carregam lógica pedagógica e podem ser ocultados sem perder nenhuma funcionalidade.

## Progresso

O Campus lê as sessões já salvas pelo `InspectionSessionService`.

Não cria um sistema paralelo de progresso.

## Navegação

Picking do prédio:

```text
sector:<sector-id>
```

continua gerando:

```text
campus:navigate
```

e o `app.js` resolve a mudança de view.
