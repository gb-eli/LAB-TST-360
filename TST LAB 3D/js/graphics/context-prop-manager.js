import {getContextPropProfile} from './context-prop-registry.js';

const SLOT_LAYOUTS={
  studio:[[-2.15,.03,1.75],[2.15,.03,1.7],[0,.03,-2.05]],
  outdoor:[[-6.2,.03,4.8],[6.1,.03,4.6],[0,.03,-6.0]],
  industrial:[[-6.2,.03,4.45],[6.1,.03,4.35],[0,.03,-5.55]],
  confined:[[-5.2,.03,4.1],[5.1,.03,4.0],[0,.03,-5.05]],
  port:[[-7.7,.03,5.45],[7.6,.03,5.35],[0,.03,-6.8]],
  corridor:[[-5.9,.03,4.65],[5.8,.03,4.6],[0,.03,-5.55]],
  office:[[-5.5,.03,4.55],[5.4,.03,4.5],[0,.03,-5.25]],
  warehouse:[[-6.8,.03,4.8],[6.7,.03,4.7],[0,.03,-5.8]],
  workshop:[[-6.0,.03,4.6],[5.9,.03,4.55],[0,.03,-5.45]],
  electrical:[[-5.9,.03,4.55],[5.8,.03,4.45],[0,.03,-5.35]]
};

function lodBucket(level){
  return level==='high'||level==='ultra'?'high':'low';
}

export function contextPropPlanForQuality(level='medium',settings={}){
  const fallback=level==='eco'?0:level==='medium'?1:level==='high'?2:3;
  return{
    level,
    count:Math.max(0,Math.min(3,settings.contextPropCount??fallback)),
    lodBucket:lodBucket(level)
  };
}

export class ContextPropManager{
  constructor(viewport,profileId='industry'){
    this.viewport=viewport;
    this.context=viewport.context;
    this.T=viewport.runtime.THREE;
    this.profileId=profileId;
    this.profile=getContextPropProfile(profileId);
    this.scale=viewport.options.dressingScale??1;
    this.group=new this.T.Group();
    this.group.name=`TSTContextProps:${profileId}`;
    this.group.userData.tstDecorative=true;
    this.group.userData.tstContextProps=true;
    viewport.scene.add(this.group);
    this.entries=[];
    this.loading=new Map();
    this.disposed=false;
    this.lastRequestedCount=0;
    this.lastBucket=null;
    const layout=viewport.dressing?.profile?.layout??'industrial';
    this.slots=(SLOT_LAYOUTS[layout]??SLOT_LAYOUTS.industrial)
      .map(([x,y,z])=>[x*this.scale,y,z*this.scale]);
  }

  desiredCount(){
    const q=this.context.qualityManager.level;
    return contextPropPlanForQuality(q,this.context.qualityManager.settings).count;
  }

  async rawFromPack(id,quality){
    return this.context.assetManager.acquireFromPack(
      this.profile.pack,
      id,
      quality,
      {applyTransform:false}
    );
  }

  normalizeObject(object,targetSize=1){
    const T=this.T;
    const box=new T.Box3().setFromObject(object);
    const size=new T.Vector3();
    box.getSize(size);
    const maxDim=Math.max(size.x,size.y,size.z,.001);
    const factor=(targetSize*this.scale)/maxDim;
    object.scale.multiplyScalar(factor);

    const normalized=new T.Box3().setFromObject(object);
    const center=new T.Vector3();
    normalized.getCenter(center);
    object.position.x-=center.x;
    object.position.z-=center.z;
    object.position.y-=normalized.min.y;
  }

  decorateObject(root,index){
    root.userData.tstDecorative=true;
    root.userData.tstContextProp=true;
    root.userData.tstContextOnly=true;
    root.userData.tstIgnoreRisk=true;
    root.userData.tstContextProfile=this.profileId;
    root.traverse(node=>{
      node.userData.tstDecorative=true;
      node.userData.tstContextProp=true;
      node.userData.tstContextOnly=true;
      node.userData.tstIgnoreRisk=true;
      if(node.isMesh){
        node.receiveShadow=true;
        node.castShadow=false;
      }
    });
    const slot=this.slots[index]??[0,0,0];
    root.position.x+=slot[0];
    root.position.y+=slot[1];
    root.position.z+=slot[2];
    root.rotation.y=(index===0?-.32:index===1?.38:.12);
  }

  async loadEntry(index,quality){
    if(this.disposed||!this.profile?.props?.[index])return null;
    const spec=this.profile.props[index];
    const existing=this.entries[index];
    const bucket=lodBucket(quality);
    if(existing?.root&&existing.bucket===bucket)return existing;
    if(this.loading.has(index))return this.loading.get(index);

    const promise=(async()=>{
      try{
        const root=await this.rawFromPack(spec.id,quality);
        if(this.disposed){
          this.context.assetManager.release(root);
          return null;
        }
        this.normalizeObject(root,spec.targetSize??1);
        this.decorateObject(root,index);
        const current=this.entries[index];
        if(current?.root){
          this.context.assetManager.release(current.root);
        }
        const entry={root,spec,bucket,quality};
        root.visible=index<this.desiredCount();
        this.group.add(root);
        this.entries[index]=entry;
        return entry;
      }catch(error){
        console.warn(`[TST360 ContextProps] ${this.profileId}/${spec.id} indisponível`,error);
        return null;
      }finally{
        this.loading.delete(index);
      }
    })();
    this.loading.set(index,promise);
    return promise;
  }

  async ensureCount(count,quality){
    if(!this.profile||this.disposed)return;
    const wanted=Math.min(count,this.profile.props.length,this.slots.length);
    for(let index=0;index<wanted;index++){
      if(this.disposed)return;
      await this.loadEntry(index,quality);
    }
  }

  async applyQuality(){
    if(!this.profile||this.disposed)return;
    const level=this.context.qualityManager.level;
    const count=this.desiredCount();
    const bucket=lodBucket(level);
    this.lastRequestedCount=count;

    // Eco intentionally loads no contextual GLB.
    if(count>0){
      await this.ensureCount(count,level);
    }

    for(let index=0;index<this.entries.length;index++){
      const entry=this.entries[index];
      if(!entry?.root)continue;
      entry.root.visible=index<count;
      entry.root.traverse?.(node=>{
        if(node.isMesh)node.castShadow=(level==='high'||level==='ultra')&&index<2;
      });
    }

    // Reload only when crossing low↔high LOD families, avoiding churn on Medium/Eco
    // or High/Ultra transitions.
    if(count>0&&this.lastBucket!==null&&bucket!==this.lastBucket){
      for(let index=0;index<count;index++)await this.loadEntry(index,level);
    }
    this.lastBucket=bucket;
  }

  stats(){
    const created=this.entries.filter(entry=>entry?.root).length;
    const visible=this.entries.filter(entry=>entry?.root?.visible).length;
    const labels=this.entries
      .filter(entry=>entry?.root?.visible)
      .map(entry=>entry.spec.label);
    return{
      profile:this.profileId,
      created,
      visible,
      requested:this.lastRequestedCount,
      labels
    };
  }

  dispose(){
    this.disposed=true;
    for(const entry of this.entries){
      if(entry?.root)this.context.assetManager.release(entry.root);
    }
    this.entries.length=0;
    this.loading.clear();
    this.group?.removeFromParent?.();
    this.group=null;
  }
}
