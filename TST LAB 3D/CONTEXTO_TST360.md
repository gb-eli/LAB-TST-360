# CONTEXTO CUMULATIVO — TST 360

## Visão
Plataforma front-end modular para o curso Técnico em Segurança do Trabalho, publicada inicialmente em GitHub Pages. Combina ferramentas didáticas, laboratórios 2D/3D/360 e simulações de situações profissionais.

## Regras consolidadas
- núcleo compartilhado e módulos independentes;
- carregamento sob demanda;
- assets separados da lógica pedagógica;
- perfis Eco/Médio/Alto/Ultra/Automático;
- descarte explícito de recursos;
- fallback GLB → procedural 3D → SVG/2D;
- mesma atividade pedagógica independentemente do renderer;
- crescimento gráfico sem reescrita estrutural;
- experiências e ferramentas gerais, sem separar interface por papel professor/aluno.

## 8 laboratórios
1. EPI Lab 3D
2. Canteiro de Obras 360
3. Indústria e Máquinas
4. Investigação de Acidentes
5. Espaço Confinado
6. Eletricidade
7. Ergonomia
8. Incêndio e Evacuação

Todos participam da arquitetura híbrida 2D/3D.

## Evolução gráfica
- G1: SVG/CSS;
- G2: Three.js procedural;
- G3: GLB/PBR/LOD;
- G4: personagens e posturas;
- G5: iluminação e movimento;
- G6: efeitos dinâmicos;
- G7: materiais procedurais e investigação forense;
- G8: métricas, instancing e otimização transversal.

## v0.10.0 / G8
- `SceneMetrics` mede FPS, calls, triângulos, geometrias, texturas, instâncias e cache;
- `InstancingManager` reduz draw calls em elementos repetidos;
- primeira aplicação de instancing no Canteiro;
- criada Central de Ferramentas TST separada dos laboratórios;
- matriz de risco, APR, checklist, inventário e PGR/plano de ação didáticos;
- painel lê resultados locais dos 8 laboratórios;
- portfólio consolidado exportável em JSON;
- ferramentas explicitamente educacionais, não substituem documentos/procedimentos oficiais.

## Próximo marco sugerido
v0.11.0: budgets por laboratório, expansão do instancing, compressão/otimização baseada nas métricas e conexão mais profunda entre resultados das simulações e ferramentas da Central TST.


## Atualização v0.11.0 — G8.1

- Criado Performance Budget Manager com metas internas de FPS, draw calls, triângulos, texturas e geometrias por laboratório e perfil gráfico.
- O indicador 3D informa se a cena está dentro do budget, em atenção ou acima da meta interna.
- Últimos diagnósticos de performance ficam persistidos localmente por laboratório.
- Criado Risk Bridge: riscos identificados no EPI Lab, Canteiro, Indústria e Eletricidade entram numa caixa da Central TST.
- A Central TST cria rascunhos de Matriz de Risco, Inventário ou APR a partir desses riscos.
- Rascunhos exigem revisão do aluno antes de salvar; o sistema não converte automaticamente uma observação em documento profissional concluído.
- Instancing foi ampliado do Canteiro para Indústria e Eletricidade.
- A plataforma continua front-end, GitHub Pages first, com fallback 3D → procedural → SVG/2D.


## Atualização v0.12.0 — G8.2

- Criado fluxo profissional simulado de inspeção: observar → identificar → registrar evidência → finalizar → Central TST → plano de ação → relatório.
- Criado `InspectionSessionService`, persistindo sessões locais com módulo, variante, modo de visualização, duração, achados, notas de evidência e contagem de capturas.
- Inspeções podem gerar relatório HTML imprimível e JSON.
- Central TST ganhou `Inspeções registradas`, com acesso a relatórios e criação de rascunho de Plano de Ação a partir de achados.
- Criado `ScenarioVariantManager`.
- Canteiro, Indústria e Eletricidade agora possuem variantes A/B/C determinísticas por nova sessão.
- As variantes alteram riscos ativos, contexto, hotspots 2D e posições dos marcadores 3D sem alterar os IDs fundamentais dos riscos.
- Capturas 3D são baixadas como PNG; as imagens não são guardadas no localStorage para evitar consumo excessivo.
- As sessões e relatórios continuam explicitamente didáticos e não substituem inspeção/documentação profissional real.

