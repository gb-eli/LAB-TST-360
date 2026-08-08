# Character Appearance — v0.24.0

## Arquivos

```text
js/graphics/character-appearance.js
data/characters/appearances.json
```

## Objetivo

Permitir diferenças visuais entre personagens sem duplicar GLBs.

## Perfis atuais

```text
standard
warm
deep
cool
```

Cada perfil define cores genéricas para:

```text
skin
worker uniform
TST uniform
vest
helmet
pants
```

## Exemplo

```js
createCharacterController(viewport,{
  asset:characterAsset('worker'),
  appearance:'warm'
});
```

## Segurança de materiais

A função clona cada material da instância antes de alterar sua cor.

Isso preserva outros personagens que compartilham o mesmo source GLTF.

## Dispose

Materiais clonados são descartados com o controller.

## Limite

Os perfis são apenas variações visuais de personagens fictícios.

Não representam identidade, etnia, raça ou atributos pessoais de usuários reais.
