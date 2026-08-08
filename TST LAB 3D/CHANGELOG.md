# Changelog — TST 360

## 0.38.0 — 08/08/2026

### G10.8 — Atmosphere
- criado `environment-atmosphere-profiles.js`;
- criado `environment-atmosphere-manager.js`;
- 12 perfis atmosféricos;
- sky shell procedural por CanvasTexture;
- fog recalibrada por qualidade;
- luzes de acento High/Ultra;
- animação de intensidade apenas em Ultra.

### Integração
- ThreeViewport passa a gerenciar atmosfera;
- SceneMetrics registra atmosfera;
- painel de performance mostra perfil/detalhe/luzes.

### Coerência
- Incêndio/Evacuação usa perfil `emergency`;
- ObjectFocusViewer mantém atmosfera desativada.

### Assets
- 0 GLBs novos;
- 0 WebP novos;
- total permanece 157 GLBs e 48 WebP.

## 0.37.0 — 08/08/2026

### G10.7 — Scenic Props
- criado pack `assets/scenery/g107/`;
- 16 props exclusivos;
- 32 novos GLBs;
- 2 LODs por prop;
- ~85,6 KB de GLBs novos.

### Runtime
- criado `scenic-prop-registry.js`;
- criado `scenic-prop-manager.js`;
- Eco/Médio: 0;
- Alto: 1 tipo;
- Ultra: 2 tipos;
- props repetíveis usam `InstancedMesh` quando o GLB é single-mesh.

### Segurança semântica
- `tstScenicProp`;
- `tstContextOnly`;
- `tstIgnoreRisk`;
- fora de RiskEngine e picking.

### Coerência
- Incêndio/Evacuação não recebe Context/Scenic Props do perfil elétrico.

### Assets
- total GLB: 157;
- WebP: 48.

## 0.36.0 — 08/08/2026

### G10.6 — Context Props
- criado `context-prop-registry.js`;
- criado `context-prop-manager.js`;
- 11 perfis mapeados para packs GLB já existentes;
- 0/1/2/3 props em Eco/Médio/Alto/Ultra;
- props carregados progressivamente;
- troca de LOD apenas entre famílias low/high;
- props marcados como decorativos e fora da lógica de risco.

### AssetManager
- `acquireFromPack()` ganhou opção `applyTransform:false`;
- permite reutilizar GLB de um pack sem herdar a posição original da cena.

### Performance
- SceneMetrics registra props contextuais;
- budgets receberam margem pequena somente fora do Campus;
- Eco não carrega prop GLB contextual.

### Assets
- 0 GLBs novos;
- 0 WebP novos;
- total continua 125 GLBs e 48 WebP.

## 0.35.0 — 08/08/2026

### Realismo setorial
- criado `sector-visual-profiles.js`.
- criado `contextual-dressing-manager.js`.
- ThreeViewport pode receber `visualProfile` e `dressingScale`.
- contexto visual é decorativo e não entra no RiskEngine.

### Materiais
- MaterialLibrary ganhou asphalt, tile, wood e epoxy.
- texturas são CanvasTexture procedurais; nenhum arquivo raster novo.

### Qualidade
- novo `contextDressingCount`.
- Eco 1 / Médio 3 / Alto 5 / Ultra 7.
- sombras contextuais somente Alto/Ultra.

### Cobertura
- laboratórios-base e renderers setoriais receberam perfil visual.
- object viewer usa dressing reduzido.
- adapters setoriais herdam a camada dos renderers-base.

### Performance
- budgets internos receberam headroom específico para a nova camada.
- SceneMetrics passa a reportar dressing criado/visível/perfil.

### Assets
- 0 GLBs novos.
- 0 WebP novos.
- 125 GLBs e 48 WebP preservados.

## 0.34.0 — 08/08/2026

### Experiência gráfica
- refinada a interface geral com mais profundidade visual, gradientes, sombras e hierarquia.
- hero inicial ampliado com indicadores gráficos e resumo da auditoria.
- cards de módulos, ambientes e ferramentas receberam acabamento visual e feedback de hover.

### Viewer 3D
- `object-focus-viewer.js` ganhou palco gráfico aprimorado.
- iluminação temática por setor.
- modo alternável de iluminação de realce.
- grade visual ligável/desligável.
- HUD com qualidade, luz, grade e quantidade de observações.

