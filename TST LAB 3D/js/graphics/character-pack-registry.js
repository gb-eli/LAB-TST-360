export const CHARACTER_PACKS=Object.freeze({
  g1:Object.freeze({
    id:'g1',
    label:'Humanoide TST G1',
    manifest:'assets/characters/g1/manifest.json',
    rig:'TST360HumanoidG1',
    jointCount:7,
    roles:Object.freeze({worker:'worker',tst:'tst'}),
    clips:Object.freeze(['Idle','Walk','Inspect','Reach','Crouch','Seated','Climb']),
    fallbackPack:null
  }),
  g2:Object.freeze({
    id:'g2',
    label:'Humanoide TST G2',
    manifest:'assets/characters/g2/manifest.json',
    rig:'TST360HumanoidG2',
    jointCount:17,
    geometryStyle:'block-low-poly',
    roles:Object.freeze({worker:'worker',tst:'tst'}),
    clips:Object.freeze(['Idle','Walk','Inspect','Reach','Crouch','Seated','Climb']),
    fallbackPack:'g1'
  }),
  g21:Object.freeze({
    id:'g21',
    label:'Humanoide TST G2.1',
    manifest:'assets/characters/g21/manifest.json',
    rig:'TST360HumanoidG2',
    jointCount:17,
    geometryStyle:'rounded-low-poly',
    roles:Object.freeze({worker:'worker',tst:'tst'}),
    clips:Object.freeze(['Idle','Walk','Inspect','Reach','Crouch','Seated','Climb']),
    fallbackPack:'g2'
  })
});

export const DEFAULT_CHARACTER_PACK='g21';

function descriptor(role,packId){
  const pack=CHARACTER_PACKS[packId];
  if(!pack)throw new Error(`Character pack desconhecido: ${packId}`);
  const id=pack.roles[role];
  if(!id)throw new Error(`Role de personagem desconhecida em ${packId}: ${role}`);
  return{
    pack:pack.manifest,
    id,
    packId,
    role,
    rig:pack.rig,
    jointCount:pack.jointCount,
    geometryStyle:pack.geometryStyle??null
  };
}

export function characterAsset(role='worker',packId=DEFAULT_CHARACTER_PACK){
  const primary=descriptor(role,packId);
  const fallbacks=[];
  let next=CHARACTER_PACKS[packId]?.fallbackPack??null;
  const visited=new Set([packId]);
  while(next&&!visited.has(next)){
    visited.add(next);
    fallbacks.push(descriptor(role,next));
    next=CHARACTER_PACKS[next]?.fallbackPack??null;
  }
  return{...primary,fallbacks};
}

export function characterPackInfo(packId=DEFAULT_CHARACTER_PACK){
  return CHARACTER_PACKS[packId]??null;
}

export function listCharacterPacks(){
  return Object.values(CHARACTER_PACKS).map(pack=>({
    id:pack.id,
    label:pack.label,
    rig:pack.rig,
    jointCount:pack.jointCount,
    geometryStyle:pack.geometryStyle??null,
    fallbackPack:pack.fallbackPack
  }));
}
