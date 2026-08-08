export class PerformanceBudgetManager {
  constructor(events, storage, assets, qualityManager) {
    this.events = events;
    this.storage = storage;
    this.assets = assets;
    this.qualityManager = qualityManager;
    this.config = null;
    this.moduleId = null;
    this.latest = null;
    this.off = [];
  }

  async init() {
    this.config = await this.assets.json('data/performance/budgets.json', {cache:'no-cache'});
    this.off.push(
      this.events.on('module:opened', ({manifest}) => {
        this.moduleId = manifest?.id ?? null;
        this.latest = null;
      }),
      this.events.on('module:closed', () => {
        this.moduleId = null;
        this.latest = null;
        this.events.emit('performance:budget', null);
      }),
      this.events.on('scene:metrics', metrics => {
        if (metrics) this.evaluate(metrics);
      })
    );
    return this;
  }

  budgetFor(moduleId=this.moduleId, quality=this.qualityManager.level) {
    return this.config?.modules?.[moduleId]?.profiles?.[quality] ?? null;
  }

  evaluate(metrics) {
    const budget = this.budgetFor();
    if (!budget || !this.moduleId) return null;

    const checks = [
      {key:'fps', label:'FPS', value:metrics.fps, limit:budget.minFps, type:'min'},
      {key:'calls', label:'draw calls', value:metrics.calls, limit:budget.maxCalls, type:'max'},
      {key:'triangles', label:'triângulos', value:metrics.triangles, limit:budget.maxTriangles, type:'max'},
      {key:'textures', label:'texturas', value:metrics.textures, limit:budget.maxTextures, type:'max'},
      {key:'geometries', label:'geometrias', value:metrics.geometries, limit:budget.maxGeometries, type:'max'}
    ];

    const violations = checks.filter(item =>
      item.type === 'min' ? item.value < item.limit : item.value > item.limit
    );

    const ratios = checks.map(item => {
      if (item.type === 'min') return item.value > 0 ? item.limit / item.value : 10;
      return item.limit > 0 ? item.value / item.limit : 0;
    });
    const worstRatio = Math.max(...ratios);
    const status = violations.length === 0 ? 'ok' : worstRatio >= 1.35 ? 'over' : 'attention';

    this.latest = {
      moduleId: this.moduleId,
      quality: this.qualityManager.level,
      status,
      violations,
      metrics,
      budget,
      timestamp: Date.now()
    };

    this.storage.set(`performance:last:${this.moduleId}`, this.latest);
    this.events.emit('performance:budget', this.latest);
    return this.latest;
  }

  dispose() {
    this.off.forEach(off => off?.());
    this.off.length = 0;
  }
}
