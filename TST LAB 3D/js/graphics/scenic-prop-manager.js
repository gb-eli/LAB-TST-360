import {
  SCENIC_PROP_PACK,
  getScenicPropProfile
} from './scenic-prop-registry.js';

const SLOT_LAYOUTS={
  outdoor:[
    [[-7.7,.02,-5.6],[-6.8,.02,-5.0],[-5.9,.02,-5.5]],
    [[7.2,.02,-5.7],[6.3,.02,-5.05],[5.7,.02,-5.75]]
  ],
  industrial:[
    [[-7.1,.02,-5.25],[-6.25,.02,-4.65],[-5.55,.02,-5.3]],
    [[6.9,.02,-5.35],[6.0,.02,-4.65],[5.3,.02,-5.35]]
  ],
  port:[
    [[-8.6,.02,-6.7],[-7.35,.02,-6.05],[-6.1,.02,-6.65]],
    [[8.5,.02,-6.7],[7.2,.02,-6.0],[6.1,.02,-6.75]]
  ],
  corridor:[
    [[-6.45,.02,-5.35],[-5.65,.02,-4.8],[-4.95,.02,-5.4]],
    [[6.3,.02,-5.35],[5.5,.02,-4.8],[4.85,.02,-5.4]]
  ],
  office:[
    [[-6.0,.02,-5.1],[-5.25,.02,-4.55],[-4.6,.02,-5.15]],
    [[5.9,.02,-5.2],[5.15,.02,-4.55],[4.45,.02,-5.2]]
  ],
  warehouse:[
    [[-7.5,.02,-5.75],[-6.5,.02,-5.1],[-5.6,.02,-5.75]],
    [[7.4,.02,-5.8],[6.45,.02,-5.15],[5.55,.02,-5.8]]
  ],
  workshop:[
    [[-6.65,.02,-5.4],[-5.8,.02,-4.8],[-5.05,.02,-5.4]],
    [[6.55,.02,-5.45],[5.7,.02,-4.85],[4.95,.02,-5.45]]
  ],
  electrical:[
    [[-6.5,.02,-5.35],[-5.6,.02,-4.75],[-4.9,.02,-5.4]],
    [[6.4,.02,-5.35],[5.55,.02,-4.75],[4.85,.02,-5.4]]
  ]
};

function lodBucket(level){
  return level==='high'||level==='ultra'?'high':'low';
}

export function scenicPropPlanForQuality(level='medium',settings={}){
  const fallback=level==='ultra'?2:level==='high'?1:0;
  return{
    level,
    assetCount:Math.max(0,Math.min(2,settings.scenicPropCount??fallback)),
    repeatCount:level==='ultra'?3:level==='high'?2:1,
    lodBucket:lodBucket(level)
  };
}

export class ScenicPropManager{
  constructor(viewport,profileId='industry'){
    this.viewport=viewport;
    this.context=viewport.context;
    this.T=viewport.runtime.THREE;
    this.profileId=profileId;
    this.profile=getScenicPropProfile(profileId);
    this.scale=viewport.options.dressingScale??1;
    this.group=new this.T.Group();
    this.group.name=`TSTScenicProps:${profileId}`;
    this.group.userData.tstDecorative=true;
    this.group.userData.tstScenicProps=true;
    viewport.scene.add(this.group);
    this.entries=[];
    this.loading=new Map();
    this.disposed=false;
    this.lastBucket=null;
    this.lastPlan=scenicPropPlanForQuality(
      this.context.qualityManager.level,
      this.context.qualityManager.settings
    );
    const layout=viewport.dressing?.profile?.layout??'industrial';
    this.slots=SLOT_LAYOUTS[layout]??SLOT_LAYOUTS.industrial;
  }

  plan(){
    return scenicPropPlanForQuality(
      this.context.qualityManager.level,
      this.context.qualityManager.settings
    );
  }

  async raw(id,quality){
    return this.context.assetManager.acquireFromPack(
      SCENIC_PROP_PACK,
      id,
      quality,
      {applyTransform:false}
    );
  }

  normalize(root,targetSize=1){
    const T=this.T;
    const box=new T.Box3().setFromObject(root);
    const size=new T.Vector3();
    box.getSize(size);
    const maxDim=Math.max(size.x,size.y,size.z,.001);
    root.scale.multiplyScalar((targetSize*this.scale)/maxDim);
    const normalized=new T.Box3().setFromObject(root);
    const center=new T.Vector3();
    normalized.getCenter(center);
    root.position.x-=center.x;
    root.position.z-=center.z;
    root.position.y-=normalized.min.y;
    root.updateMatrixWorld(true);
  }

  mark(root){
    root.userData.tstDecorative=true;
    root.userData.tstScenicProp=true;
    root.userData.tstContextOnly=true;
    root.userData.tstIgnoreRisk=true;
    root.traverse(node=>{
      node.userData.tstDecorative=true;
      node.userData.tstScenicProp=true;
      node.userData.tstContextOnly=true;
      node.userData.tstIgnoreRisk=true;
      if(node.isMesh){
        node.receiveShadow=true;
        node.castShadow=false;
      }
    });
  }

  firstMesh(root){
    let found=null;
    root.traverse(node=>{
      if(!found&&node.isMesh)found=node;
    });
    return found;
  }

