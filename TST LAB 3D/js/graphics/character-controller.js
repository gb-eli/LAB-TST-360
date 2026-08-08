import {createCharacterRig} from './character-rig.js';
import {createCharacterMotion} from './character-motion.js';
import {applyCharacterAppearance,DEFAULT_CHARACTER_APPEARANCE} from './character-appearance.js';

const DEFAULT_CLIP_ALIASES={
  idle:['idle','stand','standing','breathing'],
  walk:['walk','walking','locomotion'],
  inspect:['inspect','inspection','look','observe','idle'],
  reach:['reach','reaching','grab','pickup','pick_up'],
  crouch:['crouch','crouching','squat'],
  seated:['sit','sitting','seated'],
  climb:['climb','climbing','ladder']
};

function normalize(value=''){
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g,'_');
}

export function resolveCharacterClip(animations,state,aliases=DEFAULT_CLIP_ALIASES){
  if(!animations?.length)return null;
  const raw=aliases[state]??[state];
  const names=(Array.isArray(raw)?raw:[raw]).map(normalize);
  let clip=animations.find(item=>names.includes(normalize(item.name)));
  if(clip)return clip;
  clip=animations.find(item=>names.some(name=>normalize(item.name).includes(name)));
  if(clip)return clip;
  if(state!=='idle')return resolveCharacterClip(animations,'idle',aliases);
  return animations[0]??null;
}

export class CharacterController{
  constructor(viewport,options={}){
    this.viewport=viewport;
    this.context=viewport.context;
    this.T=viewport.runtime.THREE;
    this.options=options;
    this.kind='uninitialized';
    this.root=null;
    this.rig=null;
    this.motion=null;
    this.mixer=null;
    this.actions=new Map();
    this.animations=[];
    this.animatedAsset=null;
    this.state=options.initial??options.pose??'idle';
    this.speed=options.speed??1;
    this.paused=false;
    this.disposed=false;
    this.fallbackReason=null;
    this.appearance=null;
    this.appearanceId=options.appearance??DEFAULT_CHARACTER_APPEARANCE;
    this.clipAliases={...DEFAULT_CLIP_ALIASES,...(options.clipAliases??{})};
  }

  async init(){
    const candidates=characterAssetCandidates(this.options.asset);
    const assetRequested=candidates.length>0;
    const allowSkinned=this.context.qualityManager.settings.skinnedCharacters!==false;

    if(assetRequested&&allowSkinned){
      const failures=[];
      for(let index=0;index<candidates.length;index++){
        const candidate=candidates[index];
        try{
          await this.initAnimated(candidate);
          this.activeAsset=candidate;
          this.fallbackReason=index>0?'asset-pack-fallback':null;
          if(index>0){
            this.context.events?.emit?.('character:fallback',{
              reason:this.fallbackReason,
              requested:candidates[0],
              selected:candidate,
              failures
            });
          }
          this.emitSource('gltf');
          return this;
        }catch(error){
          failures.push({
            asset:candidate,
            message:String(error?.message??error)
          });
          console.warn('[TST360 CharacterController] Character pack indisponível.',candidate,error);
        }
      }
      this.fallbackReason='asset-chain-exhausted';
      this.context.events?.emit?.('character:fallback',{
        reason:this.fallbackReason,
        requested:candidates[0],
        failures
      });
    }else if(assetRequested&&!allowSkinned){
      this.fallbackReason='quality-profile';
      this.context.events?.emit?.('character:fallback',{
        reason:this.fallbackReason,
        asset:candidates[0],
        quality:this.context.qualityManager.level
      });
    }

    this.initProcedural();
    this.activeAsset=null;
    this.emitSource('procedural');
    return this;
  }

  emitSource(kind){
    this.context.events?.emit?.('character:source',{
      kind,
      state:this.state,
      quality:this.context.qualityManager.level,
      asset:this.activeAsset??this.options.asset??null,
      fallbackReason:this.fallbackReason,
      animations:this.animatedAsset?.animationNames??[]
    });
  }

