export class RiskBridge {
  constructor(events, storage) {
    this.events = events;
    this.storage = storage;
    this.off = events.on('risk:identified', payload => this.capture(payload));
  }

  get inbox() {
    return this.storage.get('toolkit:risk-inbox', []);
  }

  normalize(payload) {
    const risk = payload?.risk ?? payload ?? {};
    const id = String(risk.id ?? `risk-${Date.now()}`);
    return {
      id,
      moduleId: risk.moduleId ?? id.split(':')[0] ?? 'laboratorio',
      moduleTitle: risk.moduleTitle ?? risk.moduleId ?? 'Laboratório TST 360',
      title: risk.title ?? risk.hazard ?? 'Risco identificado',
      hazard: risk.hazard ?? risk.title ?? 'Risco identificado',
      category: risk.category ?? risk.type ?? 'Acidente',
      severity: risk.severity ?? 'medium',
      explanation: risk.explanation ?? '',
      control: risk.control ?? '',
      firstSeen: new Date(payload?.timestamp ?? Date.now()).toISOString(),
      lastSeen: new Date(payload?.timestamp ?? Date.now()).toISOString(),
      occurrences: 1,
      variantId: risk.variantId ?? null,
      variantLabel: risk.variantLabel ?? null,
      status: 'new'
    };
  }

  capture(payload) {
    const item = this.normalize(payload);
    const inbox = this.inbox;
    const index = inbox.findIndex(row => row.id === item.id);

    if (index >= 0) {
      inbox[index] = {
        ...inbox[index],
        ...item,
        firstSeen: inbox[index].firstSeen,
        occurrences: (inbox[index].occurrences ?? 1) + 1,
        variantId: risk.variantId ?? null,
      variantLabel: risk.variantLabel ?? null,
      status: 'new'
      };
    } else {
      inbox.unshift(item);
    }

    this.storage.set('toolkit:risk-inbox', inbox.slice(0, 100));
    this.events.emit('toolkit:risk-captured', item);
  }

  dispose() {
    this.off?.();
    this.off = null;
  }
}
