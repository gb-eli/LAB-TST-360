export class AssetManager{
  constructor(assetProvider,events){
    this.assets=assetProvider;
    this.events=events;
    this.manifests=new Map();
    this.records=new Map();
    this.loadersPromise=null;
  }

  async loaders(){
    if(!this.loadersPromise){
      this.loadersPromise=Promise.all([
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/loaders/DRACOLoader.js'),
        import('three/addons/utils/SkeletonUtils.js')
      ]).then(([gltf,draco,skeleton])=>({GLTFLoader:gltf.GLTFLoader,DRACOLoader:draco.DRACOLoader,clone:skeleton.clone})).catch(error=>{
        this.loadersPromise=null;
        throw error;
      });
    }
    return this.loadersPromise;
  }

  async manifest(path){
    if(!this.manifests.has(path))this.manifests.set(path,this.assets.json(path,{cache:'no-cache'}));
    return this.manifests.get(path);
  }

  selectVariant(definition,quality='medium'){
    if(typeof definition==='string')return definition;
    const lod=definition?.lod||{};
    return lod[quality]||lod.medium||lod.high||lod.eco||lod.ultra||definition?.path||null;
  }

  async acquireFromPack(packPath,id,quality='medium',{applyTransform=true}={}){
    const pack=await this.manifest(packPath);
    const definition=pack?.assets?.[id];
    if(!definition)throw new Error(`Asset "${id}" não existe em ${packPath}.`);
    const variant=this.selectVariant(definition,quality);
    if(!variant)throw new Error(`Asset "${id}" não possui variante compatível.`);
    const base=packPath.slice(0,packPath.lastIndexOf('/')+1);
    const instance=await this.acquire(base+variant);
    if(applyTransform)this.applyTransform(instance,definition.transform);
    instance.userData.__assetDefinition={packPath,id,variant,quality,applyTransform};
    return instance;
  }

  async acquireAnimatedFromPack(packPath,id,quality='medium'){
    const pack=await this.manifest(packPath);
    const definition=pack?.assets?.[id];
    if(!definition)throw new Error(`Asset "${id}" não existe em ${packPath}.`);
    const variant=this.selectVariant(definition,quality);
    if(!variant)throw new Error(`Asset "${id}" não possui variante compatível.`);
    const base=packPath.slice(0,packPath.lastIndexOf('/')+1);
    const result=await this.acquireAnimated(base+variant);
    this.applyTransform(result.root,definition.transform);
    result.root.userData.__assetDefinition={packPath,id,variant,quality};
    return {...result,definition,variant};
  }

  async acquireAnimated(path){
    const root=await this.acquire(path);
    const key=root?.userData?.__assetManagerKey;
    const source=this.records.get(key)?.source;
    const animations=Array.isArray(source?.animations)?source.animations:[];
    root.userData.__animationClipNames=animations.map(clip=>clip.name);
    return{
      root,
      animations,
      animationNames:animations.map(clip=>clip.name),
      release:()=>this.release(root)
    };
  }

  applyTransform(object,transform={}){
    if(!object||!transform)return object;
    const p=transform.position;if(Array.isArray(p))object.position.set(...p);
    const r=transform.rotation;if(Array.isArray(r))object.rotation.set(...r);
    const s=transform.scale;if(Array.isArray(s))object.scale.set(...s);
    return object;
  }

  async acquire(path){
    const key=this.assets.resolve(path);
    let record=this.records.get(key);
    if(!record){
      record={refs:0,source:null,promise:null,key,path};
      record.promise=this.loadGLB(key).then(gltf=>{record.source=gltf;return gltf}).catch(error=>{this.records.delete(key);throw error});
      this.records.set(key,record);
    }
    const source=record.source||await record.promise;
    const {clone}=await this.loaders();
    const instance=clone(source.scene);
    record.refs++;
    instance.userData.__assetManagerKey=key;
    instance.traverse(node=>{
      node.userData.__assetManaged=true;
      if(node.isMesh){
        node.castShadow=true;
        node.receiveShadow=true;
      }
    });
    this.events?.emit('asset:acquired',{path,refs:record.refs});
    return instance;
  }

  async loadGLB(url){
    const {GLTFLoader}=await this.loaders();
    const loader=new GLTFLoader();
    return new Promise((resolve,reject)=>loader.load(url,resolve,undefined,reject));
  }

  release(instance){
    const key=instance?.userData?.__assetManagerKey;
    if(!key||instance.userData.__assetReleased)return;
    instance.userData.__assetReleased=true;
    instance.removeFromParent?.();
    const record=this.records.get(key);
    if(!record)return;
    record.refs=Math.max(0,record.refs-1);
    this.events?.emit('asset:released',{path:record.path,refs:record.refs});
    if(record.refs===0){
      this.disposeScene(record.source?.scene);
      this.records.delete(key);
      this.events?.emit('asset:evicted',{path:record.path});
    }
  }

  disposeScene(scene){
    scene?.traverse(node=>{
      node.geometry?.dispose?.();
      const mats=Array.isArray(node.material)?node.material:[node.material];
      for(const material of mats){
        if(!material)continue;
        for(const value of Object.values(material))if(value?.isTexture)value.dispose?.();
        material.dispose?.();
      }
    });
  }

  stats(){
    let refs=0;for(const record of this.records.values())refs+=record.refs;
    return{cached:this.records.size,refs,manifests:this.manifests.size};
  }
}
