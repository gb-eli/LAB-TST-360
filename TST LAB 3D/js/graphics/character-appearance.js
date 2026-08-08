export const CHARACTER_APPEARANCES=Object.freeze({
  standard:Object.freeze({
    id:'standard',
    skin:0x986445,
    worker:0xd66a18,
    tst:0x244d3b,
    vest:0x2b9c5c,
    helmet:0xf0b817,
    pants:0x1f3444
  }),
  warm:Object.freeze({
    id:'warm',
    skin:0xb87955,
    worker:0xbc5b18,
    tst:0x265d4a,
    vest:0x358f5b,
    helmet:0xe8b22d,
    pants:0x263946
  }),
  deep:Object.freeze({
    id:'deep',
    skin:0x6d422f,
    worker:0xc65a14,
    tst:0x1f5342,
    vest:0x2f8a57,
    helmet:0xe3af27,
    pants:0x172d39
  }),
  cool:Object.freeze({
    id:'cool',
    skin:0x8a5a43,
    worker:0xb55720,
    tst:0x28574d,
    vest:0x3b8e63,
    helmet:0xe5b830,
    pants:0x213845
  })
});

export const DEFAULT_CHARACTER_APPEARANCE='standard';

const MATERIAL_KEYS=new Set([
  'skin','worker','tst','vest','helmet','pants'
]);

function profileFor(id){
  return CHARACTER_APPEARANCES[id]??CHARACTER_APPEARANCES[DEFAULT_CHARACTER_APPEARANCE];
}

export function applyCharacterAppearance(root,appearanceId=DEFAULT_CHARACTER_APPEARANCE){
  if(!root)return{appearanceId:DEFAULT_CHARACTER_APPEARANCE,materials:[]};
  const profile=profileFor(appearanceId);
  const owned=[];
  root.traverse(object=>{
    if(!object.isMesh||!object.material)return;
    const source=Array.isArray(object.material)?object.material:[object.material];
    const cloned=source.map(material=>{
      if(!material?.clone)return material;
      const copy=material.clone();
      owned.push(copy);
      const key=String(copy.name||'').toLowerCase();
      if(MATERIAL_KEYS.has(key)&&profile[key]!==undefined){
        copy.color?.setHex?.(profile[key]);
      }
      if(key==='reflective'){
        copy.emissive?.setHex?.(0x6f671c);
        copy.emissiveIntensity=.18;
      }
      copy.needsUpdate=true;
      return copy;
    });
    object.material=Array.isArray(object.material)?cloned:cloned[0];
  });
  root.userData.characterAppearance=profile.id;
  return{
    appearanceId:profile.id,
    materials:owned,
    dispose(){
      for(const material of owned)material?.dispose?.();
      owned.length=0;
    }
  };
}

export function listCharacterAppearances(){
  return Object.keys(CHARACTER_APPEARANCES);
}
