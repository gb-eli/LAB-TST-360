const LEVEL_INDEX={eco:0,medium:1,high:2,ultra:3};

export function ambientActivityPlanForQuality(level='medium',qualitySettings={},options={}){
  return{
    level,
    count:options.counts?.[level]??qualitySettings.ambientActivityCount??({eco:0,medium:2,high:4,ultra:6}[level]??0),
    activeDistance:options.activeDistance?.[level]??qualitySettings.ambientActiveDistance??({eco:0,medium:14,high:20,ultra:26}[level]??0),
    factor:options.factor?.[level]??qualitySettings.ambientMotionFactor??({eco:0,medium:.55,high:1,ultra:1.15}[level]??0)
  };
}

function clamp01(v){return Math.max(0,Math.min(1,v))}
function pingPong(t){
  const x=((t%2)+2)%2;
  return x<=1?x:2-x;
}
function loop01(t){return ((t%1)+1)%1}

function segmentSample(points,t){
  if(!Array.isArray(points)||points.length<2)return{position:points?.[0]??[0,0,0],direction:[0,0,1]};
  const scaled=clamp01(t)*(points.length-1);
  const index=Math.min(points.length-2,Math.floor(scaled));
  const u=scaled-index;
  const a=points[index],b=points[index+1];
  return{
    position:[
      a[0]+(b[0]-a[0])*u,
      a[1]+(b[1]-a[1])*u,
      a[2]+(b[2]-a[2])*u
    ],
    direction:[b[0]-a[0],b[1]-a[1],b[2]-a[2]]
  };
}

export class AmbientActivityManager{
  constructor(viewport,options={}){
    this.viewport=viewport;
    this.context=viewport.context;
    this.T=viewport.runtime.THREE;
    this.options=options;
    this.bindings=[];
    this.created=[];
    this.disposed=false;
    this.viewport.addAnimator(frame=>this.update(frame));
  }

  settings(){
    const base=ambientActivityPlanForQuality(
      this.context.qualityManager.level,
      this.context.qualityManager.settings,
      this.options
    );
    return this.options.activityDirector?.ambientPlan
      ? this.options.activityDirector.ambientPlan(base)
      : base;
  }

  minimumAllowed(minimum='medium'){
    return LEVEL_INDEX[this.context.qualityManager.level]>=LEVEL_INDEX[minimum];
  }

  distanceToCamera(object,anchor=null){
    const camera=this.viewport.camera;
    if(!camera)return 0;
    const p=anchor??object?.position;
    if(!p)return 0;
    const x=Array.isArray(p)?p[0]:p.x;
    const y=Array.isArray(p)?p[1]:p.y;
    const z=Array.isArray(p)?p[2]:p.z;
    const dx=x-camera.position.x,dy=y-camera.position.y,dz=z-camera.position.z;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
  }

  add(binding){
    binding.index=this.bindings.length;
    binding.phase=binding.phase??(binding.index*.173);
    this.bindings.push(binding);
    return binding;
  }

  path(object,points,{speed=.08,loop='pingpong',orient=true,minimum='medium',phase=0,priority=0,resetOnDisable=false,hideWhenInactive=false,anchor=null,channel='traffic'}={}){
    if(!object||!Array.isArray(points)||points.length<2)return null;
    const base={
      position:[object.position.x,object.position.y,object.position.z],
      rotationY:object.rotation?.y??0,
      visible:object.visible!==false
    };
    const routeAnchor=anchor??points.reduce(
      (sum,p)=>[sum[0]+p[0]/points.length,sum[1]+p[1]/points.length,sum[2]+p[2]/points.length],
      [0,0,0]
    );
    return this.add({type:'path',object,points,speed,loop,orient,minimum,phase,priority,base,resetOnDisable,hideWhenInactive,anchor:routeAnchor,channel});
  }

  oscillate(object,{property='rotation',axis='y',amplitude=.12,speed=.5,minimum='medium',phase=0,priority=0,channel='process'}={}){
    if(!object?.[property])return null;
    const base=object[property][axis];
    return this.add({type:'oscillate',object,property,axis,amplitude,speed,minimum,phase,priority,base,channel});
  }

  rotate(object,{axis='y',speed=.8,minimum='medium',priority=0,channel='process'}={}){
    if(!object?.rotation)return null;
    return this.add({type:'rotate',object,axis,speed,minimum,priority,channel});
  }

  door(object,{axis='x',distance=1.1,speed=.18,minimum='medium',phase=0,priority=0,dwell=.18,channel='doors'}={}){
    if(!object?.position)return null;
    return this.add({type:'door',object,axis,distance,speed,minimum,phase,priority,dwell,base:object.position[axis],channel});
  }