### Viewer 360
- `panorama360-viewer.js` ganhou HUD de cena.
- botão para alternar destaque dos hotspots.
- feedback visual mais forte para exploração do ambiente.
- atualização do HUD conforme qualidade, renderização e hotspot em foco.

### Auditoria
- criada auditoria gráfica/técnica da plataforma.
- consolidados pontos fortes, gargalos e próximos passos para realismo progressivo.
- mantido princípio de modularidade e carregamento sob demanda.

### Assets
- 0 GLBs novos.
- 0 WebP novos.
- preservados 125 GLBs e 48 WebP.

## 0.34.0 — 08/08/2026

### Branching Tours
- 8 tours passam a `branch-and-converge`.
- 2 escolhas por tour.
- 16 rotas primárias possíveis.
- escolha: objeto 3D primeiro ou segunda zona 360 primeiro.
- rotas convergem na missão.

### Route Director
- criado `js/experiences/visual-tour-route-director.js`.
- calcula choices, path, next, previous, edges e convergência.
- infere escolha ao tocar diretamente em um ramo.

### Progress
- `decisions` persistidas.
- `historyStepIds` persistido.
- migração natural do progresso v0.32.
- revisitas não duplicam progresso.

### UI
- painel de decisão.
- mini-mapa ramificado antes da escolha.
- mini-mapa destaca rota selecionada.
- Anterior segue histórico.
- Próximo segue rota.
- opção Trocar ordem.
- card da biblioteca mostra 2 rotas e decisão salva.

### Assets
- 0 GLBs novos.
- 0 WebP novos.
- 125 GLBs e 48 WebP preservados.

## 0.32.0 — 08/08/2026

### Visual Tours
- Criado `data/tours/index.json`.
- Criados 8 arquivos de tour setorial.
- 4 etapas por tour.
- 32 etapas no total.

### Runtime
- Criado `js/experiences/environment-visual-tour.js`.
- Criado `js/experiences/visual-tour-progress-service.js`.
- mini-mapa clicável.
- anterior/próxima.
- jump por etapa.
- progress bar.
- reset.
- retomada local.

### Sequência
Por setor:
1. panorama zona A;
2. objeto 3D;
3. panorama zona B;
4. missão 3D.

### Lazy
- arquivo do tour carregado apenas ao abrir o tour.
- runtime do tour importado dinamicamente.
- panorama carrega somente o node da etapa.
- objeto carrega somente seu GLB/LOD.
- missão só carrega quando lançada.

### Panorama
- `Panorama360Viewer` ganhou `initialNodeId`.
- tour pode abrir diretamente a segunda zona sem carregar a primeira.

### Progresso
- localStorage via StorageService.
- etapa atual.
- visitedStepIds.
- startedAt.
- updatedAt.
- completedAt.
- missão final só conta ao ser lançada.

### ExperienceHub
- quarto card: Tour visual.
- percentual visível no card.
- Iniciar / continuar tour.

### Campus
- percentual do tour por setor.
- total de tours concluídos no resumo.

### Assets
- nenhum GLB novo.
- nenhum WebP novo.
- 125 GLBs preservados.
- 48 WebP G10 preservados.

## 0.31.0 — 08/08/2026

### Panorama Authoring
- Criado `js/experiences/panorama-authoring-model.js`.
- Criado `js/experiences/panorama-authoring-tool.js`.
- ExperienceHub ganhou `Calibrar / criar panorama 360`.
- Ferramenta geral; sem roles professor/aluno.

### Importação local
- `input[type=file]`.
- `URL.createObjectURL`.
- nenhuma API de upload.
- nenhuma persistência automática da foto.
- arquivo permanece local ao navegador.

### Calibração
- validação de proporção equiretangular 2:1.
- orientação inicial 0–359°.
- clique na imagem plana para criar hotspot.
- edição de label/note/category.
- edição X/Y.
- exclusão.
- ações note/node/object/mission.

### Coordenadas
- `imageX/imageY` adicionados ao contrato.
- `x/y` preservados para fallback procedural.
- runtime equiretangular prioriza `imageX/imageY`.
- hotspots antigos continuam compatíveis via `hotspotTransform`.

