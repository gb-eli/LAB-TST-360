# TST 360 — Arquitetura v0.6 / G4

## Objetivo

Adicionar comportamento humano e postura ao pipeline gráfico sem acoplar os laboratórios a um modelo 3D específico.

## Novo componente compartilhado

```text
js/graphics/character-rig.js
```

O rig é hierárquico e procedural. Isso permite validar articulações, estados e APIs antes de trocar o corpo por um personagem `SkinnedMesh`/GLB mais pesado.

## Hierarquia conceitual

```text
CharacterRoot
└── Pelvis
    ├── Torso
    │   ├── Neck / Head
    │   ├── Shoulder L → Elbow L → Hand L
    │   └── Shoulder R → Elbow R → Hand R
    ├── Hip L → Knee L → Foot L
    └── Hip R → Knee R → Foot R
```

## API de postura

```js
const worker = createCharacterRig(THREE, { pose: 'inspect' });
worker.setPose('walk');
worker.update(delta, elapsed);
```

O laboratório define apenas o estado sem manipular diretamente cada malha.

## Renderers que reutilizam o rig

- EPI Lab: postura neutra e visualização dos EPIs.
- Canteiro: caminhada, inspeção e subida.
- Ergonomia: postura sentada e ajuste do pescoço.

## Assets G4

Os manifests G4 podem apontar para arquivos G3 usando caminhos relativos. Isso evita duplicar binários no repositório.

```text
G4 manifest
├── novos assets G4
└── referências ../g3/*.glb
```

## Política de desempenho

```text
Eco    → 30 FPS alvo
Médio  → 45 FPS alvo
Alto   → 60 FPS alvo
Ultra  → 60 FPS alvo
```

O `QualityManager` continua controlando pixel ratio, sombras, LOD e outros parâmetros.

## Próxima evolução

O contrato do `CharacterRig` deve ser preservado quando o personagem passar de geometria procedural para GLB com esqueleto. O laboratório continuará chamando `setPose()`/`update()` ou uma camada equivalente, sem depender de nomes internos de ossos.
