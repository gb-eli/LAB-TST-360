const POSES={
  idle:{rootY:0,joints:{leftShoulder:[.05,0,.08],rightShoulder:[.05,0,-.08],leftElbow:[-.08,0,0],rightElbow:[-.08,0,0],leftHip:[0,0,.02],rightHip:[0,0,-.02],leftKnee:[.02,0,0],rightKnee:[.02,0,0],torso:[0,0,0],neck:[0,0,0]}},
  inspect:{rootY:0,joints:{leftShoulder:[-.48,0,.18],rightShoulder:[-.88,0,-.22],leftElbow:[-.35,0,0],rightElbow:[-.5,0,0],leftHip:[.02,0,.02],rightHip:[-.02,0,-.02],leftKnee:[.03,0,0],rightKnee:[.03,0,0],torso:[-.08,0,0],neck:[-.2,.12,0]}},
  reach:{rootY:0,joints:{leftShoulder:[-1.12,0,.12],rightShoulder:[-1.2,0,-.12],leftElbow:[-.18,0,0],rightElbow:[-.18,0,0],leftHip:[0,0,.04],rightHip:[0,0,-.04],leftKnee:[.04,0,0],rightKnee:[.04,0,0],torso:[-.07,0,0],neck:[-.08,0,0]}},
  climb:{rootY:.08,joints:{leftShoulder:[-1.42,0,.16],rightShoulder:[-.78,0,-.14],leftElbow:[-.32,0,0],rightElbow:[-.65,0,0],leftHip:[-.7,0,.08],rightHip:[.28,0,-.06],leftKnee:[1.02,0,0],rightKnee:[.3,0,0],torso:[-.12,0,0],neck:[-.08,0,0]}},
  crouch:{rootY:-.32,joints:{leftShoulder:[-.45,0,.1],rightShoulder:[-.55,0,-.1],leftElbow:[-.35,0,0],rightElbow:[-.35,0,0],leftHip:[-.6,0,.03],rightHip:[-.6,0,-.03],leftKnee:[1.12,0,0],rightKnee:[1.12,0,0],torso:[-.28,0,0],neck:[.15,0,0]}},
  seated:{rootY:-.04,joints:{leftShoulder:[-.48,0,.12],rightShoulder:[-.48,0,-.12],leftElbow:[-.7,0,0],rightElbow:[-.7,0,0],leftHip:[-1.34,0,.03],rightHip:[-1.34,0,-.03],leftKnee:[1.37,0,0],rightKnee:[1.37,0,0],torso:[-.04,0,0],neck:[0,0,0]}}
};

function material(THREE,color,extra={}){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.04,...extra})}
function box(THREE,size,mat,pos=[0,0,0]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function capsule(THREE,radius,length,mat,segments=8){const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,segments,12),mat);mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function pivotLimb(THREE,parent,name,position,length,radius,mat){const pivot=new THREE.Group();pivot.name=name;pivot.position.set(...position);const limb=capsule(THREE,radius,Math.max(.05,length-radius*2),mat);limb.position.y=-length/2;limb.scale.y=.98;pivot.add(limb);parent.add(pivot);return pivot}

export class CharacterRig{
  constructor(THREE,options={}){
    this.THREE=THREE;this.options=options;this.root=new THREE.Group();this.root.name='TSTCharacterRig';this.joints={};this.targetPose='idle';this.poseBlend=options.poseBlend??8;this.height=options.height??2.72;this.uniform=options.uniform??'tst';this._rootBaseY=options.y??0;this._customNeckX=0;this.graphicsQuality='medium';this._build();this.root.userData.tstApplyGraphicsQuality=level=>this.setGraphicsQuality(level);this.root.position.set(options.x??0,this._rootBaseY,options.z??0);this.root.rotation.y=options.rotationY??0;this.setPose(options.pose??'idle',true)
  }

