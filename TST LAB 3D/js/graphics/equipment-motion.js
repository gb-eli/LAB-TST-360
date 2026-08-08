const LEVEL_INDEX={eco:0,medium:1,high:2,ultra:3};

function factorFor(level){
  if(level==='eco')return 0;
  if(level==='medium')return .58;
  if(level==='high')return 1;
  return 1.12;
}

export class EquipmentMotionController{
  constructor(viewport,options={}){
    this.viewport=viewport;
    this.options=options;
    this.T=viewport.runtime.THREE;
    this.bindings=[];
    this.created=[];
    this.disposed=false;
    viewport.addAnimator(frame=>this.update(frame));
  }

  scenarioFactor(channel='process'){
    return this.options.activityDirector?.equipmentFactor
      ? this.options.activityDirector.equipmentFactor(channel)
      : 1;
  }

  available(minimum='medium',channel='process'){
    const level=this.viewport.context.qualityManager.level;
    return LEVEL_INDEX[level]>=LEVEL_INDEX[minimum]
      &&this.viewport.context.qualityManager.settings.animations!==false
      &&this.scenarioFactor(channel)>0;
  }

  rotate(object,{axis='y',speed=1,minimum='medium',channel='process'}={}){
    if(!object)return null;
    const binding={type:'rotate',object,axis,speed,minimum,channel};
    this.bindings.push(binding);return binding;
  }

  vibrate(object,{axis='y',amplitude=.008,speed=14,minimum='high',channel='process'}={}){
    if(!object)return null;
    const base=object.position[axis];
    const binding={type:'vibrate',object,axis,amplitude,speed,minimum,base,channel};
    this.bindings.push(binding);return binding;
  }

  oscillate(object,{property='rotation',axis='y',amplitude=.05,speed=.7,minimum='medium',channel='process'}={}){
    if(!object)return null;
    const target=object[property];
    if(!target)return null;
    const base=target[axis];
    const binding={type:'oscillate',object,property,axis,amplitude,speed,minimum,base,channel};
    this.bindings.push(binding);return binding;
  }

  statusLight(parent,{position=[0,1,0],color=0x58d68d,intensity=.8,distance=4,speed=3,minimum='medium',channel='lights'}={}){
    const T=this.T;
    const group=new T.Group();group.position.set(...position);
    const material=new T.MeshStandardMaterial({
      color,emissive:color,emissiveIntensity:.55,roughness:.3,metalness:.08
    });
    const lens=new T.Mesh(new T.SphereGeometry(.075,12,8),material);
    const light=new T.PointLight(color,intensity,distance,2);
    group.add(lens,light);
    (parent??this.viewport.scene).add(group);
    const binding={type:'status',object:group,lens,light,intensity,speed,minimum,channel};
    this.bindings.push(binding);this.created.push(group);return binding;
  }

  resetBinding(binding){
    if(binding.type==='vibrate'&&binding.object)binding.object.position[binding.axis]=binding.base;
    if(binding.type==='oscillate'&&binding.object?.[binding.property])binding.object[binding.property][binding.axis]=binding.base;
    if(binding.type==='status'){
      if(binding.light)binding.light.intensity=0;
      if(binding.lens)binding.lens.material.emissiveIntensity=.12;
    }
  }

  update({delta,elapsed}){
    if(this.disposed)return;
    const level=this.viewport.context.qualityManager.level;
    const baseFactor=factorFor(level);
    for(const binding of this.bindings){
      const scenarioFactor=this.scenarioFactor(binding.channel);
      const factor=baseFactor*scenarioFactor;
      const active=this.available(binding.minimum,binding.channel);
      if(!active){
        this.resetBinding(binding);
        continue;
      }
      if(binding.type==='rotate'){
        binding.object.rotation[binding.axis]+=delta*binding.speed*factor;
      }else if(binding.type==='vibrate'){
        binding.object.position[binding.axis]=binding.base+Math.sin(elapsed*binding.speed)*binding.amplitude*factor;
      }else if(binding.type==='oscillate'){
        binding.object[binding.property][binding.axis]=binding.base+Math.sin(elapsed*binding.speed)*binding.amplitude*factor;
      }else if(binding.type==='status'){
        const pulse=.45+.55*(.5+.5*Math.sin(elapsed*binding.speed));
        binding.light.intensity=binding.intensity*pulse*factor;
        binding.lens.material.emissiveIntensity=.25+.75*pulse*factor;
      }
    }
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    for(const binding of this.bindings)this.resetBinding(binding);
    this.bindings.length=0;
    for(const group of this.created){
      group.traverse(object=>{
        object.geometry?.dispose?.();
        const materials=Array.isArray(object.material)?object.material:[object.material];
        for(const material of materials)material?.dispose?.();
      });
      group.removeFromParent?.();
    }
    this.created.length=0;
  }
}

export function createEquipmentMotion(viewport,options={}){
  return new EquipmentMotionController(viewport,options);
}
