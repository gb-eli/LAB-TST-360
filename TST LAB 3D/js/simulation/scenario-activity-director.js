const PROFILE_LIBRARY=Object.freeze({
  routine:Object.freeze({
    id:'routine',label:'Rotina',
    population:.85,ambient:.82,equipment:.82,distance:1,
    channels:Object.freeze({people:.9,traffic:.78,process:.82,doors:.9,lights:.85})
  }),
  peak:Object.freeze({
    id:'peak',label:'Pico de atividade',
    population:1,ambient:1,equipment:1,distance:1,
    channels:Object.freeze({people:1,traffic:1.2,process:1.08,doors:1,lights:1})
  }),
  reorganization:Object.freeze({
    id:'reorganization',label:'Reorganização',
    population:.65,ambient:.58,equipment:.35,distance:.92,
    channels:Object.freeze({people:.7,traffic:.45,process:.25,doors:.92,lights:.82})
  }),
  intervention:Object.freeze({
    id:'intervention',label:'Intervenção planejada',
    population:.45,ambient:.35,equipment:0,distance:.86,
    channels:Object.freeze({people:.5,traffic:.25,process:0,doors:.72,lights:.9})
  }),
  support:Object.freeze({
    id:'support',label:'Apoio / higienização',
    population:.78,ambient:.72,equipment:.48,distance:.94,
    channels:Object.freeze({people:.82,traffic:.62,process:.38,doors:1,lights:.9})
  }),
  emergency:Object.freeze({
    id:'emergency',label:'Preparação para emergência',
    population:.48,ambient:.56,equipment:.15,distance:1,
    channels:Object.freeze({people:.55,traffic:.25,process:.15,doors:1.2,lights:1.25})
  }),
  reconfiguration:Object.freeze({
    id:'reconfiguration',label:'Reconfiguração',
    population:.7,ambient:.62,equipment:.38,distance:.94,
    channels:Object.freeze({people:.75,traffic:.52,process:.32,doors:.95,lights:.86})
  }),
  opening:Object.freeze({
    id:'opening',label:'Abertura',
    population:.7,ambient:.65,equipment:.55,distance:.95,
    channels:Object.freeze({people:.75,traffic:.58,process:.52,doors:.9,lights:.82})
  })
});

export const SCENARIO_ACTIVITY_PROFILES=PROFILE_LIBRARY;

function clamp(value,min=0,max=1){
  return Math.max(min,Math.min(max,Number(value) || 0));
}

export function inferScenarioActivityProfile(variant=null){
  const explicit=variant?.activityProfile;
  if(explicit&&PROFILE_LIBRARY[explicit])return explicit;

  const text=[
    variant?.id,
    variant?.label,
    variant?.description,
    variant?.instruction
  ].filter(Boolean).join(' ').toLowerCase();

  if(/interven[cç][aã]o|manuten[cç][aã]o|verifica[cç][aã]o planejada/.test(text))return'intervention';
  if(/emerg[eê]ncia|evacua[cç][aã]o/.test(text))return'emergency';
  if(/higieniza[cç][aã]o|apoio/.test(text))return'support';
  if(/rearranjo|reconfigura/.test(text))return'reconfiguration';
  if(/reorganiza/.test(text))return'reorganization';
  if(/pico|intensa|intensifica/.test(text))return'peak';
  if(/abertura|in[ií]cio|inicial/.test(text))return'opening';
  return variant?.id==='B'?'peak':variant?.id==='C'?'reorganization':'routine';
}

function mergeProfile(profile,overrides={}){
  const channels={...profile.channels,...(overrides.channels??{})};
  return{
    ...profile,
    ...overrides,
    channels,
    id:overrides.id??profile.id,
    label:overrides.label??profile.label
  };
}

export function resolveScenarioActivityProfile(variant=null){
  const id=inferScenarioActivityProfile(variant);
  const base=PROFILE_LIBRARY[id]??PROFILE_LIBRARY.routine;
  return mergeProfile(base,variant?.activityOverrides??{});
}

export class ScenarioActivityDirector{
  constructor(context,{moduleId=null,sectorId=null,missionId=null,variant=null}={}){
    this.context=context;
    this.moduleId=moduleId;
    this.sectorId=sectorId;
    this.missionId=missionId;
    this.variant=variant;
    this.profile=resolveScenarioActivityProfile(variant);
    this.context?.events?.emit?.('scenario:activity-profile',{
      moduleId,sectorId,missionId,
      variantId:variant?.id??null,
      profileId:this.profile.id,
      label:this.profile.label
    });
  }

  channelFactor(channel='process'){
    const value=this.profile.channels?.[channel];
    return clamp(value===undefined?1:value,0,1.5);
  }

  populationPlan(base){
    const people=this.channelFactor('people');
    const factor=clamp(this.profile.population*people,0,1);
    const count=Math.min(base.count,Math.max(0,Math.round(base.count*factor)));
    const skinned=Math.min(
      count,
      base.skinned,
      Math.max(0,Math.round(base.skinned*factor))
    );
    return{
      ...base,
      count,
      skinned,
      activeDistance:base.activeDistance*clamp(this.profile.distance,.5,1)
    };
  }

  ambientPlan(base){
    const factor=clamp(this.profile.ambient,0,1);
    return{
      ...base,
      count:Math.min(base.count,Math.max(0,Math.round(base.count*factor))),
      activeDistance:base.activeDistance*clamp(this.profile.distance,.5,1),
      factor:base.factor*factor
    };
  }

  equipmentFactor(channel='process'){
    if(channel==='lights')return clamp(this.channelFactor('lights'),0,1.5);
    return clamp(this.profile.equipment*this.channelFactor(channel),0,1.5);
  }

  ambientChannelFactor(channel='process'){
    return this.channelFactor(channel);
  }

  describe(){
    return{
      profileId:this.profile.id,
      label:this.profile.label,
      moduleId:this.moduleId,
      sectorId:this.sectorId,
      missionId:this.missionId,
      variantId:this.variant?.id??null,
      population:this.profile.population,
      ambient:this.profile.ambient,
      equipment:this.profile.equipment,
      channels:{...this.profile.channels}
    };
  }
}

export function createScenarioActivityDirector(context,options={}){
  return new ScenarioActivityDirector(context,options);
}
