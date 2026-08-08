export class SceneMetrics{
  constructor(viewport){
    this.viewport=viewport;
    this.frames=0;
    this.last=performance.now();
    this.latest=null;
  }

  frame(timestamp=performance.now()){
    this.frames++;
    const elapsed=timestamp-this.last;
    if(elapsed<900)return;
    const renderer=this.viewport.renderer;
    const info=renderer?.info;
    if(!info)return;
    let instances=0,instancedDrawables=0;
    this.viewport.scene?.traverse(object=>{
      if(object?.isInstancedMesh){instancedDrawables++;instances+=object.count||0}
    });
    const assetStats=this.viewport.context.assetManager?.stats?.()||{};
    this.latest={
      fps:Math.round(this.frames*1000/elapsed),
      targetFps:this.viewport.targetFps?.()||60,
      calls:info.render?.calls||0,
      triangles:info.render?.triangles||0,
      geometries:info.memory?.geometries||0,
      textures:info.memory?.textures||0,
      instancedDrawables,
      instances,
      cachedAssets:assetStats.cached||0,
      assetRefs:assetStats.refs||0,
      dressing:this.viewport.dressing?.stats?.()??null,
      contextProps:this.viewport.contextProps?.stats?.()??null,
      scenicProps:this.viewport.scenicProps?.stats?.()??null,
      atmosphere:this.viewport.atmosphere?.stats?.()??null,
      quality:this.viewport.context.qualityManager?.level||'medium',
      timestamp:Date.now()
    };
    this.viewport.context.events?.emit('scene:metrics',this.latest);
    this.frames=0;
    this.last=timestamp;
  }

  snapshot(){return this.latest}
  dispose(){this.viewport.context.events?.emit('scene:metrics',null);this.viewport=null;this.latest=null}
}
