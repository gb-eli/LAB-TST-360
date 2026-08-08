import {createCanteiro3D} from '../graphics/three-scenes.js';
import {createIndustria3D} from '../graphics/three-scenes-g5.js';
import {createEletricidade3D} from '../graphics/three-scenes-g6.js';

const add=(a=[0,0,0],b=[0,0,0])=>[
  (a[0]||0)+(b[0]||0),
  (a[1]||0)+(b[1]||0),
  (a[2]||0)+(b[2]||0)
];

const DEFINITIONS={
  construcao:{
    renderer:createCanteiro3D,
    missions:{
      'abertura-frente':{
        map:{
          edge:'edge-open',
          route:'cables',
          ladder:'ladder',
          ppe:'worker-ppe'
        },
        baseOffsets:{
          route:[.7,0,-.4]
        }
      },
      'movimentacao-altura':{
        map:{
          load:'suspended-load',
          height:'worker-height',
          base:'cables',
          isolation:'worker-ppe'
        },
        baseOffsets:{
          base:[2.2,0,-1.0],
          isolation:[-2.2,-2.0,-.9]
        }
      }
    }
  },
  industria:{
    renderer:createIndustria3D,
    missions:{
      'linha-producao':{
        map:{
          guard:'unguarded-machine',
          pedestrian:'forklift-pedestrian',
          noise:'noise-source',
          stop:'emergency-stop'
        }
      },
      'abastecimento-interno':{
        map:{
          forklift:'forklift-pedestrian',
          stack:'boxes-route',
          extinguisher:'blocked-extinguisher',
          floor:'emergency-stop'
        },
        baseOffsets:{
          floor:[7.8,-2.25,3.2]
        }
      }
    }
  },
  'obras-eletricas':{
    renderer:createEletricidade3D,
    missions:{
      'preparacao-area':{
        map:{
          access:'restricted-access',
          panel:'open-panel',
          floor:'working-zone',
          sign:'warning'
        }
      },
      'instalacao-temporaria':{
        map:{
          cables:'cable-route',
          box:'open-panel',
          water:'working-zone',
          materials:'worker-position'
        },
        baseOffsets:{
          water:[6.2,0,3.0],
          materials:[1.8,-1.15,2.6]
        }
      }
    }
  }
};

function translateState(state,definition){
  const sectorToLab=definition.map;
  const labToSector=Object.fromEntries(Object.entries(sectorToLab).map(([sectorId,labId])=>[labId,sectorId]));

  const found=(state.found??[])
    .map(id=>sectorToLab[id])
    .filter(Boolean);

  const activeRiskIds=(state.activeRiskIds?.length?state.activeRiskIds:Object.keys(sectorToLab))
    .map(id=>sectorToLab[id])
    .filter(Boolean);

  const markerOffsets3d={};
  for(const [sectorId,labId] of Object.entries(sectorToLab)){
    const base=definition.baseOffsets?.[sectorId]??[0,0,0];
    const variantOffset=state.variant?.markerOffsets3d?.[sectorId]??[0,0,0];
    markerOffsets3d[labId]=add(base,variantOffset);
  }

  const variant={
    ...(state.variant??{}),
    markerOffsets3d
  };

  return {
    found,
    activeRiskIds,
    variant,
    onRisk:labId=>{
      const sectorId=labToSector[labId];
      if(sectorId)state.onRisk?.(sectorId);
    }
  };
}

async function createAdaptedScene(sectorId,host,context,state={}){
  const sector=DEFINITIONS[sectorId];
  const mission=sector?.missions?.[state.missionId];
  if(!sector||!mission)throw new Error(`Adapter 3D não encontrado para ${sectorId}/${state.missionId||'sem-missão'}`);
  return sector.renderer(host,context,translateState(state,mission));
}

export function createConstructionSectorAdapter(host,context,state={}){
  return createAdaptedScene('construcao',host,context,state);
}

export function createIndustrySectorAdapter(host,context,state={}){
  return createAdaptedScene('industria',host,context,state);
}

export function createElectricalWorksSectorAdapter(host,context,state={}){
  return createAdaptedScene('obras-eletricas',host,context,state);
}

export function getSectorLabAdapterMap(sectorId,missionId){
  const definition=DEFINITIONS[sectorId]?.missions?.[missionId];
  return definition?{
    map:{...definition.map},
    baseOffsets:{...(definition.baseOffsets??{})}
  }:null;
}

export const SECTOR_LAB_ADAPTERS=Object.freeze(
  Object.fromEntries(
    Object.entries(DEFINITIONS).map(([sectorId,definition])=>[
      sectorId,
      Object.freeze(Object.keys(definition.missions))
    ])
  )
);