### Preview
- prévia 360 reutiliza EquirectangularPanoramaRuntime.
- arquivo local vira textura sem upload.
- hotspots calibrados podem ser conferidos na esfera.

### Export
- node JSON.
- Medium WebP 1024×512.
- High WebP 1600×800.
- Ultra WebP 2400×1200.
- sourceType exportado = `external-photo`.

### Privacidade
- checklist de rostos.
- placas/documentos.
- autorização/direitos.
- revisão final dos hotspots.

### Assets
- nenhum GLB novo.
- 125 GLBs preservados.
- 48 referências WebP G10 preservadas.

## 0.30.0 — 08/08/2026

### G10 — Hybrid Panorama
- Criado `js/experiences/equirectangular-panorama-runtime.js`.
- Panorama Graph passa a aceitar `image360`.
- Renderer equiretangular é carregado somente fora do Eco.
- Procedural G9.9 continua como fallback.

### Imagens
- 16 nodes com imagem equiretangular.
- 3 tiers por node.
- 48 WebP novos.
- Medium: 1024×512.
- High: 1600×800.
- Ultra: 2400×1200.
- Peso combinado ≈ 0,62 MB.
- Imagens são referências gráficas geradas pelo projeto, não fotografias reais.

### Runtime
- SphereGeometry invertida.
- MeshBasicMaterial com textura equiretangular.
- yaw/pitch por pointer.
- zoom por wheel.
- ResizeObserver.
- hotspots projetados no espaço da câmera.
- atualização de tier ao trocar qualidade.

### Fallback
- Ultra → High → Medium.
- High → Medium.
- falha total → panorama procedural.
- Eco → panorama procedural sem baixar WebP.

### Quality Manager
Novos campos:
- `panoramaImage360`
- `panoramaImageTier`

### Viewer
- modo automático.
- modo imagem 360.
- modo procedural.
- badge do renderer atual.
- aviso da origem visual.

### Performance
- criado `data/performance/panorama-budgets.json`.
- Eco: 0.
- Medium: até 96 KB por node.
- High: até 160 KB.
- Ultra: até 320 KB.
- nenhum GLB novo.
- total permanece 125 GLBs.

## 0.29.0 — 08/08/2026

### Panorama Graph
- Criado `js/experiences/panorama-graph-loader.js`.
- Cada setor passa a ter um índice panorâmico próprio.
- Criados 16 arquivos de pontos de observação.
- Cada node é carregado somente quando visitado.
- Cache local somente para nodes já abertos.

### Conteúdo
- 16 pontos panorâmicos.
- 80 hotspots.
- 2 pontos por setor.
- 5 hotspots por ponto.

### Hotspot Actions
- `note`
- `node`
- `experience → object3d`
- `experience → mission3d`

### Navegação
- Barra de pontos de observação.
- Transição por botão ou hotspot.
- Loading overlay.
- fade entre zonas.
- ângulo inicial por zona.

### Profundidade
- cena base;
- foreground com parallax leve;
- atmosfera;
- hotspots/UI.
- Nenhum WebGL exigido pelo panorama.

### Integração
- Panorama pode abrir ObjectFocusViewer diretamente.
- Panorama pode abrir missão 3D diretamente.
- ExperienceHub permanece como coordenador.
- SectorHub continua dono das missões.

### Performance
- JSON de segunda zona não é carregado até ser visitado.
- Nenhum GLB novo.
- Total permanece em 125 GLBs.
- Panorama continua funcional sem Three.js.

## 0.28.0 — 08/08/2026

### Environment Experience Registry
- Criado `js/experiences/environment-experience-registry.js`.
- Criado `data/environments/index.json`.
- Criados 8 arquivos setoriais independentes.
- Carregamento do arquivo setorial somente ao abrir a biblioteca visual.

### 24 experiências visuais
- 8 panoramas 360.
- 8 objetos GLB em foco.
- 8 atalhos para missões 3D existentes.

### Panorama 360
- Criado `js/experiences/panorama360-viewer.js`.
- Renderer inicial `procedural-svg-360`.
- Arraste horizontal.
- Setas/teclado.
- Indicador 0°–360°.
- 5 hotspots por setor.
- Notas de observação.
- Responsivo.
- Preparado para futuro renderer equiretangular/cubemap.

