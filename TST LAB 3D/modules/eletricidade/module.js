import {createEletricidade3D} from '../../js/graphics/three-scenes-g6.js';
import {createInspectionLab} from '../../js/ui/inspection-lab.js';
const sceneSvg=`<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Sala elétrica didática com painéis, cabos, trabalhador e áreas de circulação">
<defs><linearGradient id="ew" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#233849"/><stop offset="1" stop-color="#14222d"/></linearGradient></defs><rect width="900" height="340" fill="url(#ew)"/><rect y="340" width="900" height="180" fill="#32383c"/>
<g><rect x="75" y="110" width="210" height="270" rx="8" fill="#566d78"/><rect x="95" y="140" width="170" height="90" fill="#2a3b45"/><circle cx="125" cy="170" r="9" fill="#e8544c"/><circle cx="155" cy="170" r="9" fill="#67d884"/><rect x="105" y="260" width="150" height="80" fill="#334854"/><path d="M115 275h130M115 295h130M115 315h130" stroke="#81939d" stroke-width="5"/></g>
<g><rect x="355" y="120" width="220" height="260" rx="8" fill="#607987"/><path d="M385 155h160v185H385z" fill="#2e414d"/><polygon points="465,185 432,250 462,250 440,305 510,225 478,225 500,185" fill="#f2c84d"/></g>
<g class="ambient-anim"><circle cx="690" cy="280" r="18" fill="#a97455"/><rect x="670" y="298" width="40" height="82" rx="10" fill="#e09b37"/><rect x="675" y="378" width="12" height="70" fill="#243b50"/><rect x="695" y="378" width="12" height="70" fill="#243b50"/></g>
<path d="M600 445c85-42 140-16 220-48" stroke="#262b2d" stroke-width="16" fill="none"/><path d="M612 450c82-40 138-12 216-45" stroke="#e5aa39" stroke-width="4" fill="none"/>
<rect x="620" y="118" width="155" height="38" rx="8" fill="#403229"/><text x="698" y="143" text-anchor="middle" class="zone-label">ACESSO RESTRITO</text>
<rect x="70" y="420" width="320" height="50" fill="#d3b53f" opacity=".18"/><path d="M80 445h300" stroke="#d3b53f" stroke-width="4" stroke-dasharray="20 12"/>
</svg>`;
const risks=[{"id": "open-panel", "title": "Painel sem condição segura de fechamento/isolamento visual", "category": "Elétrico", "severity": "high", "x": 51, "y": 45, "hint": "Observe o painel central.", "explanation": "O cenário mostra acesso a componentes que exigem controle rigoroso e condição segura antes de qualquer intervenção.", "control": "Impedir acesso indevido e assegurar que intervenções sejam realizadas somente sob procedimento, desenergização/controle aplicável e pessoal autorizado."}, {"id": "cable-route", "title": "Cabo atravessando circulação", "category": "Organização / elétrico", "severity": "medium", "x": 78, "y": 82, "hint": "Olhe para o piso à direita.", "explanation": "Cabos em rota de circulação podem sofrer danos e também gerar risco de tropeço.", "control": "Organizar e proteger a passagem de cabos, mantendo circulação livre e adequada ao ambiente."}, {"id": "restricted-access", "title": "Controle de acesso insuficiente", "category": "Organização", "severity": "high", "x": 75, "y": 25, "hint": "Observe a área sinalizada.", "explanation": "Uma área elétrica deve ter controle de acesso coerente com os riscos presentes.", "control": "Restringir o acesso conforme o procedimento da instalação e manter sinalização/controle visíveis."}, {"id": "working-zone", "title": "Zona frontal do painel parcialmente obstruída", "category": "Layout", "severity": "medium", "x": 27, "y": 79, "hint": "Veja a faixa frontal aos painéis.", "explanation": "Materiais ou obstáculos na área de trabalho podem prejudicar acesso, inspeção e resposta a ocorrências.", "control": "Manter a área de trabalho e circulação desobstruída conforme o projeto e os procedimentos locais."}, {"id": "worker-position", "title": "Trabalhador próximo à instalação sem contexto de liberação", "category": "Elétrico", "severity": "high", "x": 76, "y": 58, "hint": "Analise a posição do trabalhador.", "explanation": "A proximidade com instalações elétricas deve estar vinculada a autorização, capacitação e controles apropriados à atividade.", "control": "Confirmar autorização, capacitação e medidas de controle antes de qualquer aproximação/intervenção."}, {"id": "warning", "title": "Sinalização precisa ser parte de um sistema de controle", "category": "Sinalização", "severity": "low", "x": 69, "y": 30, "hint": "A placa por si só resolve o risco?", "explanation": "Sinalização é importante, mas não substitui barreiras, controle de acesso, procedimentos e condições seguras.", "control": "Usar sinalização como complemento a controles técnicos e administrativos, não como única medida."}];
const variants=[
  {
    id:'A',label:'Variante A — acesso e intervenção',
    description:'Sessão voltada à condição de acesso, painel e presença de trabalhador próximo à instalação.',
    sceneTitle:'Sala elétrica — verificação de acesso',
    instruction:'Analise primeiro barreiras, contexto de autorização e condição visual do painel.',
    activeRiskIds:['open-panel','restricted-access','worker-position','warning'],
    markerOffsets:{'restricted-access':[-3,2],'worker-position':[2,-2]},
    markerOffsets3d:{'restricted-access':[-.25,0,.12],'worker-position':[.25,0,-.12]}
  },
  {
    id:'B',label:'Variante B — organização do ambiente',
    description:'A prioridade é manter circulação e zona frontal dos equipamentos em condição adequada.',
    sceneTitle:'Sala elétrica — organização e circulação',
    instruction:'Leia o piso, a frente dos painéis e a relação entre sinalização e controles físicos.',
    activeRiskIds:['cable-route','working-zone','warning','worker-position'],
    markerOffsets:{'cable-route':[-4,0],'working-zone':[4,-2]},
    markerOffsets3d:{'cable-route':[-.4,0,.15],'working-zone':[.35,0,-.15]}
  },
  {
    id:'C',label:'Variante C — controle integrado',
    description:'Sessão combinando acesso, painel, circulação e área frontal para avaliar controles em conjunto.',
    sceneTitle:'Sala elétrica — controles combinados',
    instruction:'Evite tratar sinalização como controle único; observe como as medidas precisam funcionar em conjunto.',
    activeRiskIds:['open-panel','cable-route','working-zone','restricted-access'],
    markerOffsets:{'open-panel':[2,1],'cable-route':[3,-2]},
    markerOffsets3d:{'open-panel':[.2,.05,.1],'cable-route':[.3,0,-.1]}
  }
];

export function createModule(context){return createInspectionLab(context,{id:'eletricidade',title:'Eletricidade — Inspeção Didática',description:'Inspecione uma sala elétrica simulada, reconhecendo condições que exigem controle de acesso, organização e procedimentos seguros.',sceneTitle:'Sala elétrica — cenário simulado',sceneNote:'Atividade de reconhecimento de riscos. Não execute intervenções elétricas com base nesta simulação; atividades reais exigem qualificação, autorização e procedimentos aplicáveis.',sceneSvg,risks,view3DLabel:'3D G6',create3D:createEletricidade3D,scene3DNote:'Cena G6 ilustrativa: brilho e partículas destacam perigo visualmente, mas não representam magnitude elétrica real.',variants})}