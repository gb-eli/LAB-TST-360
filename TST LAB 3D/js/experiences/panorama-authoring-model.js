export const PANORAMA_AUTHORING_TIERS=Object.freeze({
  medium:Object.freeze({width:1024,height:512,quality:.68}),
  high:Object.freeze({width:1600,height:800,quality:.76}),
  ultra:Object.freeze({width:2400,height:1200,quality:.84})
});

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

export function sanitizePanoramaId(value='panorama'){
  const clean=String(value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'');
  return clean||'panorama';
}

export function validateEquirectangularDimensions(width,height,{tolerance=.04}={}){
  width=Number(width)||0;
  height=Number(height)||0;
  const ratio=height>0?width/height:0;
  const deviation=Math.abs(ratio-2)/2;
  return{
    valid:width>0&&height>0&&deviation<=tolerance,
    width,
    height,
    ratio,
    deviation,
    expected:'2:1'
  };
}

export function headingToStartOffset(degrees){
  const normalized=((Number(degrees)||0)%360+360)%360;
  return normalized/360*75;
}

export function startOffsetToHeading(offset){
  return clamp(offset,0,75)/75*360;
}

export function imagePointFromHotspot(hotspot,image360=null){
  if(Number.isFinite(Number(hotspot?.imageX))&&Number.isFinite(Number(hotspot?.imageY))){
    return{
      x:clamp(hotspot.imageX,0,100),
      y:clamp(hotspot.imageY,0,100)
    };
  }
  const transform=image360?.hotspotTransform;
  const x=clamp(hotspot?.x??50,0,100);
  let y=clamp(hotspot?.y??50,0,100);
  if(transform){
    const top=Number(transform.top??0);
    const height=Number(transform.height??1);
    y=clamp((top+(y/100)*height)*100,0,100);
  }
  return{x,y};
}

export function hotspotWithImagePoint(hotspot,{x,y},{preserveLegacy=true}={}){
  const next={...hotspot,imageX:clamp(x,0,100),imageY:clamp(y,0,100)};
  if(!preserveLegacy){
    next.x=next.imageX;
    next.y=next.imageY;
  }else{
    if(!Number.isFinite(Number(next.x)))next.x=next.imageX;
    if(!Number.isFinite(Number(next.y)))next.y=next.imageY;
  }
  return next;
}

export function createAuthoringHotspot(point,index=0){
  const n=index+1;
  return{
    id:`hotspot-${n}`,
    x:clamp(point.x,0,100),
    y:clamp(point.y,0,100),
    imageX:clamp(point.x,0,100),
    imageY:clamp(point.y,0,100),
    label:`Ponto ${n}`,
    note:'Descreva o que deve ser observado neste ponto.',
    category:'note'
  };
}

export function normalizeHotspotAction(hotspot,{actionType='note',target=null,label=null}={}){
  const next={...hotspot};
  if(actionType==='note'){
    delete next.action;
    next.category=next.category==='node'||next.category==='object'||next.category==='mission'
      ?'note'
      :next.category||'note';
    return next;
  }
  if(actionType==='node'){
    next.category='node';
    next.action={type:'node',nodeId:target??'',label:label||'Mudar ponto de observação'};
    return next;
  }
  if(actionType==='object'){
    next.category='object';
    next.action={type:'experience',experienceId:target??'',label:label||'Abrir objeto 3D'};
    return next;
  }
  if(actionType==='mission'){
    next.category='mission';
    next.action={type:'experience',experienceId:target??'',label:label||'Abrir missão 3D'};
    return next;
  }
  return next;
}

export function actionTypeForHotspot(hotspot,{objectId=null,missionId=null}={}){
  if(hotspot?.action?.type==='node')return'node';
  if(hotspot?.action?.type==='experience'){
    if(hotspot.action.experienceId===objectId)return'object';
    if(hotspot.action.experienceId===missionId)return'mission';
    return'experience';
  }
  return'note';
}

export function buildPanoramaNodeExport({
  node,
  sectorId,
  sourceBase,
  hotspots,
  startHeading=0,
  sourceType='external-photo'
}){
  const cleanNode=sanitizePanoramaId(node?.id||'panorama');
  const cleanSector=sanitizePanoramaId(sectorId||node?.sectorId||'setor');
  const base=(sourceBase||`assets/panoramas/custom/${cleanSector}/${cleanNode}`)
    .replace(/\/+$/,'');
  const output={
    ...node,
    version:'0.31.0',
    sectorId:sectorId||node?.sectorId,
    startOffset:headingToStartOffset(startHeading),
    hotspots:(hotspots??[]).map(h=>{
      const point=imagePointFromHotspot(h,node?.image360);
      return{...h,imageX:point.x,imageY:point.y};
    }),
    image360:{
      projection:'equirectangular',
      sourceType,
      notice:'Imagem 360 preparada localmente. Antes de publicar, revise autorização de uso, rostos, placas, documentos e outros dados visíveis.',
      tiers:{},
      fallback:'procedural-svg-360-graph'
    }
  };

  for(const [tier,spec] of Object.entries(PANORAMA_AUTHORING_TIERS)){
    output.image360.tiers[tier]={
      src:`${base}_${tier}.webp`,
      width:spec.width,
      height:spec.height
    };
  }
  return output;
}

export function panoramaAuthoringFilePlan({sectorId,nodeId}){
  const sector=sanitizePanoramaId(sectorId);
  const node=sanitizePanoramaId(nodeId);
  const base=`${sector}-${node}`;
  return{
    json:`${base}.json`,
    tiers:Object.fromEntries(
      Object.keys(PANORAMA_AUTHORING_TIERS).map(tier=>[tier,`${base}_${tier}.webp`])
    )
  };
}