## Atualização v0.13.0 — G8.3 / Cenários Profissionais

- Criada uma Biblioteca de Cenários Profissionais paralela aos 8 laboratórios principais.
- Criado `SectorHub`, responsável por navegação, progresso e execução das missões setoriais.
- Criado `data/sectors/sectors.json` com 8 setores, 16 missões e 64 riscos didáticos.
- Setores iniciais: Construção Civil, Indústria, Logística e Porto, Saúde e Hospital, Escritório e Administrativo, Almoxarifado, Oficina e Manutenção e Obras Elétricas.
- Cada setor possui duas missões funcionais.
- As missões setoriais reutilizam o mesmo `createInspectionLab()` da v0.12, portanto já integram RiskEngine, RiskBridge, notas de evidência, sessões, relatório HTML/JSON, Central TST e Plano de Ação.
- Os IDs das missões usam prefixo `sector-`, preservando os oito módulos principais e evitando colisão de persistência.
- A primeira camada visual dos setores é SVG vetorial leve, com identidade própria por setor; o renderer pode ser substituído por Three.js/GLB posteriormente sem reescrever riscos, sessões e relatórios.
- A home ganhou acesso direto à biblioteca e a topbar passou a oferecer `Cenários Profissionais`.
- O projeto continua GitHub Pages first, sem backend obrigatório.


## Atualização v0.14.0 — G8.4

- As 16 missões da Biblioteca de Cenários Profissionais receberam variantes A/B/C, totalizando 48 configurações setoriais.
- Cada variante pode alterar contexto, instrução, riscos ativos e offsets de hotspots; a rotação é determinística e persistida.
- Logística e Porto tornou-se o primeiro setor profissional com modo 3D completo sob demanda.
- Criado `three-scenes-sector-port.js`, com factories para Pátio de Contêineres e Doca de Carregamento.
- Pátio 3D inclui contêineres instanciados, caminhão, reach stacker didático, guindaste/carga, personagens e rotas.
- Doca 3D inclui plataforma, caminhão, pallets, trabalhadores, bumpers e áreas de circulação.
- As variantes A/B/C portuárias também alteram posições operacionais no 3D.
- Criado pack `assets/sectors/porto/g1` com 8 novos GLBs em LOD0/LOD1.
- Biblioteca total passou de 73 para 81 GLBs.
- Criados budgets de performance específicos para as duas missões portuárias.
- SectorHub passou a informar o contexto da missão ao Performance Budget Manager.
- O modo SVG setorial continua sendo fallback e compartilha RiskEngine, evidências, sessões, Central TST e relatórios com o 3D.


## Atualização v0.15.0 — G8.5

- Criado Campus Virtual TST (`js/campus/campus-hub.js`) como mapa geral da plataforma.
- Campus reúne visualmente Construção, Indústria, Porto/Logística, Saúde/Hospital, Escritório, Almoxarifado, Oficina, Obras Elétricas, Central TST e Pavilhão de Laboratórios.
- Cada zona mostra progresso de missões/sessões e pode abrir o setor; zonas relacionadas também oferecem atalho para laboratório principal.
- O Campus usa EventBus e não conhece internamente ModuleManager/SectorHub, preservando desacoplamento.
- `app.js` recebeu navegação unificada (`hideAll`) para evitar múltiplas views/listeners/cenas ativas.
- Saúde/Hospital tornou-se o segundo setor profissional com modo 3D completo, depois de Logística/Porto.
- Criado `three-scenes-sector-health.js` com cenas para Área de Apoio Hospitalar e Transporte Interno/Ergonomia.
- As variantes A/B/C alteram posições dos objetos e marcadores também no Hospital 3D.
- Novo pack `assets/sectors/saude/g1` com 8 GLBs em LOD0/LOD1: bed, cart, waste-bin e cabinet.
- Biblioteca total de assets passou de 81 para 89 GLBs.
- Foram adicionados budgets de performance para as duas missões hospitalares.
- O Hospital 3D mantém foco em riscos ocupacionais e não simula procedimentos clínicos ou protocolos institucionais específicos.


## Atualização v0.16.0 — G8.6

