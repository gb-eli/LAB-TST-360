import {createInspectionLab} from '../../js/ui/inspection-lab.js';
import {createIndustria3D} from '../../js/graphics/three-scenes-g5.js';

const sceneSvg=`<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Galpão industrial estilizado com máquinas, empilhadeira, trabalhador e corredor">
<defs><linearGradient id="wallI" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#263849"/><stop offset="1" stop-color="#172432"/></linearGradient><linearGradient id="floorI" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4b5155"/><stop offset="1" stop-color="#262b2f"/></linearGradient></defs>
<rect width="900" height="330" fill="url(#wallI)"/><rect y="330" width="900" height="190" fill="url(#floorI)"/>
<g opacity=".65" stroke="#61778a" stroke-width="7"><line x1="0" y1="55" x2="900" y2="55"/><line x1="120" y1="0" x2="120" y2="330"/><line x1="450" y1="0" x2="450" y2="330"/><line x1="780" y1="0" x2="780" y2="330"/></g>
<g fill="#d8e1e8" opacity=".75"><rect x="165" y="36" width="120" height="14" rx="6"/><rect x="500" y="36" width="120" height="14" rx="6"/></g>
<g id="machine-left"><rect x="90" y="225" width="220" height="142" rx="8" fill="#5f788c"/><rect x="120" y="175" width="160" height="65" rx="7" fill="#7d96a8"/><circle cx="199" cy="270" r="48" fill="#1c2831" stroke="#9eb2c0" stroke-width="8"/><circle class="ambient-anim" cx="199" cy="270" r="28" fill="#c36d35"/><path d="M199 242v56M171 270h56" stroke="#f0b46d" stroke-width="8"/></g>
<g id="machine-right"><rect x="555" y="205" width="180" height="165" rx="8" fill="#4c6d65"/><rect x="575" y="170" width="140" height="55" rx="6" fill="#75988d"/><rect x="610" y="245" width="72" height="76" fill="#17231f"/><circle cx="696" cy="192" r="11" fill="#e3564b"/></g>
<g id="forklift" transform="translate(360 325)"><rect x="0" y="35" width="120" height="65" rx="12" fill="#e2aa2f"/><rect x="74" y="0" width="50" height="55" rx="8" fill="#cf9723"/><circle cx="28" cy="100" r="21" fill="#151a1e"/><circle cx="98" cy="100" r="21" fill="#151a1e"/><rect x="118" y="12" width="8" height="100" fill="#20272d"/><rect x="126" y="104" width="62" height="7" fill="#20272d"/><rect x="126" y="84" width="62" height="7" fill="#20272d"/></g>
<g id="worker"><circle cx="385" cy="245" r="18" fill="#ad7654"/><rect x="365" y="263" width="40" height="72" rx="12" fill="#d9832d"/><rect x="369" y="331" width="13" height="58" fill="#20364c"/><rect x="389" y="331" width="13" height="58" fill="#20364c"/></g>
<path d="M0 425H900" stroke="#e2c245" stroke-width="7" stroke-dasharray="30 18"/><path d="M340 330v190M515 330v190" stroke="#d4b13d" stroke-width="5" stroke-dasharray="20 14" opacity=".8"/>
<g id="boxes"><rect x="755" y="325" width="70" height="45" fill="#9a693d"/><rect x="785" y="280" width="74" height="45" fill="#ad7b47"/><rect x="720" y="370" width="120" height="48" fill="#835b38"/></g>
<g id="extinguisher"><rect x="520" y="286" width="24" height="45" rx="8" fill="#d84f48"/><path d="M533 285q18-22 28 2" fill="none" stroke="#1e252b" stroke-width="5"/></g>
<g opacity=".18" fill="#dce8ef"><circle cx="180" cy="140" r="18"/><circle cx="225" cy="120" r="11"/><circle cx="675" cy="130" r="14"/></g>
</svg>`;