  buildInstanced(sourceRoot,index,repeatCount){
    const T=this.T;
    const mesh=this.firstMesh(sourceRoot);
    if(!mesh||Array.isArray(mesh.material))return null;

    sourceRoot.updateMatrixWorld(true);
    const instanced=new T.InstancedMesh(mesh.geometry,mesh.material,repeatCount);
    instanced.name=`TSTScenicInstance:${this.profileId}:${index}`;
    instanced.castShadow=false;
    instanced.receiveShadow=true;
    instanced.userData.tstDecorative=true;
    instanced.userData.tstScenicProp=true;
    instanced.userData.tstContextOnly=true;
    instanced.userData.tstIgnoreRisk=true;

    const slots=this.slots[index]??[];
    const base=mesh.matrixWorld.clone();
    for(let i=0;i<repeatCount;i++){
      const [x,y,z]=slots[i]??slots[0]??[0,0,0];
      const outer=new T.Matrix4();
      const position=new T.Vector3(x*this.scale,y,z*this.scale);
      const rotation=new T.Quaternion().setFromEuler(
        new T.Euler(0,(index===0?-.2:.28)+(i-.5)*.12,0)
      );
      outer.compose(position,rotation,new T.Vector3(1,1,1));
      const matrix=outer.multiply(base.clone());
      instanced.setMatrixAt(i,matrix);
    }
    instanced.instanceMatrix.needsUpdate=true;
    return instanced;
  }

  positionRoot(root,index){
    const slot=(this.slots[index]??[])[0]??[0,0,0];
    root.position.x+=slot[0]*this.scale;
    root.position.y+=slot[1];
    root.position.z+=slot[2]*this.scale;
    root.rotation.y=index===0?-.22:.30;
  }

  disposeEntry(entry){
    if(!entry)return;
    entry.renderRoot?.removeFromParent?.();
    if(entry.renderRoot?.isInstancedMesh){
      // geometry/material remain owned by the retained AssetManager source.
      entry.renderRoot.dispose?.();
    }
    if(entry.sourceRoot){
      this.context.assetManager.release(entry.sourceRoot);
    }
  }

  async loadEntry(index,quality,plan){
    const spec=this.profile?.[index];
    if(!spec||this.disposed)return null;
    const bucket=lodBucket(quality);
    const repeatCount=spec.repeatable?plan.repeatCount:1;
    const current=this.entries[index];
    if(
      current?.sourceRoot &&
      current.bucket===bucket &&
      current.repeatCount===repeatCount
    )return current;
    if(this.loading.has(index))return this.loading.get(index);

    const promise=(async()=>{
      try{
        const manifest=await this.context.assetManager.manifest(SCENIC_PROP_PACK);
        const definition=manifest.assets?.[spec.id];
        const targetSize=definition?.targetSize??1;
        const sourceRoot=await this.raw(spec.id,quality);
        if(this.disposed){
          this.context.assetManager.release(sourceRoot);
          return null;
        }
        this.mark(sourceRoot);
        this.normalize(sourceRoot,targetSize);

        let renderRoot=null;
        if(spec.repeatable&&repeatCount>1){
          renderRoot=this.buildInstanced(sourceRoot,index,repeatCount);
        }
        if(!renderRoot){
          renderRoot=sourceRoot;
          this.positionRoot(renderRoot,index);
        }

        const previous=this.entries[index];
        if(previous)this.disposeEntry(previous);

        const entry={
          sourceRoot,
          renderRoot,
          spec,
          bucket,
          repeatCount,
          instanced:renderRoot?.isInstancedMesh===true
        };
        if(renderRoot!==sourceRoot)this.group.add(renderRoot);
        else this.group.add(sourceRoot);
        renderRoot.visible=index<plan.assetCount;
        this.entries[index]=entry;
        return entry;
      }catch(error){
        console.warn(`[TST360 ScenicProps] ${this.profileId}/${spec.id} indisponível`,error);
        return null;
      }finally{
        this.loading.delete(index);
      }
    })();
    this.loading.set(index,promise);
    return promise;
  }

  async applyQuality(){
    if(!this.profile||this.disposed)return;
    const level=this.context.qualityManager.level;
    const plan=this.plan();
    this.lastPlan=plan;

    for(let index=0;index<plan.assetCount;index++){
      await this.loadEntry(index,level,plan);
    }

    for(let index=0;index<this.entries.length;index++){
      const entry=this.entries[index];
      if(!entry?.renderRoot)continue;
      entry.renderRoot.visible=index<plan.assetCount;
      if(!entry.instanced){
        entry.renderRoot.traverse?.(node=>{
          if(node.isMesh)node.castShadow=(level==='ultra');
        });
      }
    }
    this.lastBucket=plan.lodBucket;
  }

  stats(){
    const visibleEntries=this.entries.filter(entry=>entry?.renderRoot?.visible);
    return{
      profile:this.profileId,
      assetTypes:visibleEntries.length,
      renderedInstances:visibleEntries.reduce((sum,entry)=>sum+entry.repeatCount,0),
      created:this.entries.filter(entry=>entry?.renderRoot).length,
      instanced:visibleEntries.filter(entry=>entry.instanced).length,
      labels:visibleEntries.map(entry=>entry.spec.label),
      plan:this.lastPlan
    };
  }

  dispose(){
    this.disposed=true;
    for(const entry of this.entries)this.disposeEntry(entry);
    this.entries.length=0;
    this.loading.clear();
    this.group?.removeFromParent?.();
    this.group=null;
  }
}
