# Arquitetura v0.38.0 — G10.8

## Atmosphere layer

```text
ThreeViewport
↓
EnvironmentManager
↓
EnvironmentAtmosphereManager
```

O EnvironmentManager mantém iluminação-base e shadows.

O EnvironmentAtmosphereManager adiciona:
- shell de fundo;
- tonalidade setorial;
- fog adaptativa;
- luzes de acento.

## Ordem de applyQuality

```text
renderer
→ EnvironmentManager
→ RealismManager
→ Dressing
→ Context Props
→ Scenic Props
→ Atmosphere
```

A atmosfera roda após o EnvironmentManager para poder aplicar a identidade cromática final do setor.

## Lifecycle

O shell só é criado quando Medium ou superior é usado.

Eco inicial não cria CanvasTexture nem SphereGeometry da atmosfera.