const risks=[
{id:'unguarded-machine',title:'Parte móvel com proteção inadequada',category:'Máquinas e equipamentos',severity:'high',x:22,y:51,hint:'Analise a máquina à esquerda.',explanation:'A região móvel da máquina está acessível no cenário e representa possibilidade de contato com partes em movimento.',control:'Garantir proteção física/intertravamento adequado e procedimento seguro antes da operação.'},
{id:'forklift-pedestrian',title:'Empilhadeira e pedestre na mesma zona',category:'Movimentação interna',severity:'high',x:46,y:66,hint:'Observe a interação entre trabalhador e empilhadeira.',explanation:'Pedestre e equipamento móvel compartilham a mesma área operacional sem segregação clara.',control:'Segregar rotas, sinalizar travessias e organizar circulação de pessoas e veículos.'},
{id:'blocked-extinguisher',title:'Acesso ao extintor comprometido',category:'Emergência',severity:'medium',x:60,y:61,hint:'Procure o equipamento de combate a incêndio.',explanation:'O acesso ao extintor fica próximo de equipamentos e pode ser obstruído pela operação.',control:'Manter equipamento sinalizado, visível e permanentemente desobstruído.'},
{id:'boxes-route',title:'Materiais invadindo rota de circulação',category:'Organização',severity:'medium',x:85,y:72,hint:'Observe as caixas no lado direito.',explanation:'Caixas e materiais estão avançando sobre a circulação, aumentando risco de colisão e tropeço.',control:'Definir áreas de armazenamento e manter corredores livres.'},
{id:'noise-source',title:'Fonte de ruído sem controle evidente',category:'Agente físico',severity:'medium',x:75,y:38,hint:'A máquina à direita é uma fonte potencial de ruído.',explanation:'O cenário apresenta processo industrial com provável geração de ruído sem indicação de controle coletivo ou avaliação.',control:'Avaliar exposição, priorizar controles de engenharia e complementar com proteção auditiva quando aplicável.'},
{id:'emergency-stop',title:'Parada de emergência pouco acessível',category:'Máquinas e equipamentos',severity:'high',x:79,y:37,hint:'Procure o botão vermelho da máquina.',explanation:'O botão de parada está em posição que pode ser prejudicada por materiais ou pela organização do posto.',control:'Garantir dispositivo claramente identificado e facilmente acessível ao operador.'}
];

const variants=[
  {
    id:'A',label:'Variante A — produção normal',activityProfile:'routine',
    description:'Inspeção durante operação regular com foco em máquinas e interação pessoa–equipamento.',
    sceneTitle:'Galpão — produção em andamento',
    instruction:'Comece pelas zonas de operação e circulação antes de avaliar organização secundária.',
    activeRiskIds:['unguarded-machine','forklift-pedestrian','emergency-stop','noise-source'],
    markerOffsets:{'forklift-pedestrian':[2,-2],'noise-source':[-2,2]},
    markerOffsets3d:{'forklift-pedestrian':[.3,0,-.2],'noise-source':[-.25,.1,.1]}
  },
  {
    id:'B',label:'Variante B — logística interna',activityProfile:'peak',
    description:'Movimentação de materiais aumentou; a prioridade passa a ser circulação, armazenamento e emergência.',
    sceneTitle:'Galpão — abastecimento interno',
    instruction:'Observe corredores, empilhadeira, materiais e acesso a recursos de emergência.',
    activeRiskIds:['forklift-pedestrian','boxes-route','blocked-extinguisher','noise-source'],
    markerOffsets:{'boxes-route':[-5,2],'blocked-extinguisher':[3,-2]},
    markerOffsets3d:{'boxes-route':[-.45,0,.25],'blocked-extinguisher':[.25,0,.12]}
  },
  {
    id:'C',label:'Variante C — intervenção no posto',activityProfile:'intervention',
    description:'A inspeção ocorre após uma parada operacional e exige atenção a proteções, organização e parada de emergência.',
    sceneTitle:'Galpão — verificação de posto',
    instruction:'Concentre a inspeção na máquina e no acesso aos dispositivos de controle.',
    activeRiskIds:['unguarded-machine','emergency-stop','boxes-route','blocked-extinguisher'],
    markerOffsets:{'unguarded-machine':[3,1],'emergency-stop':[-3,2]},
    markerOffsets3d:{'unguarded-machine':[.25,.05,.15],'emergency-stop':[-.2,.05,.12]}
  }
];

export function createModule(context){return createInspectionLab(context,{id:'industria',title:'Indústria e Máquinas',description:'Faça uma inspeção em um galpão industrial e reconheça riscos mecânicos, de circulação, organização e agentes físicos.',sceneTitle:'Galpão — operação em andamento',sceneNote:'Modo 2D leve para inspeção rápida e acessível.',sceneSvg,risks,create3D:createIndustria3D,scene3DNote:'G5: galpão Three.js com iluminação industrial, personagens articulados, quatro famílias de assets GLB/LOD e os mesmos seis riscos da inspeção 2D.',variants})}