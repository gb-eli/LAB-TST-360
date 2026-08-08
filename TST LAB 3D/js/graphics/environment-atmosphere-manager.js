import {getEnvironmentAtmosphereProfile} from './environment-atmosphere-profiles.js';

function hexRgb(hex){
  return{
    r:(hex>>16)&255,
    g:(hex>>8)&255,
    b:hex&255
  };
}

function css(hex,alpha=1){
  const c=hexRgb(hex);
  return`rgba(${c.r},${c.g},${c.b},${alpha})`;
}

export function atmospherePlanForQuality(level='medium',settings={}){
  const detail=settings.atmosphereDetail??(level==='eco'?0:level==='medium'?1:level==='high'?2:3);
  return{
    level,
    detail,
    shell:detail>=1,
    accentLights:detail>=3?2:detail>=2?1:0,
    animated:detail>=3,
    fogNearFactor:detail===0?1.08:detail===1?1:detail===2?.96:.92,
    fogFarFactor:detail===0?1.04:detail===1?1:detail===2?.96:.92
  };
}

export class EnvironmentAtmosphereManager{
  constructor(viewport,profileId='industry'){
    this.viewport=viewport;
    this.context=viewport.context;
    this.T=viewport.runtime.THREE;
    this.profileId=profileId;
    this.profile=getEnvironmentAtmosphereProfile(profileId);
    this.scale=Math.max(.68,viewport.options.dressingScale??1);
    this.shell=null;
    this.shellTexture=null;
    this.accentLights=[];
    this.baseFog=this.captureFog();
    this.lastPlan=atmospherePlanForQuality(
      this.context.qualityManager.level,
      this.context.qualityManager.settings
    );
  }

  captureFog(){
    const fog=this.viewport.scene?.fog;
    if(!fog)return null;
    return{
      near:Number(fog.near??12),
      far:Number(fog.far??34),
      color:fog.color?.getHex?.()??this.profile.fog
    };
  }

  createTexture(){
    const canvas=document.createElement('canvas');
    canvas.width=64;
    canvas.height=128;
    const ctx=canvas.getContext('2d');
    const gradient=ctx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(0,css(this.profile.top));
    gradient.addColorStop(.58,css(this.profile.horizon));
    gradient.addColorStop(1,css(this.profile.ground));
    ctx.fillStyle=gradient;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const glow=ctx.createRadialGradient(
      canvas.width*.5,canvas.height*.55,0,
      canvas.width*.5,canvas.height*.55,canvas.width*.7
    );
    glow.addColorStop(0,css(this.profile.accent,.12));
    glow.addColorStop(1,css(this.profile.accent,0));
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const texture=new this.T.CanvasTexture(canvas);
    texture.colorSpace=this.T.SRGBColorSpace;
    texture.minFilter=this.T.LinearFilter;
    texture.magFilter=this.T.LinearFilter;
    texture.generateMipmaps=false;
    return texture;
  }

  ensureShell(){
    if(this.shell)return;
    const T=this.T;
    this.shellTexture=this.createTexture();
    const geometry=new T.SphereGeometry(44*this.scale,24,14);
    const material=new T.MeshBasicMaterial({
      map:this.shellTexture,
      side:T.BackSide,
      depthWrite:false,
      fog:false
    });
    this.shell=new T.Mesh(geometry,material);
    this.shell.name=`TSTAtmosphereShell:${this.profileId}`;
    this.shell.renderOrder=-100;
    this.shell.userData.tstDecorative=true;
    this.shell.userData.tstAtmosphere=true;
    this.viewport.scene.add(this.shell);
  }

  ensureAccentLights(count){
    const T=this.T;
    while(this.accentLights.length<count){
      const index=this.accentLights.length;
      const color=index===0?this.profile.accent:this.profile.secondary;
      const light=new T.PointLight(color,0,28*this.scale,2);
      const x=index===0?8.5:-8.2;
      const z=index===0?-6.5:-5.8;
      light.position.set(x*this.scale,4.6*this.scale,z*this.scale);
      light.castShadow=false;
      light.name=`TSTAtmosphereAccent:${this.profileId}:${index}`;
      this.viewport.scene.add(light);
      this.accentLights.push(light);
    }
  }

  tintEnvironment(plan){
    const env=this.viewport.environment;
    if(env?.sun?.color)env.sun.color.setHex(this.profile.key);
    else if(this.viewport.sun?.color)this.viewport.sun.color.setHex(this.profile.key);

    if(env?.fill?.color)env.fill.color.setHex(this.profile.fill);
    if(env?.hemi?.color)env.hemi.color.setHex(this.profile.horizon);

    if(this.viewport.scene){
      this.viewport.scene.background=new this.T.Color(
        plan.shell?this.profile.top:this.profile.horizon
      );
    }

    if(this.viewport.scene?.fog){
      this.viewport.scene.fog.color.setHex(this.profile.fog);
      const base=this.baseFog??{
        near:this.viewport.scene.fog.near,
        far:this.viewport.scene.fog.far
      };
      this.viewport.scene.fog.near=base.near*plan.fogNearFactor;
      this.viewport.scene.fog.far=base.far*plan.fogFarFactor;
    }
  }

  applyQuality(){
    const plan=atmospherePlanForQuality(
      this.context.qualityManager.level,
      this.context.qualityManager.settings
    );
    this.lastPlan=plan;
    this.tintEnvironment(plan);

    if(plan.shell){
      this.ensureShell();
      this.shell.visible=true;
    }else if(this.shell){
      this.shell.visible=false;
    }

    this.ensureAccentLights(plan.accentLights);
    this.accentLights.forEach((light,index)=>{
      const active=index<plan.accentLights;
      light.visible=active;
      if(active){
        light.intensity=index===0
          ?(plan.detail===2?.34:.46)
          :(plan.detail===3?.30:0);
      }
    });
  }

  update(elapsed){
    if(!this.lastPlan.animated)return;
    this.accentLights.forEach((light,index)=>{
      if(!light.visible)return;
      const base=index===0?.46:.30;
      light.intensity=base*(.94+.06*Math.sin(elapsed*(.72+index*.11)+index));
    });
  }

  stats(){
    return{
      profile:this.profileId,
      detail:this.lastPlan.detail,
      shell:!!this.shell?.visible,
      accentLights:this.accentLights.filter(light=>light.visible).length,
      animated:this.lastPlan.animated,
      fog:this.viewport.scene?.fog?{
        near:Number(this.viewport.scene.fog.near.toFixed(2)),
        far:Number(this.viewport.scene.fog.far.toFixed(2))
      }:null
    };
  }

  dispose(){
    for(const light of this.accentLights)light.removeFromParent?.();
    this.accentLights.length=0;
    if(this.shell){
      this.shell.removeFromParent?.();
      this.shell.geometry?.dispose?.();
      this.shell.material?.dispose?.();
      this.shell=null;
    }
    this.shellTexture?.dispose?.();
    this.shellTexture=null;
  }
}
