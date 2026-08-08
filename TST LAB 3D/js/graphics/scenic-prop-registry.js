export const SCENIC_PROP_PACK='assets/scenery/g107/manifest.json';

export const SCENIC_PROP_PROFILES=Object.freeze({
  construction:[
    {id:'construction-aggregate-pile',label:'pilha de agregado',repeatable:false},
    {id:'construction-site-bin',label:'caçamba cenográfica',repeatable:false}
  ],
  industry:[
    {id:'industry-material-tote',label:'tote de material',repeatable:true},
    {id:'industry-utility-column',label:'coluna utilitária',repeatable:false}
  ],
  port:[
    {id:'port-mooring-bollard',label:'cabeço de amarração cenográfico',repeatable:true},
    {id:'port-quay-light',label:'luminária de cais',repeatable:true}
  ],
  health:[
    {id:'health-linen-cart',label:'carrinho de roupa',repeatable:false},
    {id:'health-privacy-screen',label:'biombo',repeatable:false}
  ],
  office:[
    {id:'office-planter',label:'jardineira',repeatable:true},
    {id:'office-printer-cabinet',label:'móvel com impressora',repeatable:false}
  ],
  warehouse:[
    {id:'warehouse-plastic-tote',label:'tote plástico',repeatable:true},
    {id:'warehouse-label-stand',label:'suporte de identificação',repeatable:true}
  ],
  workshop:[
    {id:'workshop-tool-chest',label:'baú de ferramentas',repeatable:false},
    {id:'workshop-parts-bin',label:'gaveteiro de peças',repeatable:true}
  ],
  electrical:[
    {id:'electrical-cable-reel',label:'carretel cenográfico',repeatable:false},
    {id:'electrical-marker-post',label:'marcador de área',repeatable:true}
  ]
});

export function getScenicPropProfile(profileId='industry'){
  return SCENIC_PROP_PROFILES[profileId]??null;
}

export function listScenicPropProfiles(){
  return Object.keys(SCENIC_PROP_PROFILES);
}
