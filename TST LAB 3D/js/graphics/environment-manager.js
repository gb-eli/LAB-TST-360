function disposeObject(object){
  if(!object)return;
  object.removeFromParent?.();
  object.traverse?.(node=>{
    node.geometry?.dispose?.();
    const mats=Array.isArray(node.material)?node.material:[node.material];
    for(const mat of mats){if(!mat)continue;for(const value of Object.values(mat))if(value?.isTexture)value.dispose?.();mat.dispose?.()}
  });
}

const PRESETS={
  neutral:{background:0x0b1520,fog:0x0b1520,hemisphere:[0xc9e4ff,0x2d2923,1.2],sun:[0xffffff,2.0,[5,8,5]],fill:[0x9fcfff,.55,[-4,4,3]],exposure:1.0,fogNear:12,fogFar:34},
  outdoor:{background:0x91bdd4,fog:0x91bdd4,hemisphere:[0xd8efff,0x66513a,1.45],sun:[0xfff1d0,2.65,[7,10,5]],fill:[0xb7dcff,.6,[-5,4,2]],exposure:1.03,fogNear:18,fogFar:44},
  industrial:{background:0x152331,fog:0x152331,hemisphere:[0xb9d5e6,0x292722,.92],sun:[0xe8f4ff,1.45,[4,7,4]],fill:[0x75b6e6,.85,[-5,3,2]],rim:[0xffc47a,.7,[5,4,-4]],exposure:.96,fogNear:13,fogFar:36},
  confined:{background:0x071117,fog:0x071117,hemisphere:[0x7da4b6,0x19140f,.45],sun:[0xb8d9e6,.72,[2,6,3]],fill:[0x3d87a6,.62,[-3,2,2]],rim:[0xf0a94e,.85,[4,2,-3]],exposure:.84,fogNear:7,fogFar:24},
  office:{background:0x20384a,fog:0x20384a,hemisphere:[0xe7f2fa,0x3b352e,1.2],sun:[0xffffff,1.55,[4,7,4]],fill:[0x9dd4ff,.5,[-4,3,2]],exposure:1.02,fogNear:15,fogFar:38},
  electrical:{background:0x172532,fog:0x172532,hemisphere:[0xc9e4f0,0x272b2d,.92],sun:[0xeaf7ff,1.35,[5,7,5]],fill:[0x7cc7ef,.72,[-4,3,2]],rim:[0xffc85e,.52,[4,3,-3]],exposure:.96,fogNear:13,fogFar:34},
  emergency:{background:0x121b22,fog:0x222a2d,hemisphere:[0xb6c4c8,0x251d1a,.55],sun:[0xdce8e8,.6,[4,7,4]],fill:[0x62a89a,.4,[-4,2,2]],rim:[0xe85a4f,.95,[5,3,-3]],exposure:.82,fogNear:7,fogFar:25},
  forensic:{background:0x101820,fog:0x151d23,hemisphere:[0xd8e6ee,0x292724,.82],sun:[0xf0f7fa,1.18,[5,8,4]],fill:[0x77bde0,.58,[-5,3,3]],rim:[0xf2c178,.56,[5,3,-4]],exposure:.94,fogNear:13,fogFar:38}
};

export class EnvironmentManager{
  constructor(viewport,preset='neutral'){
    this.viewport=viewport;this.THREE=viewport.runtime.THREE;this.presetName=preset;this.group=new this.THREE.Group();this.group.name='TSTEnvironmentLights';this.viewport.scene.add(this.group);this.lights=[];this.apply(preset)
  }
  clear(){for(const light of this.lights)light.removeFromParent?.();this.lights.length=0;this.group.clear();this.hemi=this.sun=this.fill=this.rim=null}
  addLight(light){this.group.add(light);this.lights.push(light);return light}
  apply(name='neutral'){
    this.clear();this.presetName=PRESETS[name]?name:'neutral';const p=PRESETS[this.presetName],T=this.THREE,scene=this.viewport.scene;
    scene.background=new T.Color(p.background);scene.fog=new T.Fog(p.fog,p.fogNear,p.fogFar);
    const hemi=new T.HemisphereLight(...p.hemisphere);this.hemi=this.addLight(hemi);
    const sun=new T.DirectionalLight(p.sun[0],p.sun[1]);sun.position.set(...p.sun[2]);sun.castShadow=true;sun.shadow.camera.near=.1;sun.shadow.camera.far=42;sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;sun.shadow.bias=-.00018;sun.shadow.normalBias=.025;sun.shadow.radius=2;this.sun=this.addLight(sun);this.viewport.sun=sun;
    const fill=new T.PointLight(p.fill[0],p.fill[1],24,2);fill.position.set(...p.fill[2]);this.fill=this.addLight(fill);
    if(p.rim){const rim=new T.PointLight(p.rim[0],p.rim[1],20,2);rim.position.set(...p.rim[2]);this.rim=this.addLight(rim)}
    this.viewport.renderer.toneMapping=T.ACESFilmicToneMapping;this.viewport.renderer.toneMappingExposure=p.exposure;
    this.applyQuality();
  }
  applyQuality(){
    const level=this.viewport.context.qualityManager.level,shadows=this.viewport.context.qualityManager.settings.shadows,p=PRESETS[this.presetName]??PRESETS.neutral;
    if(this.viewport.sun){
      this.viewport.sun.castShadow=!!shadows;
      const size=level==='ultra'?2048:level==='high'?1536:level==='medium'?1024:512;
      if(this.viewport.sun.shadow.mapSize.width!==size){this.viewport.sun.shadow.mapSize.set(size,size);this.viewport.sun.shadow.map?.dispose?.();this.viewport.sun.shadow.map=null}
      this.viewport.sun.shadow.radius=level==='ultra'?3:level==='high'?2.4:1.4;
      this.viewport.sun.shadow.normalBias=level==='eco'?.04:.022;
      this.viewport.sun.intensity=p.sun[1]*(level==='eco'?.86:level==='medium'?.94:level==='ultra'?1.04:1);
    }
    if(this.hemi)this.hemi.intensity=p.hemisphere[2]*(level==='eco'?.92:1);
    if(this.fill)this.fill.intensity=p.fill[1]*(level==='eco'?.45:level==='medium'?.75:1);
    if(this.rim)this.rim.intensity=(p.rim?.[1]??0)*(level==='eco'?0:level==='medium'?.55:level==='high'?.82:1);
    const exposure=p.exposure??1;this.viewport.renderer.toneMappingExposure=level==='eco'?exposure*.9:level==='ultra'?exposure*1.04:exposure;
  }
  dispose(){this.clear();disposeObject(this.group)}
}

export const ENVIRONMENT_PRESETS=Object.freeze(Object.keys(PRESETS));
