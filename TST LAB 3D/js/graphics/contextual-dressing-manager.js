import {getSectorVisualProfile} from './sector-visual-profiles.js';
import {MaterialLibrary} from './material-library.js';

function mat(T,color,{roughness=.78,metalness=.08,emissive=0,emissiveIntensity=0}={}){
  return new T.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity});
}
function box(T,size,pos,material){const m=new T.Mesh(new T.BoxGeometry(...size),material);m.position.set(...pos);return m}
function cylinder(T,r,h,pos,material,segments=16){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),material);m.position.set(...pos);return m}

const LAYOUTS={
  studio:[[-2.7,.32,-2.3],[2.7,.38,-2.2],[-2.9,.5,2.2],[2.9,.42,2.1],[0,.28,-2.65],[0,.28,2.65],[3.15,.32,0]],
  outdoor:[[-8,.45,-6.2],[8,.42,-5.8],[-8,.48,5.8],[8,.42,5.4],[-4,.35,7],[5,.35,7],[0,.3,-7]],
  industrial:[[-8,.5,-5.6],[8,.5,-5.6],[-8,.45,5.4],[8,.45,5.2],[-4,.4,6.4],[4,.4,6.4],[0,.32,-6.5]],
  confined:[[-7,.48,-5.1],[7,.45,-4.8],[-6.5,.42,5],[6.5,.4,5],[-3,.3,6],[3,.3,6],[0,.3,-6]],
  port:[[-10,.5,-7],[10,.5,-6.6],[-10,.48,6.2],[10,.45,6.2],[-5,.4,7.5],[5,.4,7.5],[0,.35,-7.7]],
  corridor:[[-8,.55,-5.9],[8,.55,-5.9],[-7.5,.45,5.5],[7.5,.45,5.5],[-3.7,.35,6.2],[3.7,.35,6.2],[0,.3,-6.5]],
  office:[[-7,.48,-5.7],[7,.48,-5.7],[-7,.4,5.4],[7,.4,5.4],[-3.6,.35,6],[3.6,.35,6],[0,.28,-6.2]],
  warehouse:[[-9,.5,-6],[9,.5,-6],[-8.5,.45,5.8],[8.5,.45,5.8],[-4,.38,6.7],[4,.38,6.7],[0,.3,-6.8]],
  workshop:[[-8,.48,-5.7],[8,.48,-5.7],[-8,.42,5.5],[8,.42,5.5],[-4,.35,6.3],[4,.35,6.3],[0,.3,-6.5]],
  electrical:[[-8,.5,-5.6],[8,.5,-5.6],[-7.5,.42,5.4],[7.5,.42,5.4],[-3.8,.34,6],[3.8,.34,6],[0,.28,-6.2]]
};

export class ContextualDressingManager{
  constructor(viewport,profileId='industry'){
    this.viewport=viewport;
    this.T=viewport.runtime.THREE;
    this.profileId=profileId;
    this.profile=getSectorVisualProfile(profileId);
    this.scale=viewport.options.dressingScale??1;
    this.group=new this.T.Group();
    this.group.name=`TSTContextDressing:${profileId}`;
    this.group.userData.tstDecorative=true;
    viewport.scene.add(this.group);
    this.items=[];
    this.materials=[];
    this.materialLibrary=new MaterialLibrary(viewport);
    this.positions=(LAYOUTS[this.profile.layout]??LAYOUTS.industrial)
      .map(([x,y,z])=>[x*this.scale,y,z*this.scale]);
    this.buildBase();
    this.applyQuality();
  }

  material(color,opts={}){const m=mat(this.T,color,opts);this.materials.push(m);return m}