### Objeto 3D
- Criado `js/experiences/object-focus-viewer.js`.
- Reutiliza `ThreeViewport`, `AssetManager` e GLB/LOD.
- Normalização automática do objeto no estúdio.
- Orbit/zoom.
- rotação automática.
- reenquadramento.
- captura PNG.
- Nenhum GLB duplicado.

### Experience Hub
- Criado `js/experiences/environment-experience-hub.js`.
- Carrega viewer via `import()` somente quando solicitado.
- Tela de apresentação geral.
- Sem separação professor/aluno.

### Setores / Campus
- `SectorHub` ganhou entrada "Abrir experiências visuais".
- Bibliotecas visuais são independentes das missões.
- Campus passa a sinalizar 8/8 setores como `3D/360`.
- Campus não carrega os viewers; continua sendo navegação.

### Performance
- Panorama não carrega Three.js.
- Objeto 3D carrega somente um GLB.
- Missão 3D reutiliza cenário existente.
- Nenhum GLB novo.
- Total permanece em 125 GLBs.

## 0.27.0 — 08/08/2026

### Scenario Activity Director
- Criado `js/simulation/scenario-activity-director.js`.
- Variantes passam a controlar estado ambiental além dos riscos.
- Perfis: routine, peak, reorganization, intervention, support, emergency, reconfiguration e opening.
- Todos os 48 variants setoriais receberam `activityProfile`.

### Population
- `CharacterPopulationManager.settings()` passa pelo diretor.
- O diretor pode reduzir count/skinned/activeDistance.
- Nunca amplia a população além do orçamento do QualityManager.

### Ambient Activity
- `AmbientActivityManager.settings()` passa pelo diretor.
- Bindings recebem `channel`.
- Canais atuais: traffic, process, doors e lights.
- Fator por canal é aplicado sobre o fator de qualidade.

### Equipment Motion
- `EquipmentMotionController` aceita `activityDirector`.
- Motion mecânico usa `process`.
- Status lights usam `lights`.
- Perfil `intervention` zera processo, mas não precisa apagar indicadores.

### Oficina
- Esmerilhamento:
  - A routine
  - B peak
  - C reorganization
- Manutenção de máquina:
  - A/B/C intervention
- Motion mecânico de manutenção permanece desligado.

### Integrações
- Indústria principal integrada ao diretor.
- Porto/Pátio integrado.
- Porto/Doca integrado.
- Saúde/Apoio integrado.
- Saúde/Transporte integrado.
- Oficina integrada ao EquipmentMotion dirigido.

### Inspeções
- Badge `Atividade: ...` na interface.
- Sessões salvam `activityProfileId` e `activityProfileLabel`.
- Relatório HTML registra estado ambiental.
- Central TST exibe o estado ambiental da sessão.

### Performance
- Budgets G9.6 preservados; o diretor só reduz ou mantém contagem em relação ao limite de qualidade.
- Nenhum GLB novo.
- Total permanece em 125 GLBs.

## 0.26.0 — 08/08/2026

### Ambient Activity Manager
- Criado `js/graphics/ambient-activity-manager.js`.
- Novo plano adaptativo de atividade ambiental.
- Eco 0 / Médio 2 / Alto 4 / Ultra 6 atividades.
- Distâncias ativas: 0 / 28 / 38 / 48.
- Fatores de movimento: 0 / 0.55 / 1.0 / 1.15.

### Tipos de motion
- `path()`
- `oscillate()`
- `rotate()`
- `door()`
- `pulseLight()`

### Culling
- Atividade considera qualidade, prioridade, distância e `animations`.
- Objetos de fundo podem usar `hideWhenInactive`.
- Portas e elementos estruturais retornam à posição base ao desativar.
- Luzes operacionais zeram intensidade quando inativas.

### Rotas
- `path()` passa a usar o centro dos waypoints como âncora padrão.
- Evita congelamento permanente quando o objeto se desloca para fora da faixa da câmera.