- Campus Virtual TST passou a oferecer Mapa 2D e Maquete 3D navegável.
- Criado `js/campus/three-campus.js`, com oito prédios setoriais clicáveis, Central TST, Pavilhão de Laboratórios, vias e labels.
- A preferência 2D/3D do Campus fica persistida em `campus:view`; falha WebGL faz retorno automático ao 2D.
- Campus 3D possui budget próprio e participa de SceneMetrics/Performance Manager.
- Escritório/Administrativo tornou-se o terceiro setor profissional com modo 3D completo, após Porto e Saúde.
- Criado `three-scenes-sector-office.js` para Postos de Trabalho e Preparação para Emergência.
- O personagem sentado reutiliza CharacterRig/CharacterMotion já usados pelo laboratório de Ergonomia.
- Novo pack `assets/sectors/escritorio/g1` com 8 GLBs em LOD0/LOD1: desk, chair, monitor e extinguisher.
- Biblioteca total de GLBs passou de 89 para 97.
- Criados budgets para `sector-escritorio-posto-trabalho`, `sector-escritorio-emergencia-escritorio` e `campus-3d`.
- PerformanceManager foi corrigido para usar qualquer `scene:metrics` ativo; Porto, Saúde, Escritório e Campus 3D agora participam corretamente da qualidade Automática.


## Atualização v0.17.0 — G8.7

- Almoxarifado tornou-se o quarto setor profissional com modo 3D completo, após Porto, Saúde e Escritório.
- Criado `three-scenes-sector-warehouse.js` para Armazenamento/Prateleiras e Separação/Movimentação.
- O cenário de Almoxarifado amplia o uso de InstancedMesh em racks, prateleiras e caixas repetidas.
- Criado pack `assets/sectors/almoxarifado/g1` com 8 GLBs em LOD0/LOD1: rack, pallet-stack, picking-cart e carton.
- Biblioteca total de GLBs passou de 97 para 105.
- SectorHub agora suporta quatro setores 3D.
- Campus 3D passou a receber o progresso real calculado pelo CampusHub.
- Cada prédio mostra missões concluídas/total e barra de progresso; setores com renderer 3D recebem destaque luminoso e indicação `3D`.
- Campus ganhou animações ambientais leves subordinadas ao perfil gráfico: Eco 0 veículos, Médio 1, Alto/Ultra 2.
- Budgets específicos foram adicionados às duas missões do Almoxarifado e o budget do Campus foi revisto.


## Atualização v0.18.0 — G8.8

- Oficina/Manutenção tornou-se o quinto setor profissional com modo 3D completo.
- Criado `three-scenes-sector-workshop.js` para Corte/Esmerilhamento e Preparação para Manutenção de Máquina.
- Novo pack `assets/sectors/oficina/g1` com 8 GLBs em LOD0/LOD1: workbench, grinder, maintenance-machine e barrier.
- Biblioteca total passou de 105 para 113 GLBs.
- Criado `js/sectors/sector-3d-registry.js`.
- SectorHub não conhece mais diretamente as factories 3D individuais; recebe descriptors do registry.
- CampusHub usa `SECTOR_3D_IDS`, eliminando lista duplicada de setores 3D.
- O registry atual contém Porto, Saúde, Escritório, Almoxarifado e Oficina.
- O registry também documenta plano de adapters para Construção → `createCanteiro3D`, Indústria → `createIndustria3D` e Obras Elétricas → `createEletricidade3D`.
- Foram adicionados budgets para as duas missões de Oficina.
- A simulação de Oficina permanece preventiva e não ensina execução de manutenção, retirada de proteção ou intervenção em energia.


## Atualização v0.19.0 — G8.9

- A Biblioteca Profissional atingiu 8/8 setores com modo 3D.
- Construção, Indústria e Obras Elétricas passaram a reutilizar, respectivamente, `createCanteiro3D`, `createIndustria3D` e `createEletricidade3D`.
- Criado `js/sectors/sector-lab-scene-adapters.js`.
- Os adapters traduzem `found`, `activeRiskIds`, `markerOffsets3d` e picking entre IDs setoriais e IDs internos do laboratório.
- O contrato pedagógico permanece setorial: relatórios, RiskEngine, evidências e sessões nunca dependem dos IDs internos da cena reutilizada.
- `sector-3d-registry.js` agora possui 8 entradas ativas.
- O Campus passa automaticamente a reconhecer os 8 setores como 3D.
- Foram adicionados budgets para as seis missões setoriais adaptadas, derivados dos budgets dos laboratórios de origem.
- Nenhum GLB novo foi necessário; o total permanece em 113, demonstrando reutilização efetiva da arquitetura e dos assets existentes.


