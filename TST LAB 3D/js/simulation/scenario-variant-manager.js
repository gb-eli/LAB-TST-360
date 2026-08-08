export class ScenarioVariantManager {
  constructor(storage) {
    this.storage = storage;
  }

  sequenceKey(moduleId) {
    return `scenario-variant-seq:${moduleId}`;
  }

  select(moduleId, variants = [], {advance = false} = {}) {
    if (!variants.length) return null;

    let sequence = Number(this.storage.get(this.sequenceKey(moduleId), 0)) || 0;
    if (advance) {
      sequence = (sequence + 1) % variants.length;
      this.storage.set(this.sequenceKey(moduleId), sequence);
    }

    const variant = variants[sequence % variants.length];
    return {
      ...variant,
      sequence,
      id: variant.id ?? `variant-${sequence + 1}`,
      label: variant.label ?? `Variante ${sequence + 1}`
    };
  }

  applyRisks(baseRisks = [], variant = null) {
    if (!variant) return baseRisks.map(risk => ({...risk}));

    const active = new Set(variant.activeRiskIds?.length ? variant.activeRiskIds : baseRisks.map(r => r.id));
    const overrides = variant.riskOverrides ?? {};
    const offsets = variant.markerOffsets ?? {};

    return baseRisks
      .filter(risk => active.has(risk.id))
      .map(risk => {
        const offset = offsets[risk.id] ?? [0, 0];
        return {
          ...risk,
          ...(overrides[risk.id] ?? {}),
          x: Math.max(2, Math.min(98, Number(risk.x ?? 50) + Number(offset[0] ?? 0))),
          y: Math.max(2, Math.min(98, Number(risk.y ?? 50) + Number(offset[1] ?? 0)))
        };
      });
  }
}