  buildBase(){
    const T=this.T,p=this.profile,s=this.scale;
    this.accent=this.material(p.accent,{roughness:.62,metalness:.12,emissive:p.accent,emissiveIntensity:.055});
    this.dark=this.material(0x1b252c,{roughness:.82,metalness:.08});
    this.secondary=this.material(p.secondary,{roughness:.72,metalness:.15});
    this.floorMaterial=this.materialLibrary.create(p.floorKind??'concrete',p.floor);
    this.signMaterial=this.material(0xd9e4e8,{roughness:.68,metalness:.02});

    this.floorAccent=new T.Mesh(new T.RingGeometry(4.9*s,5.05*s,64),this.accent);
    this.floorAccent.rotation.x=-Math.PI/2;
    this.floorAccent.position.y=.018;
    this.floorAccent.userData.tstDecorative=true;
    this.group.add(this.floorAccent);

    this.floorPatch=new T.Mesh(new T.PlaneGeometry(3.8*s,1.0*s),this.floorMaterial);
    this.floorPatch.rotation.x=-Math.PI/2;
    this.floorPatch.position.set(0,.012,5.9*s);
    this.floorPatch.userData.tstDecorative=true;
    this.group.add(this.floorPatch);
  }

  createItem(index){
    if(this.items[index])return this.items[index];
    const T=this.T,pos=this.positions[index];
    if(!pos)return null;
    const g=new T.Group();
    g.position.set(...pos);
    g.scale.setScalar(Math.max(.62,Math.min(1,this.scale)));
    g.userData.tstDecorative=true;
    const kind=index%4;
    if(kind===0){
      g.add(box(T,[1.45,.12,.62],[0,.06,0],this.dark));
      g.add(box(T,[1.15,.62,.5],[0,.43,0],this.secondary));
    }else if(kind===1){
      g.add(cylinder(T,.26,.72,[-.28,.36,0],this.accent,14));
      g.add(cylinder(T,.26,.72,[.28,.36,0],this.secondary,14));
    }else if(kind===2){
      g.add(box(T,[.12,1.2,.12],[-.58,.6,0],this.dark));
      g.add(box(T,[.12,1.2,.12],[.58,.6,0],this.dark));
      g.add(box(T,[1.35,.52,.08],[0,.92,0],this.signMaterial));
      g.add(box(T,[.95,.075,.095],[0,.92,.05],this.accent));
    }else{
      g.add(box(T,[1.15,.22,.72],[0,.11,0],this.secondary));
      g.add(box(T,[.95,.44,.62],[-.08,.42,0],this.dark));
      g.add(box(T,[.68,.1,.66],[.08,.72,0],this.accent));
    }
    g.traverse(node=>{if(node.isMesh){node.receiveShadow=true;node.castShadow=false;}});
    this.group.add(g);
    this.items[index]=g;
    return g;
  }

  ensureCount(count){
    const wanted=Math.min(count,this.positions.length);
    for(let index=0;index<wanted;index++)this.createItem(index);
  }

  applyQuality(){
    const q=this.viewport.context.qualityManager.level;
    const settings=this.viewport.context.qualityManager.settings;
    const count=settings.contextDressingCount??(q==='eco'?1:q==='medium'?3:q==='high'?5:7);
    this.ensureCount(count);
    const shadows=q==='high'||q==='ultra';
    this.items.forEach((item,index)=>{
      if(!item)return;
      item.visible=index<count;
      item.traverse?.(node=>{if(node.isMesh)node.castShadow=shadows&&index<Math.min(count,4);});
    });
    if(this.floorAccent)this.floorAccent.visible=q!=='eco';
    if(this.floorPatch)this.floorPatch.visible=q==='high'||q==='ultra';
  }

  stats(){
    const created=this.items.filter(Boolean).length;
    const visible=this.items.filter(item=>item?.visible).length;
    return{profile:this.profileId,created,visible};
  }

  dispose(){
    this.group?.removeFromParent?.();
    this.group?.traverse?.(node=>node.geometry?.dispose?.());
    for(const material of this.materials)material.dispose?.();
    this.materialLibrary?.dispose?.();
    this.materialLibrary=null;
    this.materials.length=0;
    this.items.length=0;
  }
}
