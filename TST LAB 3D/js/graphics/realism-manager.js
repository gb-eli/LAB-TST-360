import {MaterialLibrary} from './material-library.js';

export class RealismManager{
  constructor(viewport){
    this.viewport=viewport;
    this.T=viewport.runtime.THREE;
    this.materials=new MaterialLibrary(viewport);
    this.enhanced=new WeakSet();
    this.qualityHooks=new WeakSet();
    this.frames=0;
    this.lastQuality=null;
  }

  quality(){
    return this.viewport.context.qualityManager.level;
  }

  scan(force=false){
    const level=this.quality(),settings=this.viewport.context.qualityManager.settings;
    const qualityChanged=this.lastQuality!==level;
    this.lastQuality=level;
    this.viewport.scene?.traverse(object=>{
      if(object.isMesh){
        object.receiveShadow=level!=='eco'&&(object.receiveShadow||object.userData?.g9ReceiveShadow!==false);
        if(!this.enhanced.has(object)||qualityChanged||force){
          const mats=Array.isArray(object.material)?object.material:[object.material];
          for(const material of mats)this.materials.enhanceMaterial(material,settings.materialDetail?level:(level==='eco'?'eco':'medium'),object);
          this.enhanced.add(object);
        }
      }
      const hook=object.userData?.tstApplyGraphicsQuality;
      if(typeof hook==='function'&&(!this.qualityHooks.has(object)||qualityChanged||force)){
        hook(level);
        this.qualityHooks.add(object);
      }
    });
  }

  update(){
    this.frames++;
    if(this.frames===1||this.frames%90===0)this.scan();
  }

  applyQuality(){
    this.scan(true);
  }

  dispose(){
    this.materials.dispose();
  }
}