  applyTransform(root,{preserveBase=false}={}){
    const o=this.options;
    if(preserveBase){
      root.position.x+=o.x??0;root.position.y+=o.y??0;root.position.z+=o.z??0;
      root.rotation.y+=o.rotationY??0;
      const scale=o.scale??1;
      if(Array.isArray(scale))root.scale.multiply(new this.T.Vector3(...scale));
      else root.scale.multiplyScalar(scale);
      return;
    }
    root.position.set(o.x??0,o.y??0,o.z??0);
    root.rotation.y=o.rotationY??0;
    const scale=o.scale??1;
    if(Array.isArray(scale))root.scale.set(...scale);
    else root.scale.setScalar(scale);
  }

  initProcedural(){
    this.kind='procedural';
    this.rig=createCharacterRig(this.T,{
      ...this.options,
      pose:this.state
    });
    this.root=this.rig.root;
    this.applyTransform(this.root);
    this.motion=createCharacterMotion(this.rig,{initial:this.state,speed:this.speed,map:this.options.map});
    this.root.userData.characterController=this;
    this.root.userData.characterSource='procedural';
    this.viewport.scene.add(this.root);
  }

  async initAnimated(asset=this.options.asset){
    const result=await this.context.assetManager.acquireAnimatedFromPack(
      asset.pack,asset.id,this.context.qualityManager.level
    );
    this.animatedAsset=result;
    this.root=result.root;
    this.animations=result.animations??[];
    this.clipAliases={...this.clipAliases,...(result.definition?.clipAliases??{})};
    this.kind='gltf';
    this.applyTransform(this.root,{preserveBase:true});
    this.root.userData.characterController=this;
    this.root.userData.characterSource='gltf';
    this.root.userData.characterAnimationNames=result.animationNames??[];
    this.appearance=applyCharacterAppearance(this.root,this.appearanceId);
    this.appearanceId=this.appearance.appearanceId;
    this.viewport.scene.add(this.root);
    this.createGltfContactShadow();

    if(this.animations.length){
      this.mixer=new this.T.AnimationMixer(this.root);
      this.play(this.state,true);
    }else{
      console.warn('[TST360 CharacterController] Asset GLB carregado sem AnimationClips.',asset);
    }

    this.root.userData.tstApplyGraphicsQuality=level=>this.applyGraphicsQuality(level);
    this.applyGraphicsQuality(this.context.qualityManager.level);
  }

