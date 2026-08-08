export const CONTEXT_PROP_PROFILES=Object.freeze({
  epi:{
    pack:'assets/modules/epi-lab/g4/manifest.json',
    props:[
      {id:'helmet',label:'capacete',targetSize:.72},
      {id:'gloves',label:'luvas',targetSize:.65},
      {id:'boots',label:'botas',targetSize:.68}
    ]
  },
  construction:{
    pack:'assets/modules/canteiro-360/g4/manifest.json',
    props:[
      {id:'pallet',label:'pallet',targetSize:1.35},
      {id:'barrier',label:'barreira',targetSize:1.3},
      {id:'wheelbarrow',label:'carrinho',targetSize:1.35}
    ]
  },
  industry:{
    pack:'assets/modules/industria/g5/manifest.json',
    props:[
      {id:'barrier',label:'barreira',targetSize:1.25},
      {id:'extinguisher',label:'extintor',targetSize:.78},
      {id:'machine',label:'máquina contextual',targetSize:1.45}
    ]
  },
  confined:{
    pack:'assets/modules/espaco-confinado/g5/manifest.json',
    props:[
      {id:'monitor',label:'monitor',targetSize:.72},
      {id:'blower',label:'ventilador',targetSize:1.05},
      {id:'tripod',label:'tripé',targetSize:1.55}
    ]
  },
  forensic:{
    pack:'assets/modules/investigacao-acidentes/g7/manifest.json',
    props:[
      {id:'clipboard',label:'prancheta',targetSize:.66},
      {id:'wrench',label:'ferramenta',targetSize:.72},
      {id:'barrier',label:'barreira',targetSize:1.25}
    ]
  },
  port:{
    pack:'assets/sectors/porto/g1/manifest.json',
    props:[
      {id:'dock-bumper',label:'batente de doca',targetSize:1.15},
      {id:'container',label:'contêiner contextual',targetSize:2.25},
      {id:'truck',label:'caminhão contextual',targetSize:1.9}
    ]
  },
  health:{
    pack:'assets/sectors/saude/g1/manifest.json',
    props:[
      {id:'waste-bin',label:'coletor',targetSize:.78},
      {id:'cabinet',label:'armário',targetSize:1.45},
      {id:'cart',label:'carrinho',targetSize:1.2}
    ]
  },
  office:{
    pack:'assets/sectors/escritorio/g1/manifest.json',
    props:[
      {id:'chair',label:'cadeira',targetSize:1.1},
      {id:'monitor',label:'monitor',targetSize:.72},
      {id:'extinguisher',label:'extintor',targetSize:.8}
    ]
  },
  warehouse:{
    pack:'assets/sectors/almoxarifado/g1/manifest.json',
    props:[
      {id:'carton',label:'caixa',targetSize:.8},
      {id:'picking-cart',label:'carrinho de separação',targetSize:1.3},
      {id:'pallet-stack',label:'pallet contextual',targetSize:1.55}
    ]
  },
  workshop:{
    pack:'assets/sectors/oficina/g1/manifest.json',
    props:[
      {id:'barrier',label:'barreira',targetSize:1.25},
      {id:'workbench',label:'bancada',targetSize:1.65},
      {id:'grinder',label:'esmeril contextual',targetSize:1.15}
    ]
  },
  electrical:{
    pack:'assets/modules/eletricidade/g6/manifest.json',
    props:[
      {id:'warning_sign',label:'sinalização',targetSize:1.0},
      {id:'cable_guard',label:'proteção de cabo',targetSize:1.2},
      {id:'barrier',label:'barreira',targetSize:1.3}
    ]
  }
});

export function getContextPropProfile(profileId='industry'){
  return CONTEXT_PROP_PROFILES[profileId]??null;
}

export function listContextPropProfiles(){
  return Object.keys(CONTEXT_PROP_PROFILES);
}
