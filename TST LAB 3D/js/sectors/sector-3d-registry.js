import {createPortSector3D} from '../graphics/three-scenes-sector-port.js';
import {createHealthSector3D} from '../graphics/three-scenes-sector-health.js';
import {createOfficeSector3D} from '../graphics/three-scenes-sector-office.js';
import {createWarehouseSector3D} from '../graphics/three-scenes-sector-warehouse.js';
import {createWorkshopSector3D} from '../graphics/three-scenes-sector-workshop.js';
import {
  createConstructionSectorAdapter,
  createIndustrySectorAdapter,
  createElectricalWorksSectorAdapter
} from './sector-lab-scene-adapters.js';

const REGISTRY={
  construcao:{
    label:'Construção',
    factory:createConstructionSectorAdapter,
    source:'adapter:createCanteiro3D',
    note:'Cena setorial 3D reutiliza o laboratório Canteiro 360 por adapter semântico. Hotspots e relatórios continuam usando os IDs da missão profissional.'
  },
  industria:{
    label:'Indústria',
    factory:createIndustrySectorAdapter,
    source:'adapter:createIndustria3D',
    note:'Cena setorial 3D reutiliza o laboratório Indústria por adapter semântico. Máquinas, empilhadeira e circulação são compartilhadas sem duplicar a engine.'
  },
  'porto-logistica':{
    label:'Porto',
    factory:createPortSector3D,
    source:'native-sector',
    note:'Ambiente portuário 3D educacional com GLB/LOD, contêineres instanciados e zonas operacionais. Não representa distâncias, capacidades ou procedimentos certificados.'
  },
  saude:{
    label:'Saúde',
    factory:createHealthSector3D,
    source:'native-sector',
    note:'Ambiente hospitalar 3D educacional com GLB/LOD, corredor, equipamentos de apoio, circulação e trabalhadores articulados. Não representa protocolos clínicos ou requisitos institucionais específicos.'
  },
  escritorio:{
    label:'Escritório',
    factory:createOfficeSector3D,
    source:'native-sector',
    note:'Ambiente administrativo 3D educacional com GLB/LOD, postos de trabalho, ergonomia, rotas e recursos de emergência. Ajustes ergonômicos reais dependem da pessoa, tarefa e avaliação aplicável.'
  },
  almoxarifado:{
    label:'Almoxarifado',
    factory:createWarehouseSector3D,
    source:'native-sector',
    note:'Ambiente de armazenagem 3D educacional com racks, pallets, caixas, carrinhos e trabalhadores. Capacidade estrutural, limites de carga e métodos reais dependem do sistema de armazenagem e da avaliação aplicável.'
  },
  oficina:{
    label:'Oficina',
    factory:createWorkshopSector3D,
    source:'native-sector',
    note:'Ambiente de oficina/manutenção 3D educacional com bancada, máquina, ferramenta, barreira, organização e trabalhadores. Não substitui procedimentos de manutenção, controle de energias ou instruções do fabricante.'
  },
  'obras-eletricas':{
    label:'Elétrica',
    factory:createElectricalWorksSectorAdapter,
    source:'adapter:createEletricidade3D',
    note:'Cena setorial 3D reutiliza o laboratório Eletricidade por adapter semântico. O ambiente é preventivo e não fornece instruções de intervenção elétrica.'
  }
};

export const SECTOR_3D_IDS=Object.freeze(Object.keys(REGISTRY));

export const SECTOR_3D_REUSE_PLAN=Object.freeze({
  construcao:{
    source:'createCanteiro3D',
    file:'js/graphics/three-scenes.js',
    strategy:'semantic-adapter',
    status:'active'
  },
  industria:{
    source:'createIndustria3D',
    file:'js/graphics/three-scenes-g5.js',
    strategy:'semantic-adapter',
    status:'active'
  },
  'obras-eletricas':{
    source:'createEletricidade3D',
    file:'js/graphics/three-scenes-g6.js',
    strategy:'semantic-adapter',
    status:'active'
  }
});

export function hasSector3D(sectorId){
  return !!REGISTRY[sectorId];
}

export function getSector3DDescriptor(sectorId,missionId){
  const entry=REGISTRY[sectorId];
  if(!entry)return null;
  return {
    label:entry.label,
    source:entry.source,
    note:entry.note,
    create3D:(host,context,state)=>entry.factory(host,context,{...state,missionId})
  };
}

export function listSector3D(){
  return SECTOR_3D_IDS.map(id=>({
    id,
    label:REGISTRY[id].label,
    source:REGISTRY[id].source
  }));
}