### Integrações
- Indústria: empilhadeira de fundo, caixas em rota e luz operacional.
- Porto/Pátio: caminhão de fundo, trolley e luz.
- Porto/Doca: caminhão de fundo, porta vertical e luz.
- Saúde/Apoio: carrinho de fundo, porta dupla e luz.
- Saúde/Transporte: carrinho de fundo, porta dupla e luz.

### Assets
- Veículos/carrinhos ambientais reutilizam clones dos fallbacks procedurais.
- Nenhum segundo download do GLB é disparado para objetos de fundo.
- Nenhum GLB novo.
- Total permanece em 125 GLBs.

### Performance
- Budgets de Indústria, Porto e Saúde recalibrados.
- Eco permanece sem atividade ambiental.
- Population Manager e Auto Quality preservados.

## 0.25.0 — 08/08/2026

### Character Population Manager
- Criado `js/graphics/character-population.js`.
- População adaptativa por perfil gráfico.
- Contagem padrão: Eco 0 / Médio 2 / Alto 4 / Ultra 6.
- Limite de SkinnedMesh de fundo: Eco 0 / Médio 0 / Alto 2 / Ultra 3.
- Expansão incremental quando a qualidade aumenta.
- Redução instantânea de visibilidade/atividade quando a qualidade diminui.

### Culling
- Distância ativa por perfil.
- Personagens intermediários podem permanecer visíveis com animação pausada.
- Personagens distantes são ocultados.
- Distância de renderização deriva de `activeDistance + renderMargin`.

### Desempenho
- `AnimationMixer` e CharacterMotion de fundo são pausados fora da faixa ativa.
- Personagens escondidos não são renderizados.
- População mistura G2.1 e procedural.
- Nenhum GLB novo.
- Total permanece em 125 GLBs.

### Movimento
- `phase` individual por personagem.
- pequena variação determinística de velocidade.
- patrulha leve opcional por eixo.
- animações de fundo deixam de iniciar sincronizadas.

### Integrações
- Indústria recebeu população adaptativa.
- Porto / Pátio recebeu população adaptativa.
- Porto / Doca recebeu população adaptativa.
- Saúde / Apoio recebeu população adaptativa.
- Saúde / Transporte recebeu população adaptativa.
- Personagens principais do Porto foram migrados de CharacterRig direto para CharacterController.

### Quality Manager
Novos parâmetros:
- `populationCount`
- `skinnedPopulation`
- `populationActiveDistance`

### Budgets
- Contextos de Indústria, Porto e Saúde recalibrados para população.
- Eco não recebe custo adicional de população.

## 0.24.0 — 08/08/2026

### Character Pack G2.1
- Criado `assets/characters/g21/`.
- Worker/TST em LOD0 e LOD1.
- 4 GLBs novos.
- Rig continua `TST360HumanoidG2` com 17 joints.
- Geometria visual muda para `rounded-low-poly`.
- Cabeça, mãos, braços, antebraços, coxas, canelas, tronco e capacete recebem volumes arredondados.
- LOD0 usa malha mais simples.
- LOD1 usa mais segmentos/rings.
- Total de GLBs passa de 121 para 125.

### Fallback
- G2.1 passa a ser o pack padrão.
- Cadeia passa a ser:
  G2.1 → G2 → G1 → CharacterRig procedural.
- Registry passa a expor `geometryStyle`.
- `CharacterController.info()` passa a informar `geometryStyle`.

### Aparência
- Criado `js/graphics/character-appearance.js`.
- Criado `data/characters/appearances.json`.
- Materiais são clonados por personagem antes da customização.
- Perfis iniciais: standard, warm, deep e cool.
- Aparência é registrada em `CharacterController.info()`.

### Integração
- Indústria usa variação visual warm no trabalhador.
- Espaço Confinado usa padrão no TST.
- Oficina usa variação cool no TST.
- Escritório usa worker warm e TST standard.
- Saúde usa worker deep e TST cool.

### Performance
- Nenhuma textura externa adicionada.
- Budgets das cenas skinned recebem pequena margem adicional de triângulos.
- Eco continua sem carregar SkinnedMesh.
- Auto Quality preservado.

## 0.23.0 — 08/08/2026