## Atualização v0.20.0 — G9.0

- A plataforma entrou na fase G9 de realismo adaptativo compartilhado.
- Criados `js/graphics/material-library.js` e `js/graphics/realism-manager.js`.
- `ThreeViewport` passa a aplicar G9 automaticamente em todas as cenas 3D existentes.
- Alto/Ultra podem adicionar microtextura procedural a pisos sem exigir arquivos externos.
- Materiais recebem anisotropia/ajustes conforme perfil.
- EnvironmentManager ganhou shadow bounds, normalBias, radius e intensidades de fill/rim adaptativas.
- CharacterRig ganhou sombra de contato, micro respiração/olhar e qualidade gráfica adaptativa.
- EffectsManager foi refatorado para fumaça/faíscas/rotas/beacon responderem à qualidade em tempo real; não ficam mais presos ao perfil em que a cena foi criada.
- QUALITY_PROFILES passaram a declarar `realism`, `contactShadows` e `materialDetail`.
- Budgets Alto/Ultra ganharam margem de +2 texturas para microtexturas procedurais.
- Não foram adicionados GLBs: biblioteca permanece em 113.
- G9.0 ainda usa personagens procedurais articulados; não deve ser descrito como sistema humano SkinnedMesh/GLB profissional.


## Atualização v0.21.0 — G9.1

- Criado `js/graphics/character-controller.js` como contrato unificado de personagens.
- O controller usa CharacterRig/CharacterMotion procedural atualmente, mas suporta opção `asset` para futuro GLB rigged.
- Criados `AssetManager.acquireAnimated()` e `acquireAnimatedFromPack()` para preservar AnimationClips e permitir `THREE.AnimationMixer`.
- GLB animado falho deve cair automaticamente para o personagem procedural.
- `animations:false` no Eco congela ciclos de animação e preserva a pose.
- Criado `js/graphics/equipment-motion.js` com rotate, vibrate, oscillate e statusLight adaptativos.
- Indústria migrou trabalhador e operador para CharacterController.
- Espaço Confinado G5 migrou seu atendente para CharacterController.
- As duas cenas de Oficina migraram todos os personagens para CharacterController.
- Corte/esmerilhamento e Indústria possuem motion contextual leve; manutenção de máquina mantém o equipamento imóvel e usa apenas sinalização de estado.
- Budgets foram recalibrados para contact shadows G9 e status meshes.
- Nenhum GLB novo foi adicionado; total permanece em 113.
- A v0.21 prepara SkinnedMesh/AnimationMixer real, mas ainda não deve ser descrita como possuindo humano GLB rigged profissional.


## Atualização v0.22.0 — G9.2

- Criado o primeiro Character Pack GLB skinned/animado real em `assets/characters/g1`.
- Pack contém `worker` e `tst`, cada um em LOD0/LOD1, totalizando 4 GLBs novos.
- Biblioteca total passou de 113 para 117 GLBs.
- Cada GLB possui skin real com `JOINTS_0`, `WEIGHTS_0`, `inverseBindMatrices`, rig `TST360HumanoidG1` de 7 joints e 7 AnimationClips embutidos: Idle, Walk, Inspect, Reach, Crouch, Seated e Climb.
- Criados `data/characters/packs.json` e `js/graphics/character-pack-registry.js`.
- CharacterController passa a ler aliases do manifest, emitir `character:source`/`character:fallback`, registrar fallbackReason e usar sombra de contato também em GLB.
- QUALITY_PROFILES ganhou `skinnedCharacters`: Eco=false, Médio/Alto/Ultra=true.
- No Eco, cenas que solicitam Character Pack usam diretamente o CharacterRig procedural.
- Integrações piloto: trabalhador da Indústria, atendente do Espaço Confinado e TST das duas cenas de Oficina.
- O source do personagem é escolhido no carregamento da cena e não é trocado em hot-swap quando a qualidade muda durante a sessão.
- G9.2 comprova SkinnedMesh + AnimationMixer, mas o Character Pack G1 é low-poly e não deve ser descrito como humano fotorealista ou rig de produção completo.


## Atualização v0.23.0 — G9.3