  createGltfContactShadow(){
    const T=this.T;
    this.contactShadow=new T.Mesh(
      new T.CircleGeometry(.72,24),
      new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.14,depthWrite:false,toneMapped:false})
    );
    this.contactShadow.rotation.x=-Math.PI/2;
    this.contactShadow.position.set(this.root.position.x,(this.options.y??0)+.018,this.root.position.z);
    this.contactShadow.scale.set(1.05,.68,1);
    this.contactShadow.renderOrder=-1;
    this.viewport.scene.add(this.contactShadow);
  }

  actionFor(state){
    if(!this.mixer)return null;
    if(this.actions.has(state))return this.actions.get(state);
    const clip=resolveCharacterClip(this.animations,state,this.clipAliases);
    if(!clip)return null;
    const action=this.mixer.clipAction(clip);
    this.actions.set(state,action);
    return action;
  }

  play(state='idle',immediate=false){
    this.state=state;
    if(this.kind==='procedural'){
      const staticProfile=this.context.qualityManager.settings.animations===false;
      this.motion?.setState(state,immediate||staticProfile);
      return state;
    }
    const action=this.actionFor(state);
    if(!action)return state;
    const fade=immediate?0:.22;
    for(const [name,other] of this.actions){
      if(other!==action&&other.isRunning())other.fadeOut(fade);
    }
    action.reset().setEffectiveTimeScale(this.speed).setEffectiveWeight(1);
    if(fade)action.fadeIn(fade);
    action.play();
    return state;
  }

  setState(state='idle',immediate=false){
    return this.play(state,immediate);
  }

  setSpeed(speed=1){
    this.speed=Math.max(.05,Number(speed)||1);
    this.motion?.setSpeed(this.speed);
    for(const action of this.actions.values())action.setEffectiveTimeScale(this.speed);
  }

  setHelmet(visible){
    this.rig?.setHelmet?.(visible);
  }

  setVest(visible){
    this.rig?.setVest?.(visible);
  }

  applyGraphicsQuality(level){
    if(this.kind==='procedural'){
      this.rig?.setGraphicsQuality?.(level);
      return;
    }
    const animations=this.context.qualityManager.settings.animations;
    if(this.mixer)this.mixer.timeScale=animations?1:0;
    if(this.contactShadow){
      this.contactShadow.visible=level!=='eco';
      this.contactShadow.material.opacity=level==='ultra'?.18:level==='high'?.15:.1;
    }
    this.root?.traverse?.(object=>{
      if(!object.isMesh)return;
      object.castShadow=level!=='eco';
      object.receiveShadow=level==='high'||level==='ultra';
    });
  }

  pause(){
    this.paused=true;
    this.motion?.pause?.();
    if(this.mixer)this.mixer.timeScale=0;
  }

  resume(){
    this.paused=false;
    this.motion?.resume?.();
    if(this.mixer)this.mixer.timeScale=this.context.qualityManager.settings.animations?1:0;
  }

  update(delta,elapsed){
    if(this.paused||this.disposed)return;
    if(this.contactShadow&&this.root){
      this.contactShadow.position.x=this.root.position.x;
      this.contactShadow.position.z=this.root.position.z;
    }
    if(this.kind==='procedural'){
      if(this.context.qualityManager.settings.animations===false)return;
      this.motion?.update(delta,elapsed);
      return;
    }
    if(this.mixer&&this.context.qualityManager.settings.animations){
      this.mixer.update(delta*this.speed);
    }
  }

  info(){
    return{
      kind:this.kind,
      state:this.state,
      speed:this.speed,
      requestedAsset:this.options.asset??null,
      asset:this.activeAsset??null,
      packId:this.activeAsset?.packId??null,
      rig:this.activeAsset?.rig??null,
      jointCount:this.activeAsset?.jointCount??null,
      geometryStyle:this.activeAsset?.geometryStyle??null,
      appearanceId:this.kind==='gltf'?this.appearanceId:null,
      animationNames:this.animatedAsset?.animationNames??[],
      fallback:this.kind==='procedural'||this.fallbackReason!==null,
      fallbackReason:this.fallbackReason
    };
  }

  dispose(){
    if(this.disposed)return;
    this.disposed=true;
    this.motion?.dispose?.();
    this.motion=null;
    if(this.mixer){
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.root);
      this.mixer=null;
    }
    this.actions.clear();
    if(this.contactShadow){
      this.contactShadow.removeFromParent?.();
      this.contactShadow.geometry?.dispose?.();
      this.contactShadow.material?.dispose?.();
      this.contactShadow=null;
    }
    this.appearance?.dispose?.();
    this.appearance=null;
    if(this.kind==='gltf'){
      this.context.assetManager.release(this.root);
    }else{
      this.rig?.dispose?.();
    }
    this.rig=null;
    this.root=null;
    this.animatedAsset=null;
  }
}

export async function createCharacterController(viewport,options={}){
  const controller=new CharacterController(viewport,options);
  await controller.init();
  return controller;
}


export function characterAssetCandidates(asset){
  if(!asset?.pack||!asset?.id)return[];
  const result=[];
  const seen=new Set();
  const push=item=>{
    if(!item?.pack||!item?.id)return;
    const key=`${item.pack}::${item.id}`;
    if(seen.has(key))return;
    seen.add(key);
    result.push(item);
  };
  push(asset);
  for(const item of asset.fallbacks??[])push(item);
  return result;
}

export const CHARACTER_CLIP_ALIASES=Object.freeze(DEFAULT_CLIP_ALIASES);