### Character Pack G2
- Criado `assets/characters/g2/`.
- Worker e TST em LOD0/LOD1.
- 4 novos GLBs.
- Rig `TST360HumanoidG2`.
- Esqueleto ampliado de 7 para 17 joints.
- Novos joints de coluna, tórax, pescoço, antebraços, mãos, coxas, canelas e pés.
- 7 AnimationClips preservados: Idle, Walk, Inspect, Reach, Crouch, Seated e Climb.
- Clipes G2 utilizam mais joints e têm movimento mais articulado.

### Fallback em cadeia
- `character-pack-registry.js` passa a registrar G1 e G2.
- Pack padrão passa a ser G2.
- G2 declara `fallbackPack: g1`.
- `characterAsset()` retorna cadeia de candidates.
- CharacterController tenta G2, depois G1 e por fim CharacterRig procedural.
- Novo motivo `asset-pack-fallback`.
- Novo motivo `asset-chain-exhausted`.

### Migração adicional
- Escritório / postos: worker + TST usam CharacterController com G2.
- Escritório / emergência: worker + TST usam CharacterController com G2.
- Saúde / apoio hospitalar: worker + TST usam CharacterController com G2.
- Saúde / transporte interno: worker + TST usam CharacterController com G2.
- Indústria, Espaço Confinado e Oficina continuam utilizando o registry e passam automaticamente a solicitar G2.

### Performance
- Budgets Saúde/Escritório recalibrados para dois SkinnedMesh simultâneos.
- Budgets dos pilotos anteriores recebem pequena margem adicional para G2.
- Eco continua procedural.
- Total de GLBs passa de 117 para 121.

## 0.22.0 — 08/08/2026

### Character Pack G1
- Criado `assets/characters/g1/`.
- Adicionados `worker_lod0.glb` e `worker_lod1.glb`.
- Adicionados `tst_lod0.glb` e `tst_lod1.glb`.
- Os quatro arquivos são glTF 2.0 com `skin`, `JOINTS_0`, `WEIGHTS_0` e `inverseBindMatrices`.
- Rig `TST360HumanoidG1` com 7 joints.
- 7 AnimationClips embutidos: Idle, Walk, Inspect, Reach, Crouch, Seated e Climb.
- Biblioteca total passa de 113 para 117 GLBs.

### Registry de personagens
- Criado `data/characters/packs.json`.
- Criado `js/graphics/character-pack-registry.js`.
- Roles iniciais: `worker` e `tst`.
- Scenes deixam de hardcodar o caminho do manifest.

### CharacterController
- Passa a ler `clipAliases` do manifest do asset.
- Aliases aceitam string ou lista.
- Novo `fallbackReason`.
- Novos eventos `character:source` e `character:fallback`.
- GLB ganha sombra de contato própria.
- Sombra de contato acompanha deslocamento do root.
- Eco seleciona procedural por `skinnedCharacters:false`.

### Integrações piloto
- trabalhador da Indústria usa Character Pack `worker`;
- atendente do Espaço Confinado usa Character Pack `tst`;
- TST das duas cenas de Oficina usa Character Pack `tst`;
- outros personagens continuam procedurais.

### Qualidade
- `QUALITY_PROFILES` ganha `skinnedCharacters`.
- Eco: false.
- Médio/Alto/Ultra: true.
- LOD0 em Médio e LOD1 em Alto/Ultra via manifest.

### Performance
- Budgets das cenas piloto recebem margem adicional para primitives do SkinnedMesh.
- Pack não possui texturas externas.
- GLBs de personagem permanecem pequenos.

## 0.21.0 — 08/08/2026

### Character Controller unificado
- Criado `js/graphics/character-controller.js`.
- Controller abstrai personagem procedural e futuro GLB animado.
- Estados: idle, walk, inspect, reach, crouch, seated e climb.
- Aliases de nomes de AnimationClip.
- Fallback automático para idle.
- Fallback automático de GLB para CharacterRig procedural.
- `animations:false` no Eco congela animação sem quebrar a postura.

### AssetManager animado
- Adicionado `acquireAnimated()`.
- Adicionado `acquireAnimatedFromPack()`.
- AnimationClips do GLTF ficam disponíveis ao controller.
- SkeletonUtils continua responsável por clones seguros de rigs.
- Release/ref-count continua centralizado no AssetManager.