- Criado Character Pack G2 em `assets/characters/g2` com Worker/TST em LOD0/LOD1.
- Biblioteca passou de 117 para 121 GLBs.
- Rig G2 `TST360HumanoidG2` possui 17 joints: Hips, Spine, Chest, Neck, Head, braços/antebraços/mãos e coxas/canelas/pés separados.
- Cada G2 preserva os 7 AnimationClips: Idle, Walk, Inspect, Reach, Crouch, Seated e Climb, agora usando maior número de joints.
- `character-pack-registry.js` registra G1 e G2; G2 passa a ser o default e declara fallback para G1.
- `characterAsset()` passa a fornecer fallback descriptors.
- CharacterController percorre candidates em cadeia G2 → G1 → procedural.
- `info()` passa a informar packId, rig, jointCount e fallbackReason.
- Escritório e Saúde migraram personagens principais e TST para CharacterController/Character Pack, ampliando validação dos estados Seated, Walk, Reach e Inspect.
- Indústria, Espaço Confinado e Oficina passam automaticamente a solicitar G2 porque usam o registry central.
- Eco continua sem carregar SkinnedMesh.
- Budgets foram recalibrados para cenas com dois personagens skinned simultâneos.
- G2 continua low-poly e não deve ser descrito como mocap, humano fotorealista ou modelo biomecânico.


## Atualização v0.24.0 — G9.4

- Criado Character Pack G2.1 em `assets/characters/g21` com Worker/TST em LOD0/LOD1.
- Biblioteca passou de 121 para 125 GLBs.
- G2.1 mantém o rig `TST360HumanoidG2` de 17 joints e os 7 AnimationClips, mas usa geometria `rounded-low-poly`.
- Cabeça/mãos usam elipsoides; membros/tronco usam cilindros elípticos low-poly; capacete ganhou volume arredondado.
- G2.1 virou o Character Pack padrão.
- Cadeia atual: G2.1 → G2 → G1 → CharacterRig procedural.
- Criados `js/graphics/character-appearance.js` e `data/characters/appearances.json`.
- Materiais do clone GLB são duplicados antes de receber aparência, evitando alteração cruzada entre personagens que compartilham o mesmo source.
- Perfis visuais: standard, warm, deep e cool.
- Cenas piloto usam variações distintas para validar independência de materiais.
- `CharacterController.info()` passa a informar geometryStyle e appearanceId.
- Budgets das cenas skinned receberam margem adicional de triângulos.
- Nenhuma textura externa foi adicionada.
- G2.1 continua low-poly; não deve ser descrito como fotorealista, mocap, biomecânica ou ergonomia medida.


## Atualização v0.25.0 — G9.5

- Criado `js/graphics/character-population.js`.
- Quality Profiles agora definem `populationCount`, `skinnedPopulation` e `populationActiveDistance`.
- Perfil padrão: Eco 0 pessoas; Médio 2 procedurais; Alto 4 com até 2 skinned; Ultra 6 com até 3 skinned.
- Population Manager faz expansão incremental ao subir a qualidade e oculta/pausa excedentes ao reduzir.
- Culling em duas etapas: fora da distância ativa animação pausa; além de `activeDistance + renderMargin` o root é ocultado.
- Cada população usa seed determinístico, pequenas variações de velocidade, phase e aparência distribuída.
- Patrulha leve opcional usa movimento senoidal em um eixo; não há navmesh/pathfinding nesta fase.
- Indústria, Porto/Pátio, Porto/Doca, Saúde/Apoio e Saúde/Transporte receberam população adaptativa.
- Personagens principais do Porto foram migrados para CharacterController e passam a aproveitar G2.1/fallback.
- População é apenas contexto visual e não cria riscos adicionais no RiskEngine.
- Budgets de Indústria, Porto e Saúde foram recalibrados.
- Nenhum GLB novo; biblioteca permanece em 125.


## Atualização v0.26.0 — G9.6

