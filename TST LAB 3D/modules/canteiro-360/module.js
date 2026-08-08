import {createInspectionLab} from '../../js/ui/inspection-lab.js';
import {createCanteiro3D} from '../../js/graphics/three-scenes.js';

const sceneSvg=`<svg viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Canteiro de obras estilizado com andaime, trabalhador, escada, carga suspensa e materiais">
<defs><linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#1f4b6e"/><stop offset="1" stop-color="#8fb7cb"/></linearGradient><linearGradient id="groundC"><stop stop-color="#665842"/><stop offset="1" stop-color="#413a31"/></linearGradient></defs>
<rect width="900" height="320" fill="url(#skyC)"/><rect y="320" width="900" height="200" fill="url(#groundC)"/>
<circle cx="760" cy="72" r="42" fill="#ffd77a" opacity=".75"/>
<g opacity=".35"><rect x="0" y="210" width="130" height="110" fill="#263c49"/><rect x="140" y="170" width="155" height="150" fill="#2e4856"/><rect x="710" y="190" width="190" height="130" fill="#2b4350"/></g>
<g id="building"><rect x="110" y="155" width="330" height="250" fill="#b8b4aa"/><rect x="130" y="190" width="80" height="72" fill="#5e7482"/><rect x="235" y="190" width="80" height="72" fill="#5e7482"/><rect x="340" y="190" width="80" height="72" fill="#5e7482"/><rect x="130" y="285" width="290" height="90" fill="#d1cdc2"/><rect x="105" y="145" width="340" height="18" fill="#d4a72d"/></g>
<g id="scaffold" stroke="#4d5a63" stroke-width="8"><line x1="485" y1="120" x2="485" y2="390"/><line x1="610" y1="120" x2="610" y2="390"/><line x1="485" y1="160" x2="610" y2="160"/><line x1="485" y1="245" x2="610" y2="245"/><line x1="485" y1="330" x2="610" y2="330"/><line x1="485" y1="120" x2="610" y2="245"/><line x1="610" y1="120" x2="485" y2="245"/><line x1="485" y1="245" x2="610" y2="370"/><line x1="610" y1="245" x2="485" y2="370"/></g>
<rect x="475" y="233" width="145" height="12" fill="#d9b36d"/><rect x="475" y="318" width="145" height="12" fill="#d9b36d"/>
<g class="ambient-anim"><circle cx="548" cy="205" r="17" fill="#a97350"/><rect x="530" y="222" width="36" height="62" rx="12" fill="#e28035"/><rect x="535" y="282" width="12" height="54" fill="#243b55"/><rect x="551" y="282" width="12" height="54" fill="#243b55"/></g>
<g id="crane"><rect x="700" y="88" width="16" height="268" fill="#d7ad35"/><rect x="630" y="88" width="205" height="12" fill="#d7ad35"/><line x1="785" y1="100" x2="785" y2="230" stroke="#1f2932" stroke-width="3"/><rect x="750" y="230" width="70" height="54" fill="#8c5b34"/><path d="M750 230l35-28 35 28" fill="none" stroke="#1f2932" stroke-width="3"/></g>
<g id="ladder" transform="rotate(-17 365 365)" stroke="#b8c3ca" stroke-width="7"><line x1="345" y1="270" x2="345" y2="445"/><line x1="385" y1="270" x2="385" y2="445"/>${[290,320,350,380,410,440].map(y=>`<line x1="345" y1="${y}" x2="385" y2="${y}"/>`).join('')}</g>
<g id="cables"><path d="M40 435c95-55 115 25 210-10s100 42 190 15" fill="none" stroke="#1a1d22" stroke-width="8"/><path d="M55 442c80-32 130 18 200 6" fill="none" stroke="#e4a72b" stroke-width="4"/></g>
<g id="materials"><rect x="60" y="360" width="125" height="28" fill="#91643a"/><rect x="72" y="392" width="105" height="22" fill="#7d5635"/><circle cx="220" cy="395" r="34" fill="#65676a"/><circle cx="220" cy="395" r="17" fill="#2c3034"/><rect x="270" y="405" width="95" height="25" fill="#a47543"/></g>
<g id="worker-ground"><circle cx="665" cy="354" r="18" fill="#a97350"/><rect x="645" y="372" width="40" height="68" rx="12" fill="#f0a53a"/><rect x="651" y="438" width="12" height="52" fill="#22394f"/><rect x="670" y="438" width="12" height="52" fill="#22394f"/></g>
<g opacity=".85"><rect x="22" y="300" width="48" height="60" rx="4" fill="#e3a12c"/><path d="M46 310l16 32H30z" fill="#1d2530"/></g>
</svg>`;