### Equipment Motion
- Criado `js/graphics/equipment-motion.js`.
- Recursos: rotate, vibrate, oscillate e statusLight.
- Motion lê a qualidade atual a cada frame.
- Eco desativa motion contextual.
- Médio executa motion reduzido.
- Alto/Ultra liberam motion completo.

### Integrações
- Indústria migrou trabalhador e operador para CharacterController.
- Espaço Confinado G5 migrou o atendente para CharacterController.
- Oficina migrou todos os personagens das duas missões.
- Indústria recebeu indicadores contextuais e vibração leve em Alto/Ultra.
- Corte/esmerilhamento recebeu motion sutil.
- Preparação para manutenção mantém máquina estática e usa somente indicador de estado.

### Performance
- Budgets G9 recalibrados para contact shadows.
- Indústria e Oficina recebem margem específica para status meshes.
- Nenhum GLB novo.
- Total permanece em 113 GLBs.

## 0.20.0 — 08/08/2026

### G9.0 — Realismo adaptativo
- Criado `material-library.js`.
- Criado `realism-manager.js`.
- `ThreeViewport` passa a ativar a camada de realismo automaticamente.
- Pisos procedurais recebem microtextura em Alto/Ultra.
- Materiais recebem anisotropia e ajustes adaptativos.
- Tone mapping ACES passa a existir também nas cenas sem preset de EnvironmentManager.

### Iluminação e sombras
- Shadow map adaptativo: 512 / 1024 / 1536 / 2048.
- `normalBias`, `radius` e bounds direcionais refinados.
- Fill/rim lights passam a variar conforme o perfil.
- Rim light é desativada no Eco.
- Exposição continua adaptativa por ambiente.

### Personagens
- CharacterRig recebe sombra de contato.
- Sombra de contato some no Eco.
- Novo micro movimento de respiração e olhar em `idle`/`inspect`.
- Detalhes secundários e cast/receive shadow respondem à qualidade.
- Base permanece procedimental; SkinnedMesh/GLB humano profissional continua como etapa futura.

### Efeitos
- `EffectsManager` passa a reagir à qualidade em tempo real.
- Smoke/Sparks usam capacidade máxima + `drawRange`.
- RoutePulse altera quantidade visível sem reconstruir a cena.
- Beacon reduz iluminação no Eco.
- Corrigida a limitação de efeitos criados com a qualidade inicial da cena.

### Performance
- Perfis de qualidade recebem propriedades explícitas de realismo.
- Budgets Alto/Ultra recebem pequena margem adicional de texturas para mapas procedurais.
- Nenhum GLB novo foi necessário.
- Biblioteca permanece com 113 GLBs.

## 0.19.0 — 07/08/2026

### 8/8 setores profissionais em 3D
- Construção recebeu 3D por reutilização do Canteiro 360.
- Indústria recebeu 3D por reutilização do laboratório Indústria.
- Obras Elétricas recebeu 3D por reutilização do laboratório Eletricidade.
- Todos os 8 setores profissionais agora possuem `2D leve + 3D`.

### Adapters semânticos
- Criado `js/sectors/sector-lab-scene-adapters.js`.
- Traduz IDs de riscos setoriais para IDs internos das cenas reutilizadas.
- Traduz `found`.
- Traduz `activeRiskIds`.
- Traduz `markerOffsets3d`.
- Traduz picking 3D de volta para o ID setorial.
- Mantém RiskEngine, evidências, sessões e relatórios usando o contrato da missão profissional.

### Registry
- `sector-3d-registry.js` passa a conter os oito setores.
- Construção, Indústria e Obras Elétricas mudam de `planned` para `active`.
- Registry informa também a origem do renderer: nativo ou adapter.
- CampusHub passa automaticamente a considerar 8 setores 3D.

### Performance
- Adicionados budgets setoriais para as seis missões que reutilizam cenas principais.
- Perfis são derivados dos budgets dos respectivos laboratórios de origem.

### Assets
- Nenhum GLB novo foi necessário.
- Total permanece em 113 GLBs.
- A expansão 5/8 → 8/8 foi feita principalmente por reutilização de arquitetura e assets existentes.