- Criado `js/graphics/ambient-activity-manager.js`.
- Quality Profiles ganharam `ambientActivityCount`, `ambientActiveDistance` e `ambientMotionFactor`.
- Plano padrão: Eco 0; Médio 2 atividades/28 unidades; Alto 4/38; Ultra 6/48.
- Manager suporta path, oscillate, rotate, door e pulseLight.
- Atividades são selecionadas por prioridade e distância.
- Rotas usam o centro dos waypoints como âncora de culling, evitando que um veículo fique permanentemente congelado após sair da faixa.
- `hideWhenInactive` permite remover objetos opcionais de fundo do render em perfis menores.
- Indústria ganhou empilhadeira de fundo, caixas em rota e luz operacional.
- Porto/Pátio ganhou caminhão de fundo, trolley do pórtico e luz.
- Porto/Doca ganhou caminhão de fundo, porta vertical e luz.
- Saúde/Apoio e Saúde/Transporte ganharam carrinho de fundo, portas automáticas duplas e luz de estado.
- Objetos animados de fundo são separados dos objetos que definem hotspots.
- Caminhões, empilhadeiras e carrinhos ambientais reutilizam clones de fallbacks procedurais; não existe segundo download de GLB.
- Budgets de Indústria, Porto e Saúde foram recalibrados.
- Nenhum GLB novo; biblioteca permanece em 125.


## Atualização v0.27.0 — G9.7

- Criado `js/simulation/scenario-activity-director.js`.
- As variantes A/B/C passam a controlar estado ambiental além de riscos e offsets.
- Os 48 variants setoriais agora possuem `activityProfile` explícito.
- Perfis: routine, peak, reorganization, intervention, support, emergency, reconfiguration e opening.
- O diretor controla `CharacterPopulationManager`, `AmbientActivityManager` e `EquipmentMotionController`.
- Canais ambientais: people, traffic, process, doors e lights.
- População e atividade nunca ultrapassam o teto definido pelo perfil gráfico; o diretor só mantém ou reduz o orçamento.
- Main Lab Indústria: A routine, B peak, C intervention.
- Oficina/Esmerilhamento: A routine, B peak, C reorganization.
- Oficina/Manutenção de Máquina: A/B/C intervention; process motion fica zerado, enquanto status lights podem permanecer.
- Porto/Pátio, Porto/Doca, Saúde/Apoio e Saúde/Transporte integram o diretor.
- Interface de inspeção mostra badge `Atividade: ...`.
- Sessões e relatório HTML registram `activityProfileId`/`activityProfileLabel`.
- Central TST exibe o estado ambiental salvo na inspeção.
- Nenhum GLB novo; total permanece em 125.


## Atualização v0.28.0 — G9.8

- Regra reforçada: ambientes gráficos devem ser modulares, separados e carregados sob demanda; não existe Modo Professor/Modo Aluno.
- Criado `EnvironmentExperienceRegistry`.
- Criado `EnvironmentExperienceHub`.
- Criado `Panorama360Viewer`.
- Criado `ObjectFocusViewer`.
- Criado `data/environments/index.json` + 8 arquivos setoriais independentes.
- Cada setor inicia com 3 experiências: panorama 360, objeto 3D isolado e missão 3D; total 24 experiências.
- Panorama inicial é `procedural-svg-360`, com arraste/touch/teclado, 0–360°, 5 hotspots por setor e notas didáticas.
- Contrato de panorama já declara compatibilidade futura com imagem equiretangular/cubemap.
- Objeto 3D reutiliza GLBs existentes via AssetManager/LOD e carrega apenas um asset.
- Objetos iniciais: andaime, máquina, reach stacker, cama, cadeira, rack, esmeril e painel elétrico.
- SectorHub ganhou entrada de experiências visuais por setor.
- Campus sinaliza 8/8 setores como 3D/360, mas não pré-carrega viewers.
- `Tela de apresentação` é ferramenta geral, disponível a qualquer usuário.
- Nenhum GLB novo; biblioteca permanece em 125.


## Atualização v0.29.0 — G9.9

- Panorama 360 evoluiu para grafo de zonas lazy.
- Criado `js/experiences/panorama-graph-loader.js`.
- Cada setor possui `data/environments/<sector>/panorama/index.json` e 2 node JSON independentes.
- Total: 16 pontos de observação e 80 hotspots.
- Segunda zona só é carregada se o usuário visitá-la.
- Pontos por setor: Construção frente/altura; Indústria linha/logística; Porto pátio/doca; Saúde apoio/transporte; Escritório postos/emergência; Almoxarifado armazenagem/separação; Oficina esmerilhamento/manutenção; Elétrica preparação/temporária.
- Hotspots podem abrir notas, mudar de node, abrir objeto 3D ou abrir missão 3D.
- ExperienceHub coordena links do panorama sem duplicar lógica de missão.
- Panorama ganhou barra de pontos de observação, loading/fade de transição e ângulo inicial por zona.
- Profundidade visual usa atmosfera + cena base + foreground com parallax leve + UI.
- Panorama continua sem exigir Three.js.
- Nenhum GLB novo; total permanece em 125.
- Mesma interface continua disponível a professor, aluno ou qualquer usuário; não há roles.