  pulseLight(parent,{position=[0,1,0],color=0x58d68d,intensity=.65,distance=4,speed=2.5,minimum='medium',priority=0,channel='lights'}={}){
    const T=this.T;
    const group=new T.Group();group.position.set(...position);
    const material=new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.45,roughness:.3,metalness:.08});
    const lens=new T.Mesh(new T.SphereGeometry(.07,10,7),material);
    const light=new T.PointLight(color,intensity,distance,2);
    group.add(lens,light);
    (parent??this.viewport.scene).add(group);
    this.created.push(group);
    return this.add({type:'light',object:group,lens,light,color,intensity,distance,speed,minimum,priority,channel});
  }

  reset(binding){
    if(binding.type==='path'&&binding.resetOnDisable){
      binding.object.position.set(...binding.base.position);
      if(binding.object.rotation)binding.object.rotation.y=binding.base.rotationY;
    }
    if(binding.type==='oscillate'&&binding.object?.[binding.property]){
      binding.object[binding.property][binding.axis]=binding.base;
    }
    if(binding.type==='door'){
      binding.object.position[binding.axis]=binding.base;
    }
    if(binding.type==='light'){
      binding.light.intensity=0;
      binding.lens.material.emissiveIntensity=.08;
    }
  }

  channelFactor(binding){
    return this.options.activityDirector?.ambientChannelFactor
      ? this.options.activityDirector.ambientChannelFactor(binding.channel??'process')
      : 1;
  }

  isActive(binding,settings){
    if(settings.factor<=0||settings.count<=0)return false;
    if(this.channelFactor(binding)<=0)return false;
    if(!this.minimumAllowed(binding.minimum))return false;
    if(this.context.qualityManager.settings.animations===false)return false;
    return this.distanceToCamera(binding.object,binding.anchor)<=settings.activeDistance;
  }

  updatePath(binding,elapsed,factor){
    const raw=(elapsed+binding.phase)*binding.speed*factor;
    const t=binding.loop==='loop'?loop01(raw):pingPong(raw);
    const sample=segmentSample(binding.points,t);
    binding.object.position.set(...sample.position);
    if(binding.orient&&binding.object.rotation){
      const [dx,,dz]=sample.direction;
      if(Math.abs(dx)+Math.abs(dz)>.0001){
        let yaw=Math.atan2(dx,dz);
        if(binding.loop!=='loop'){
          const x=((raw%2)+2)%2;
          if(x>1)yaw+=Math.PI;
        }
        binding.object.rotation.y=yaw;
      }
    }
  }

  updateDoor(binding,elapsed,factor){
    let t=pingPong((elapsed+binding.phase)*binding.speed*factor);
    const dwell=clamp01(binding.dwell);
    if(t<dwell)t=0;
    else if(t>1-dwell)t=1;
    else t=(t-dwell)/(1-2*dwell);
    const eased=t*t*(3-2*t);
    binding.object.position[binding.axis]=binding.base+binding.distance*eased;
  }

  update({delta,elapsed}){
    if(this.disposed)return;
    const settings=this.settings();
    const ordered=[...this.bindings].sort((a,b)=>(b.priority??0)-(a.priority??0)||a.index-b.index);
    const allowed=new Set(ordered.slice(0,settings.count));

    for(const binding of this.bindings){
      const active=allowed.has(binding)&&this.isActive(binding,settings);
      binding.active=active;
      if(binding.hideWhenInactive&&binding.object){
        binding.object.visible=active;
      }
      if(!active){
        this.reset(binding);
        continue;
      }
      if(binding.hideWhenInactive&&binding.object){
        binding.object.visible=true;
      }
      const factor=settings.factor*this.channelFactor(binding);
      if(binding.type==='path')this.updatePath(binding,elapsed,factor);
      else if(binding.type==='oscillate'){
        binding.object[binding.property][binding.axis]=binding.base+Math.sin((elapsed+binding.phase)*binding.speed)*binding.amplitude*factor;
      }else if(binding.type==='rotate'){
        binding.object.rotation[binding.axis]+=delta*binding.speed*factor;
      }else if(binding.type==='door'){
        this.updateDoor(binding,elapsed,factor);
      }else if(binding.type==='light'){
        const pulse=.38+.62*(.5+.5*Math.sin((elapsed+binding.phase)*binding.speed));
        binding.light.intensity=binding.intensity*pulse*factor;
        binding.lens.material.emissiveIntensity=.18+.72*pulse*factor;
      }
    }
  }

  stats(){
    return{
      total:this.bindings.length,
      active:this.bindings.filter(x=>x.active).length,
      level:this.context.qualityManager.level,
      plan:this.settings()
    };
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    for(const binding of this.bindings)this.reset(binding);
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

export function createAmbientActivity(viewport,options={}){
  return new AmbientActivityManager(viewport,options);
}