const risks=[
{id:'edge-open',title:'Borda sem proteção coletiva',category:'Queda de altura',severity:'high',x:43,y:29,hint:'Observe a borda superior da construção.',explanation:'A borda elevada aparece sem guarda-corpo adequado no cenário.',control:'Priorizar proteção coletiva contra quedas antes da atividade.'},
{id:'worker-height',title:'Trabalhador exposto no andaime',category:'Trabalho em altura',severity:'high',x:61,y:41,hint:'Inspecione o trabalhador no nível superior do andaime.',explanation:'O trabalhador está em posição elevada e o cenário exige verificação de sistema de proteção contra queda.',control:'Planejar o trabalho, conferir proteções coletivas e sistema individual compatível.'},
{id:'suspended-load',title:'Carga suspensa sobre área de circulação',category:'Movimentação de cargas',severity:'high',x:87,y:50,hint:'Existe uma carga presa ao equipamento de içamento.',explanation:'A área sob a carga suspensa não está isolada no cenário.',control:'Isolar a área e impedir permanência/circulação sob carga suspensa.'},
{id:'ladder',title:'Escada em condição insegura',category:'Acesso',severity:'medium',x:40,y:69,hint:'Avalie a inclinação e apoio da escada.',explanation:'A escada aparece sem fixação e com apoio improvisado.',control:'Usar equipamento adequado, estável e corretamente posicionado.'},
{id:'cables',title:'Cabos atravessando passagem',category:'Queda no mesmo nível',severity:'medium',x:22,y:84,hint:'Olhe para o caminho no primeiro plano.',explanation:'Cabos e extensões cruzam a circulação e podem provocar tropeço ou dano ao cabo.',control:'Organizar passagem, elevar/proteger cabos e manter circulação desobstruída.'},
{id:'worker-ppe',title:'Trabalhador sem capacete visível',category:'EPI',severity:'medium',x:74,y:72,hint:'Observe o trabalhador próximo ao guindaste.',explanation:'O trabalhador no solo aparece sem capacete no cenário simulado.',control:'Verificar EPI aplicável e garantir uso adequado antes de entrar na área operacional.'}
];

const variants=[
  {
    id:'A',label:'Variante A — início do turno',
    description:'Inspeção antes da liberação geral: acesso, bordas, circulação e condições pessoais.',
    sceneTitle:'Canteiro — inspeção de abertura',
    instruction:'Priorize riscos que precisam ser percebidos antes de liberar a rotina do turno.',
    activeRiskIds:['edge-open','worker-height','ladder','cables','worker-ppe'],
    markerOffsets:{'edge-open':[-2,2],'ladder':[3,-2],'worker-ppe':[-3,1]},
    markerOffsets3d:{'edge-open':[-.35,0,.15],'ladder':[.25,0,-.15],'worker-ppe':[-.25,0,.12]}
  },
  {
    id:'B',label:'Variante B — içamento em andamento',
    description:'A operação de movimentação de carga altera a prioridade da inspeção e exige leitura da circulação.',
    sceneTitle:'Canteiro — operação de içamento',
    instruction:'Observe interação entre carga suspensa, pessoas, circulação e proteções do entorno.',
    activeRiskIds:['suspended-load','worker-ppe','cables','edge-open'],
    markerOffsets:{'suspended-load':[-4,2],'cables':[4,-3]},
    markerOffsets3d:{'suspended-load':[-.45,.1,.2],'cables':[.35,0,-.2]}
  },
  {
    id:'C',label:'Variante C — acesso e organização',
    description:'Sessão concentrada em acesso temporário, organização do piso e exposição em altura.',
    sceneTitle:'Canteiro — reorganização de frente de serviço',
    instruction:'Faça a leitura do caminho de acesso e das condições de trabalho em altura antes de concluir.',
    activeRiskIds:['ladder','cables','worker-height','edge-open'],
    markerOffsets:{'ladder':[-4,2],'cables':[5,0],'worker-height':[2,3]},
    markerOffsets3d:{'ladder':[-.3,0,.25],'cables':[.45,0,.1],'worker-height':[.2,.05,0]}
  }
];

export function createModule(context){return createInspectionLab(context,{id:'canteiro-360',title:'Canteiro de Obras 360',description:'Faça uma inspeção visual do canteiro e identifique condições que exigem intervenção do TST.',sceneTitle:'Canteiro — início do turno',sceneNote:'Modo visual G1: cena vetorial responsiva com profundidade e animações leves. Em fases futuras, este mesmo módulo poderá receber panorama 360 e GLB.',sceneSvg,risks,create3D:createCanteiro3D,scene3DNote:'G4: cena híbrida com Three.js, trabalhadores articulados, posturas animadas, seis props GLB/LOD e marcadores clicáveis. Assets G3 e objetos procedurais permanecem como fallback.',variants})}