## Atualização v0.30.0 — G10.0

- Criado `js/experiences/equirectangular-panorama-runtime.js`.
- Os 16 nodes panorâmicos agora possuem `image360` e continuam com fallback procedural.
- Criados 48 WebP equiretangulares de referência: Medium 1024×512, High 1600×800, Ultra 2400×1200.
- Peso combinado dos 48 WebP ≈ 0,62 MB; os arquivos são carregados somente por zona/tier.
- Os WebP incluídos são referências gráficas geradas pelo projeto, NÃO fotografias reais.
- QualityManager ganhou `panoramaImage360` e `panoramaImageTier`.
- Eco não importa o runtime equiretangular nem baixa WebP.
- Medium/High/Ultra carregam tiers próprios.
- Fallback de arquivo: Ultra→High→Medium; High→Medium; falha total→procedural.
- Panorama360Viewer tornou-se híbrido e possui alternância `automático / imagem 360 / procedural`.
- Hotspots são projetados sobre a esfera e continuam abrindo notas, nodes, objetos 3D e missões.
- Criado `assets/panoramas/g10/manifest.json` com dimensões, bytes e SHA-256.
- Criado `data/performance/panorama-budgets.json`.
- A arquitetura permite substituir qualquer referência gráfica por fotografia equiretangular real 2:1 sem reescrever SectorHub/ExperienceHub.
- Nenhum GLB novo; total permanece em 125.
- Mesma ferramenta continua disponível para professor/aluno/qualquer usuário, sem roles.


## Atualização v0.31.0 — G10.1

- Criado `PanoramaAuthoringModel` e `PanoramaAuthoringTool`.
- A biblioteca visual de cada setor ganhou `Calibrar / criar panorama 360`.
- Ferramenta geral, sem roles professor/aluno.
- Importação usa arquivo local + Object URL; nenhum upload/backend.
- Validação equiretangular 2:1 com tolerância de 4%.
- Orientação inicial configurável 0–359° e convertida para `startOffset`.
- Clique na imagem plana cria hotspot.
- Hotspot pode editar título, nota, categoria, X/Y e ação.
- Ações suportadas: note, node, object e mission.
- Contrato passa a aceitar `imageX/imageY`, mantendo `x/y` para fallback procedural.
- EquirectangularPanoramaRuntime prioriza `imageX/imageY`; nodes antigos continuam compatíveis via hotspotTransform.
- Prévia 360 reutiliza o runtime G10 com imagem local.
- Exporta node JSON e três tiers WebP no navegador: 1024×512, 1600×800 e 2400×1200.
- JSON exportado usa `sourceType: external-photo`.
- Checklist integrado de privacidade/direitos antes da publicação.
- Nenhum GLB novo; total permanece 125.
- 48 WebP de referência G10.0 preservados.


## Atualização v0.32.0 — G10.2

- Criados 8 tours visuais, um por setor, em `data/tours/`.
- Cada tour possui 4 etapas: panorama zona A → objeto 3D → panorama zona B → missão 3D.
- Total de 32 etapas; todos os módulos são reutilizados, sem duplicar assets.
- Criado `EnvironmentVisualTour` com mini-mapa, anterior/próxima, jump por etapa, barra de progresso e reset.
- Criado `VisualTourProgressService`; progresso fica em localStorage via StorageService.
- O card da biblioteca mostra percentual explorado e muda entre Iniciar/Continuar.
- Ao reabrir o tour, a última etapa é restaurada.
- A missão final só entra em `visitedStepIds` quando o botão Abrir missão 3D é acionado.
- `Panorama360Viewer` ganhou `initialNodeId`, evitando carregar o node padrão antes da zona solicitada pelo tour.
- Hotspots de panorama podem saltar para etapas correspondentes do tour.
- Campus mostra `tour XX%` em cada setor e total de tours concluídos.
- Arquivo de tour e runtime são lazy; próxima etapa não é pré-carregada.
- Nenhum GLB ou WebP novo; permanecem 125 GLBs e 48 WebP G10.
- Continua sem separação professor/aluno; o tour é uma ferramenta geral.


