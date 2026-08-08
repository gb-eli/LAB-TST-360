export class EffectsManager{
  constructor(viewport){
    this.viewport=viewport;
    this.THREE=viewport.runtime.THREE;
    this.effects=[];
  }

  particleFactor(){
    return this.viewport.context.qualityManager.settings.particles??1;
  }

  particleBudget(base=60){
    return Math.max(0,Math.round(base*this.particleFactor()));
  }

  maxParticleBudget(base=60){
    return Math.max(1,Math.round(base*1.25));
  }

  smoke({position=[0,1,0],spread=[1.5,1.2,1.5],count=70,color=0xaeb8bd,size=.35,opacity=.18,rise=.28}={}){
    const T=this.THREE,n=this.maxParticleBudget(count);
    const geo=new T.BufferGeometry(),pos=new Float32Array(n*3),seed=new Float32Array(n*4);
    for(let i=0;i<n;i++){
      const j=i*3,s=i*4;
      pos[j]=(Math.random()-.5)*spread[0];pos[j+1]=Math.random()*spread[1];pos[j+2]=(Math.random()-.5)*spread[2];
      seed[s]=Math.random()*Math.PI*2;seed[s+1]=.4+Math.random()*.8;seed[s+2]=Math.random();seed[s+3]=Math.random();
    }
    geo.setAttribute('position',new T.BufferAttribute(pos,3));
    const mat=new T.PointsMaterial({color,size,transparent:true,opacity,depthWrite:false,sizeAttenuation:true,blending:T.NormalBlending});
    const pts=new T.Points(geo,mat);pts.position.set(...position);this.viewport.scene.add(pts);

    const animator=({delta,elapsed})=>{
      const desired=Math.min(n,this.particleBudget(count));
      geo.setDrawRange(0,desired);
      pts.visible=desired>0;
      mat.opacity=opacity*(this.viewport.context.qualityManager.level==='eco'?.62:1);
      const a=geo.attributes.position.array;
      for(let i=0;i<desired;i++){
        const j=i*3,s=i*4;
        a[j]+=Math.sin(elapsed*.7+seed[s])*delta*.08;
        a[j+1]+=rise*delta*seed[s+1];
        a[j+2]+=Math.cos(elapsed*.55+seed[s])*delta*.06;
        if(a[j+1]>spread[1]*1.25){
          a[j+1]=0;a[j]=(seed[s+2]-.5)*spread[0];a[j+2]=(seed[s+3]-.5)*spread[2];
        }
      }
      geo.attributes.position.needsUpdate=true;
    };
    this.viewport.addAnimator(animator);
    const effect={object:pts,dispose:()=>{pts.removeFromParent();geo.dispose();mat.dispose()}};
    this.effects.push(effect);return effect;
  }

  sparks({position=[0,1,0],count=26,color=0x9de8ff,radius=.7}={}){
    const T=this.THREE,n=this.maxParticleBudget(count);
    const geo=new T.BufferGeometry(),arr=new Float32Array(n*3),vel=[];
    for(let i=0;i<n;i++){
      const j=i*3;arr[j]=arr[j+1]=arr[j+2]=0;
      vel.push(new T.Vector3((Math.random()-.5)*1.5,Math.random()*1.5,(Math.random()-.5)*1.5));
    }
    geo.setAttribute('position',new T.BufferAttribute(arr,3));
    const mat=new T.PointsMaterial({color,size:.055,transparent:true,opacity:.8,depthWrite:false});
    const pts=new T.Points(geo,mat);pts.position.set(...position);this.viewport.scene.add(pts);

    const animator=({delta,elapsed})=>{
      const desired=Math.min(n,this.particleBudget(count));
      geo.setDrawRange(0,desired);pts.visible=desired>0;
      const a=geo.attributes.position.array;
      for(let i=0;i<desired;i++){
        const j=i*3;
        a[j]+=vel[i].x*delta;a[j+1]+=vel[i].y*delta;a[j+2]+=vel[i].z*delta;
        vel[i].y-=1.8*delta;
        if(a[j+1]<-.2||Math.hypot(a[j],a[j+1],a[j+2])>radius){
          a[j]=a[j+1]=a[j+2]=0;
          vel[i].set((Math.random()-.5)*1.4,.6+Math.random()*1.2,(Math.random()-.5)*1.4);
        }
      }
      geo.attributes.position.needsUpdate=true;
      mat.opacity=(this.viewport.context.qualityManager.level==='eco'?.42:.62)+Math.sin(elapsed*13)*.16;
    };
    this.viewport.addAnimator(animator);
    const effect={object:pts,dispose:()=>{pts.removeFromParent();geo.dispose();mat.dispose()}};
    this.effects.push(effect);return effect;
  }

  beacon({position=[0,2,0],color=0xff4f43,intensity=1.2,distance=7}={}){
    const T=this.THREE,light=new T.PointLight(color,intensity,distance,2);
    light.position.set(...position);this.viewport.scene.add(light);
    const lens=new T.Mesh(
      new T.SphereGeometry(.11,12,8),
      new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.8,roughness:.3})
    );
    lens.position.set(...position);this.viewport.scene.add(lens);
    this.viewport.addAnimator(({elapsed})=>{
      const level=this.viewport.context.qualityManager.level;
      const factor=level==='eco'?.35:level==='medium'?.7:1;
      const pulse=.35+.65*(.5+.5*Math.sin(elapsed*7));
      light.intensity=intensity*pulse*factor;
      lens.material.emissiveIntensity=.25+pulse*(level==='eco'?.45:1);
    });
    const effect={dispose:()=>{light.removeFromParent();lens.removeFromParent();lens.geometry.dispose();lens.material.dispose()}};
    this.effects.push(effect);return effect;
  }

  routePulse(points,{color=0x58d68d,speed=.18,count=8}={}){
    const T=this.THREE;
    if(!Array.isArray(points)||points.length<2)return null;
    const group=new T.Group();this.viewport.scene.add(group);
    const max=Math.max(3,Math.round(count*1.25)),balls=[];
    for(let i=0;i<max;i++){
      const m=new T.Mesh(
        new T.SphereGeometry(.07,10,7),
        new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.7,roughness:.4})
      );
      group.add(m);balls.push(m);
    }
    const sample=t=>{
      const seg=(points.length-1)*t,i=Math.min(points.length-2,Math.floor(seg)),u=seg-i,a=points[i],b=points[i+1];
      return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
    };
    this.viewport.addAnimator(({elapsed})=>{
      const factor=this.viewport.context.qualityManager.level==='eco'?.45:this.viewport.context.qualityManager.level==='medium'?.72:this.viewport.context.qualityManager.level==='ultra'?1.2:1;
      const desired=Math.max(2,Math.min(max,Math.round(count*factor)));
      balls.forEach((ball,i)=>{
        ball.visible=i<desired;
        if(ball.visible)ball.position.set(...sample((elapsed*speed+i/desired)%1));
      });
    });
    const effect={dispose:()=>{group.traverse(o=>{o.geometry?.dispose?.();o.material?.dispose?.()});group.removeFromParent()}};
    this.effects.push(effect);return effect;
  }

  dispose(){
    for(const effect of this.effects.splice(0)){
      try{effect.dispose?.()}catch{}
    }
  }
}