  _build(){
    const T=this.THREE;
    const skin=material(T,this.options.skin??0xb87855,{roughness:.8});
    const shirt=material(T,this.options.shirt??0xe8792d,{roughness:.86});
    const pants=material(T,this.options.pants??0x203b55,{roughness:.9});
    const boot=material(T,0x22262b,{roughness:.93});
    const vest=material(T,0xd9c632,{roughness:.78});
    const reflective=material(T,0xdce7e7,{roughness:.36,metalness:.1,emissive:0x3b4444,emissiveIntensity:.08});
    const hair=material(T,this.options.hair??0x261b17,{roughness:.95});
    const dark=material(T,0x151b20,{roughness:.82});
    const eye=material(T,0x111418,{roughness:.5});

    this.contactShadow=new T.Mesh(
      new T.CircleGeometry(.72,24),
      new T.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.12,depthWrite:false,toneMapped:false})
    );
    this.contactShadow.rotation.x=-Math.PI/2;
    this.contactShadow.scale.set(1.15,.72,1);
    this.contactShadow.position.y=.018;
    this.contactShadow.renderOrder=-1;
    this.root.add(this.contactShadow);

    const pelvis=this.joints.pelvis=new T.Group();pelvis.name='pelvis';pelvis.position.y=1.04;this.root.add(pelvis);
    pelvis.add(box(T,[.58,.34,.34],pants,[0,.12,0]));

    const torso=this.joints.torso=new T.Group();torso.name='torso';torso.position.y=.33;pelvis.add(torso);
    const chest=box(T,[.82,1.03,.43],shirt,[0,.46,0]);chest.geometry.translate(0,0,0);torso.add(chest);

    const vestGroup=this.vest=new T.Group();vestGroup.name='highVisibilityVest';
    vestGroup.add(box(T,[.86,.86,.455],vest,[0,.5,0]));
    vestGroup.add(box(T,[.9,.09,.47],reflective,[0,.66,0]));
    vestGroup.add(box(T,[.9,.09,.47],reflective,[0,.38,0]));
    vestGroup.visible=this.options.vest!==false;torso.add(vestGroup);

    const neck=this.joints.neck=new T.Group();neck.name='neck';neck.position.set(0,1.05,0);torso.add(neck);
    neck.add(capsule(T,.11,.16,skin));neck.children[0].position.y=.05;
    const head=new T.Mesh(new T.SphereGeometry(.29,24,18),skin);head.position.y=.42;head.scale.set(.9,1.12,.92);head.castShadow=true;neck.add(head);
    const hairCap=new T.Mesh(new T.SphereGeometry(.292,22,12,0,Math.PI*2,0,Math.PI*.48),hair);hairCap.position.y=.48;hairCap.scale.set(.91,.55,.93);neck.add(hairCap);
    for(const sx of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.045,10,8),skin);e.position.set(sx*.27,.42,0);neck.add(e)}
    const nose=new T.Mesh(new T.ConeGeometry(.055,.12,10),skin);nose.rotation.x=Math.PI/2;nose.position.set(0,.41,.285);neck.add(nose);
    for(const sx of[-1,1]){const e=new T.Mesh(new T.SphereGeometry(.022,10,8),eye);e.position.set(sx*.095,.48,.267);neck.add(e)}

    const upperArm=.66,lowerArm=.62,upperLeg=.82,lowerLeg=.78;
    for(const side of['left','right']){
      const s=side==='left'?-1:1;
      const shoulder=this.joints[side+'Shoulder']=pivotLimb(T,torso,side+'Shoulder',[s*.53,.88,0],upperArm,.115,shirt);
      const elbow=this.joints[side+'Elbow']=pivotLimb(T,shoulder,side+'Elbow',[0,-upperArm,0],lowerArm,.10,skin);
      const hand=new T.Mesh(new T.SphereGeometry(.12,14,10),skin);hand.position.y=-lowerArm-.08;hand.scale.set(.72,1.15,.65);elbow.add(hand);

      const hip=this.joints[side+'Hip']=pivotLimb(T,pelvis,side+'Hip',[s*.22,0,0],upperLeg,.15,pants);
      const knee=this.joints[side+'Knee']=pivotLimb(T,hip,side+'Knee',[0,-upperLeg,0],lowerLeg,.135,pants);
      const foot=box(T,[.32,.22,.55],boot,[0,-lowerLeg-.12,.13]);knee.add(foot);
    }

    const helmet=this.internalHelmet=new T.Group();
    const shell=new T.Mesh(new T.SphereGeometry(.36,22,12,0,Math.PI*2,0,Math.PI/2),material(T,0xf0c232));shell.scale.y=.68;shell.position.y=.71;shell.castShadow=true;helmet.add(shell);helmet.add(box(T,[.83,.07,.2],material(T,0xdfaa1f),[0,.62,.16]));neck.add(helmet);helmet.visible=!!this.options.helmet;

    const idBadge=this.detailGroup=new T.Group();idBadge.add(box(T,[.18,.24,.02],dark,[.28,.58,.235]));idBadge.add(box(T,[.13,.17,.023],reflective,[.28,.58,.247]));torso.add(idBadge);
  }

  setPose(name='idle',immediate=false){this.targetPose=(name==='walk'||POSES[name])?name:'idle';if(immediate)this._applyPose(1,0)}
  setHelmet(visible){this.internalHelmet.visible=!!visible}
  setVest(visible){this.vest.visible=!!visible}
  setNeckAdjustment(radians=0){this._customNeckX=radians}
  setGraphicsQuality(level='medium'){
    this.graphicsQuality=level;
    const eco=level==='eco',high=level==='high'||level==='ultra';
    if(this.contactShadow){
      this.contactShadow.visible=!eco;
      this.contactShadow.material.opacity=level==='ultra'?.19:level==='high'?.16:.11;
    }
    if(this.detailGroup)this.detailGroup.visible=!eco;
    if(this.internalHelmet)this.internalHelmet.traverse(obj=>{if(obj.isMesh)obj.castShadow=!eco});
    this.root.traverse(obj=>{
      if(!obj.isMesh||obj===this.contactShadow)return;
      obj.castShadow=!eco;
      obj.receiveShadow=high;
    });
  }

  _poseAt(elapsed){
    if(this.targetPose!=='walk'){
      const base=POSES[this.targetPose]||POSES.idle;
      const breathe=Math.sin(elapsed*1.45),look=Math.sin(elapsed*.52);
      if(this.targetPose==='idle'||this.targetPose==='inspect'){
        const torso=[...(base.joints.torso||[0,0,0])],neck=[...(base.joints.neck||[0,0,0])];
        torso[0]+=.008*breathe;torso[2]+=.006*Math.sin(elapsed*.8);
        neck[1]+=.018*look;
        return{...base,rootY:(base.rootY??0)+.004*(.5+.5*breathe),joints:{...base.joints,torso,neck}};
      }
      return base;
    }
    const phase=Math.sin(elapsed*5.2),counter=-phase;
    return{rootY:Math.abs(Math.sin(elapsed*5.2))*.035,joints:{...POSES.idle.joints,leftShoulder:[phase*.42,0,.08],rightShoulder:[counter*.42,0,-.08],leftHip:[counter*.5,0,.02],rightHip:[phase*.5,0,-.02],leftKnee:[Math.max(0,phase)*.36,0,0],rightKnee:[Math.max(0,counter)*.36,0,0],torso:[.015*Math.sin(elapsed*10.4),0,0],neck:[0,.012*Math.sin(elapsed*.7),0]}}
  }

  _applyPose(alpha,elapsed){
    const pose=this._poseAt(elapsed);const T=this.THREE;
    for(const[name,rot]of Object.entries(pose.joints||{})){
      const joint=this.joints[name];if(!joint)continue;
      const tx=(rot[0]??0)+(name==='neck'?this._customNeckX:0),ty=rot[1]??0,tz=rot[2]??0;
      joint.rotation.x=T.MathUtils.lerp(joint.rotation.x,tx,alpha);joint.rotation.y=T.MathUtils.lerp(joint.rotation.y,ty,alpha);joint.rotation.z=T.MathUtils.lerp(joint.rotation.z,tz,alpha)
    }
    this.root.position.y=T.MathUtils.lerp(this.root.position.y,this._rootBaseY+(pose.rootY??0),alpha)
  }

  update(delta,elapsed){const alpha=Math.min(1,Math.max(.02,delta*this.poseBlend));this._applyPose(alpha,elapsed)}
  dispose(){this.root.removeFromParent?.();this.root.traverse(obj=>{obj.geometry?.dispose?.();const mats=Array.isArray(obj.material)?obj.material:[obj.material];for(const m of mats){if(!m)continue;for(const v of Object.values(m))if(v?.isTexture)v.dispose?.();m.dispose?.()}})}
}

export function createCharacterRig(THREE,options={}){return new CharacterRig(THREE,options)}
export const CHARACTER_POSES=Object.freeze(['idle','inspect','reach','walk','climb','crouch','seated']);