## Atualização v0.34.0 — G10.4
- 8 tours visuais agora são ramificados com 2 rotas possíveis por setor (16 rotas primárias).
- Decisão após panorama inicial: objeto 3D primeiro ou segunda zona 360 primeiro.
- Criado `VisualTourRouteDirector`.
- Progress service passou a persistir `decisions` e `historyStepIds`.
- Mini-mapa mostra dois ramos antes da decisão e destaca a rota escolhida depois.
- Anterior segue histórico real; Próximo segue caminho sugerido.
- Tocar diretamente em um ramo pode inferir/salvar a escolha.
- É possível trocar a ordem no ponto inicial.
- Após visitar objeto e segunda zona, a rota converge na missão.
- Missão só conclui o tour quando é realmente aberta.
- Nenhum GLB/WebP novo; 125 GLBs e 48 WebP preservados.

## Atualização v0.35.0 — G10.5
- criado SectorVisualProfile para identidade visual por contexto.
- criado ContextualDressingManager integrado opcionalmente ao ThreeViewport.
- MaterialLibrary ganhou asphalt/tile/wood/epoxy procedurais.
- QualityManager ganhou contextDressingCount: Eco1/Médio3/Alto5/Ultra7.
- dressing é decorativo, não pickable e não entra no RiskEngine.
- principais cenas de laboratórios e setores receberam visualProfile.
- ObjectFocusViewer usa dressingScale reduzido.
- SceneMetrics passou a registrar profile/created/visible da ambientação contextual.
- budgets internos receberam headroom para a camada.
- nenhum GLB/WebP novo; 125 GLBs e 48 WebP preservados.

## Atualização v0.36.0 — G10.6
- criado ContextPropRegistry com 11 perfis;
- criado ContextPropManager;
- props GLB de contexto são reutilizados dos packs já existentes, sem duplicar arquivos;
- política: Eco 0, Médio 1, Alto 2, Ultra 3;
- assets são carregados incrementalmente e somente no viewport ativo;
- LOD troca apenas ao cruzar low (Eco/Médio) ↔ high (Alto/Ultra);
- AssetManager aceita `applyTransform:false` para reuso fora da posição original do pack;
- props recebem flags decorativas e não entram no RiskEngine/picking;
- SceneMetrics e painel de performance registram props contextuais;
- ObjectFocusViewer permanece isolado sem props adicionais;
- budgets receberam headroom conservador para os props;
- 0 GLBs e 0 WebP novos; total permanece 125/48.

## Atualização v0.37.0 — G10.7
- criado pack exclusivo `assets/scenery/g107/`;
- 16 props cenográficos, 2 por setor profissional;
- 2 LODs por prop = 32 novos GLBs;
- os 32 GLBs somam ~85,6 KB;
- total da plataforma passa para 157 GLBs; WebP permanece 48;
- criado ScenicPropRegistry e ScenicPropManager;
- política: Eco 0, Médio 0, Alto 1 tipo, Ultra 2 tipos;
- props repetíveis podem usar THREE.InstancedMesh: High 2 instâncias, Ultra 3;
- flags `tstScenicProp`, `tstContextOnly`, `tstIgnoreRisk`;
- SceneMetrics passa a registrar Scenic Props;
- ObjectFocusViewer continua isolado;
- Incêndio/Evacuação desativa Context/Scenic Props para evitar cenografia elétrica inadequada;
- budgets ampliados apenas em High/Ultra e apenas nos contextos aplicáveis.

## Atualização v0.38.0 — G10.8
- criado EnvironmentAtmosphereManager;
- criado registro com 12 perfis atmosféricos;
- cada perfil define gradiente, fog e cores de iluminação;
- Eco não cria shell nem luz extra;
- Médio cria shell procedural;
- Alto cria shell + 1 luz de acento;
- Ultra cria shell + 2 luzes com pulsação sutil;
- sky shell usa CanvasTexture 64×128 gerada localmente;
- SceneMetrics registra perfil, detalhe, shell, luzes e fog;
- Incêndio/Evacuação usa atmosphereProfile emergency;
- ObjectFocusViewer permanece sem atmosfera;
- budgets ganharam pequena margem apenas em Medium/High/Ultra;
- 0 GLBs e 0 WebP novos; total permanece 157/48.
