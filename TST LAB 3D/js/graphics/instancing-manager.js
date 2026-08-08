export class InstancingManager{
  constructor(THREE,scene){this.THREE=THREE;this.scene=scene;this.items=[]}

  createBoxes({size=[1,1,1],material,transforms=[],name='instanced-boxes',castShadow=true,receiveShadow=true}={}){
    const {THREE}=this;
    const geometry=new THREE.BoxGeometry(...size);
    const mesh=new THREE.InstancedMesh(geometry,material,Math.max(1,transforms.length));
    mesh.name=name;
    mesh.castShadow=castShadow;
    mesh.receiveShadow=receiveShadow;
    mesh.userData.__instancedManaged=true;
    const dummy=new THREE.Object3D();
    transforms.forEach((transform,index)=>{
      const p=transform.position||[0,0,0],r=transform.rotation||[0,0,0],s=transform.scale||[1,1,1];
      dummy.position.set(...p);dummy.rotation.set(...r);dummy.scale.set(...s);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
    this.scene?.add(mesh);
    this.items.push({mesh,geometry,material});
    return mesh;
  }

  stats(){return{drawables:this.items.length,instances:this.items.reduce((sum,item)=>sum+(item.mesh?.count||0),0)}}

  dispose(){
    for(const item of this.items){item.mesh?.removeFromParent?.();item.geometry?.dispose?.();item.material?.dispose?.()}
    this.items.length=0;
  }
}
