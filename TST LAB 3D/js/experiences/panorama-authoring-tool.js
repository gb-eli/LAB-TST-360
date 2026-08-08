import {PanoramaGraphLoader} from './panorama-graph-loader.js';
import {
  PANORAMA_AUTHORING_TIERS,
  validateEquirectangularDimensions,
  startOffsetToHeading,
  imagePointFromHotspot,
  hotspotWithImagePoint,
  createAuthoringHotspot,
  normalizeHotspotAction,
  actionTypeForHotspot,
  buildPanoramaNodeExport,
  sanitizePanoramaId
} from './panorama-authoring-model.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

function jsonBlob(value){
  return new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'});
}

async function blobToImageBitmap(blob){
  if('createImageBitmap' in window)return createImageBitmap(blob);
  return new Promise((resolve,reject)=>{
    const img=new Image();
    const url=URL.createObjectURL(blob);
    img.onload=()=>{
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror=error=>{
      URL.revokeObjectURL(url);
      reject(error);
    };
    img.src=url;
  });
}

async function canvasToBlob(canvas,type,quality){
  return new Promise((resolve,reject)=>{
    canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Falha ao gerar imagem.')),type,quality);
  });
}

export class PanoramaAuthoringTool{
  constructor(context,{sectorData,experience,onClose=null}={}){
    this.context=context;
    this.sectorData=sectorData;
    this.experience=experience;
    this.onClose=onClose;
    this.root=null;
    this.loader=null;
    this.graph=null;
    this.node=null;
    this.hotspots=[];
    this.selectedIndex=-1;
    this.localFile=null;
    this.localUrl=null;
    this.imageSourceUrl=null;
    this.imageMeta=null;
    this.previewRuntime=null;
    this.listener=null;
    this.inputListener=null;
    this.mode='flat';
  }

  async mount(root){
    this.root=root;
    this.loader=new PanoramaGraphLoader(this.context.assets,this.experience.graph);
    this.graph=await this.loader.graph();
    this.listener=event=>this.handleClick(event);
    this.inputListener=event=>this.handleInput(event);
    root.addEventListener('click',this.listener);
    root.addEventListener('input',this.inputListener);
    root.addEventListener('change',this.inputListener);
    this.renderShell();
    await this.loadNode(this.graph.defaultNode??this.graph.nodes?.[0]?.id);
    return this;
  }

  renderShell(){
    this.root.innerHTML=`<section class="panorama-authoring">
      <header class="authoring-head">
        <div>
          <p class="kicker">G10.1 • autoria local</p>
          <h2>Calibrar panorama 360 — ${esc(this.sectorData.label)}</h2>
          <p>Importe uma imagem equiretangular 2:1, clique na imagem para posicionar hotspots, teste em 360 e exporte o JSON + WebP. Nada é enviado para servidor.</p>
        </div>
        <button type="button" data-authoring-close>← Voltar à biblioteca</button>
      </header>

      <div class="authoring-safety-note">
        <strong>Privacidade e publicação</strong>
        <span>Antes de publicar fotografia real, revise rostos, placas, documentos, telas, crachás e qualquer dado visível. A ferramenta trabalha localmente no navegador.</span>
      </div>

      <div class="authoring-toolbar">
        <label>
          <span>Ponto de observação</span>
          <select data-authoring-node></select>
        </label>
        <label class="authoring-file">
          <span>Imagem equiretangular</span>
          <input type="file" accept="image/*" data-authoring-file>
        </label>
        <label>
          <span>Orientação inicial</span>
          <div class="authoring-inline">
            <input type="range" min="0" max="359" step="1" data-authoring-heading>
            <output data-authoring-heading-label>0°</output>
          </div>
        </label>
        <div class="authoring-view-toggle">
          <button type="button" data-authoring-flat class="active">Imagem plana</button>
          <button type="button" data-authoring-preview>Prévia 360</button>
          <button type="button" data-authoring-add-view title="Na prévia 360, adiciona um hotspot no centro da visão">+ Ponto na visão</button>
        </div>
      </div>

      <div class="authoring-meta" data-authoring-meta></div>

      <div class="authoring-layout">
        <div class="authoring-stage">
          <div class="authoring-flat" data-authoring-flat-host>
            <div class="authoring-image-wrap" data-authoring-image-wrap>
              <img alt="Imagem equiretangular para calibração" data-authoring-image>
              <div class="authoring-markers" data-authoring-markers></div>
              <div class="authoring-empty" data-authoring-empty>
                <strong>Carregando panorama atual…</strong>
                <span>Você também pode importar uma foto 360 local.</span>
              </div>
            </div>
          </div>
          <div class="authoring-preview" data-authoring-preview-host hidden>
            <div class="three-loading"><span class="spinner"></span><strong>Prévia 360</strong><small>Duplo clique/toque para criar um hotspot no ponto observado.</small></div>
          </div>
        </div>

        <aside class="authoring-side">
          <section class="authoring-panel">
            <div class="authoring-panel-head">
              <div><strong>Hotspots</strong><small data-authoring-count>0 pontos</small></div>
              <button type="button" data-authoring-add-center>+ Centro</button>
            </div>
            <div class="authoring-hotspot-list" data-authoring-list></div>
          </section>

          <section class="authoring-panel" data-authoring-editor>
            <div class="authoring-empty-editor">
              <strong>Selecione um hotspot.</strong>
              <span>Ou clique diretamente na imagem para adicionar um novo ponto.</span>
            </div>
          </section>

          <section class="authoring-panel authoring-export-panel">
            <strong>Exportar</strong>
            <p>Os arquivos são preparados localmente para você colocar depois na pasta do projeto.</p>
            <label>
              <span>Pasta/arquivo base no projeto</span>
              <input type="text" data-authoring-source-base>
            </label>
            <div class="authoring-export-actions">
              <button type="button" data-authoring-export-json>Baixar node JSON</button>
              <button type="button" data-authoring-export-tiers>Gerar 3 WebP</button>
            </div>
            <small>Medium 1024×512 • High 1600×800 • Ultra 2400×1200.</small>
          </section>

          <section class="authoring-panel authoring-checklist">
            <strong>Checklist pré-publicação</strong>
            <label><input type="checkbox"> rostos revisados/desfocados</label>
            <label><input type="checkbox"> placas e documentos revisados</label>
            <label><input type="checkbox"> direitos/autorização da imagem confirmados</label>
            <label><input type="checkbox"> hotspots conferidos na prévia 360</label>
          </section>
        </aside>
      </div>
    </section>`;

    const select=this.root.querySelector('[data-authoring-node]');
    select.innerHTML=(this.graph.nodes??[]).map(n=>`<option value="${esc(n.id)}">${esc(n.title)}</option>`).join('');
  }

  async loadNode(nodeId){
    this.disposePreview();
    this.node=structuredClone(await this.loader.node(nodeId));
    this.hotspots=structuredClone(this.node.hotspots??[]);
    this.selectedIndex=this.hotspots.length?0:-1;
    this.root.querySelector('[data-authoring-node]').value=nodeId;
    const heading=Math.round(startOffsetToHeading(this.node.startOffset??0));
    const range=this.root.querySelector('[data-authoring-heading]');
    range.value=String(heading);
    this.root.querySelector('[data-authoring-heading-label]').textContent=`${heading}°`;

    const base=`assets/panoramas/custom/${sanitizePanoramaId(this.sectorData.sectorId)}/${sanitizePanoramaId(this.node.id)}`;
    this.root.querySelector('[data-authoring-source-base]').value=base;

    this.releaseLocalFile();
    this.imageSourceUrl=this.pickCurrentImageSource();
    await this.inspectSource(this.imageSourceUrl);
    this.renderAll();
    await this.showFlat();
  }

  pickCurrentImageSource(){
    const image=this.node.image360;
    return image?.tiers?.high?.src
      ??image?.tiers?.medium?.src
      ??image?.tiers?.ultra?.src
      ??'';
  }

  async inspectSource(src){
    const img=this.root.querySelector('[data-authoring-image]');
    const empty=this.root.querySelector('[data-authoring-empty]');
    if(!src){
      img.removeAttribute('src');
      empty.hidden=false;
      this.imageMeta=null;
      return;
    }
    await new Promise((resolve,reject)=>{
      img.onload=()=>resolve();
      img.onerror=reject;
      img.src=src;
    }).catch(error=>{
      console.warn('[TST360 Authoring] Imagem atual indisponível',error);
    });
    if(img.naturalWidth&&img.naturalHeight){
      this.imageMeta=validateEquirectangularDimensions(img.naturalWidth,img.naturalHeight);
      empty.hidden=true;
    }else{
      this.imageMeta=null;
      empty.hidden=false;
    }
  }

  renderAll(){
    this.renderMeta();
    this.renderMarkers();
    this.renderList();
    this.renderEditor();
  }

  renderMeta(){
    const meta=this.root.querySelector('[data-authoring-meta]');
    const source=this.localFile?`arquivo local: ${this.localFile.name}`:(this.imageSourceUrl?'imagem atual da plataforma':'sem imagem');
    const ratio=this.imageMeta
      ?`${this.imageMeta.width}×${this.imageMeta.height} • proporção ${this.imageMeta.ratio.toFixed(3)} ${this.imageMeta.valid?'✓ 2:1':'⚠ fora de 2:1'}`
      :'dimensões não disponíveis';
    meta.innerHTML=`<span><strong>Fonte:</strong> ${esc(source)}</span><span><strong>Imagem:</strong> ${esc(ratio)}</span><span><strong>Hotspots:</strong> ${this.hotspots.length}</span><span><strong>Node:</strong> ${esc(this.node?.id??'')}</span>`;
  }

  renderMarkers(){
    const host=this.root.querySelector('[data-authoring-markers]');
    host.innerHTML=this.hotspots.map((h,i)=>{
      const p=imagePointFromHotspot(h,this.node?.image360);
      const category=h.category??'note';
      return `<button type="button" class="authoring-marker ${i===this.selectedIndex?'selected':''}" data-category="${esc(category)}" data-authoring-marker="${i}" style="left:${p.x}%;top:${p.y}%" title="${esc(h.label)}"><span>${i+1}</span></button>`;
    }).join('');
    const count=this.root.querySelector('[data-authoring-count]');
    count.textContent=`${this.hotspots.length} ponto(s)`;
  }

  renderList(){
    const list=this.root.querySelector('[data-authoring-list]');
    if(!this.hotspots.length){
      list.innerHTML=`<div class="authoring-list-empty">Clique na imagem para criar o primeiro hotspot.</div>`;
      return;
    }
    list.innerHTML=this.hotspots.map((h,i)=>`
      <button type="button" data-authoring-select="${i}" class="${i===this.selectedIndex?'active':''}">
        <b>${i+1}</b>
        <span><strong>${esc(h.label)}</strong><small>${esc(h.category??'note')}</small></span>
      </button>`).join('');
  }

  renderEditor(){
    const editor=this.root.querySelector('[data-authoring-editor]');
    const h=this.hotspots[this.selectedIndex];
    if(!h){
      editor.innerHTML=`<div class="authoring-empty-editor"><strong>Selecione um hotspot.</strong><span>Ou clique diretamente na imagem para adicionar um novo ponto.</span></div>`;
      return;
    }
    const point=imagePointFromHotspot(h,this.node?.image360);
    const objectExp=this.sectorData.experiences.find(e=>e.type==='object3d');
    const missionExp=this.sectorData.experiences.find(e=>e.type==='mission3d');
    const actionType=actionTypeForHotspot(h,{objectId:objectExp?.id,missionId:missionExp?.id});
    const targets={
      node:(this.graph.nodes??[]).filter(n=>n.id!==this.node.id).map(n=>({id:n.id,label:n.title})),
      object:objectExp?[{id:objectExp.id,label:objectExp.title}]:[],
      mission:missionExp?[{id:missionExp.id,label:missionExp.title}]:[]
    };
    const targetOptions=(targets[actionType]??[]).map(t=>`<option value="${esc(t.id)}" ${h.action?.nodeId===t.id||h.action?.experienceId===t.id?'selected':''}>${esc(t.label)}</option>`).join('');

    editor.innerHTML=`
      <div class="authoring-editor-head">
        <div><strong>Hotspot ${this.selectedIndex+1}</strong><small>x ${point.x.toFixed(1)}% • y ${point.y.toFixed(1)}%</small></div>
        <button type="button" data-authoring-delete>Excluir</button>
      </div>
      <label><span>Título</span><input data-hotspot-field="label" value="${esc(h.label)}"></label>
      <label><span>Explicação</span><textarea data-hotspot-field="note">${esc(h.note)}</textarea></label>
      <label><span>Categoria visual</span>
        <select data-hotspot-field="category">
          ${['note','structure','flow','object','mission','node'].map(x=>`<option value="${x}" ${h.category===x?'selected':''}>${x}</option>`).join('')}
        </select>
      </label>
      <label><span>Ação</span>
        <select data-authoring-action-type>
          <option value="note" ${actionType==='note'?'selected':''}>Somente nota</option>
          <option value="node" ${actionType==='node'?'selected':''}>Mudar ponto de observação</option>
          <option value="object" ${actionType==='object'?'selected':''}>Abrir objeto 3D</option>
          <option value="mission" ${actionType==='mission'?'selected':''}>Abrir missão 3D</option>
        </select>
      </label>
      ${actionType!=='note'?`<label><span>Destino</span><select data-authoring-action-target>${targetOptions}</select></label>`:''}
      <div class="authoring-coordinate-grid">
        <label><span>X imagem (%)</span><input type="number" min="0" max="100" step=".1" data-hotspot-coordinate="x" value="${point.x.toFixed(1)}"></label>
        <label><span>Y imagem (%)</span><input type="number" min="0" max="100" step=".1" data-hotspot-coordinate="y" value="${point.y.toFixed(1)}"></label>
      </div>
    `;
  }

  async importFile(file){
    if(!file)return;
    this.disposePreview();
    this.releaseLocalFile();
    this.localFile=file;
    this.localUrl=URL.createObjectURL(file);
    this.imageSourceUrl=this.localUrl;
    await this.inspectSource(this.localUrl);
    this.renderAll();
    if(this.imageMeta&&!this.imageMeta.valid){
      this.root.querySelector('[data-authoring-meta]').insertAdjacentHTML(
        'beforeend',
        `<span class="warn"><strong>Atenção:</strong> a imagem não está próxima de 2:1.</span>`
      );
    }
  }

  addHotspot(point){
    const h=createAuthoringHotspot(point,this.hotspots.length);
    this.hotspots.push(h);
    this.selectedIndex=this.hotspots.length-1;
    this.renderAll();
  }

  updateSelectedPoint(point){
    const h=this.hotspots[this.selectedIndex];
    if(!h)return;
    this.hotspots[this.selectedIndex]=hotspotWithImagePoint(h,point,{preserveLegacy:true});
    this.renderMarkers();
    this.renderList();
    this.renderEditor();
  }

  updateAction(type,target=null){
    const h=this.hotspots[this.selectedIndex];
    if(!h)return;
    this.hotspots[this.selectedIndex]=normalizeHotspotAction(h,{actionType:type,target});
    this.renderAll();
  }

  async showFlat(){
    this.mode='flat';
    this.disposePreview();
    this.root.querySelector('[data-authoring-flat-host]').hidden=false;
    this.root.querySelector('[data-authoring-preview-host]').hidden=true;
    this.root.querySelector('[data-authoring-flat]').classList.add('active');
    this.root.querySelector('[data-authoring-preview]').classList.remove('active');
  }

  async showPreview(){
    this.mode='preview';
    this.root.querySelector('[data-authoring-flat-host]').hidden=true;
    const host=this.root.querySelector('[data-authoring-preview-host]');
    host.hidden=false;
    this.root.querySelector('[data-authoring-flat]').classList.remove('active');
    this.root.querySelector('[data-authoring-preview]').classList.add('active');
    this.disposePreview();

    if(!this.imageSourceUrl){
      host.innerHTML=`<div class="feedback warn"><strong>Importe ou selecione uma imagem.</strong><span>A prévia 360 precisa de uma imagem equiretangular.</span></div>`;
      return;
    }

    try{
      const {EquirectangularPanoramaRuntime}=await import('./equirectangular-panorama-runtime.js');
      const previewNode=structuredClone(this.node);
      previewNode.hotspots=this.hotspots.map(h=>{
        const point=imagePointFromHotspot(h,this.node?.image360);
        return{...structuredClone(h),imageX:point.x,imageY:point.y};
      });
      previewNode.image360={
        projection:'equirectangular',
        sourceType:'local-preview',
        tiers:{
          medium:{src:this.imageSourceUrl},
          high:{src:this.imageSourceUrl},
          ultra:{src:this.imageSourceUrl}
        },
        fallback:'procedural-svg-360-graph'
      };
      const authoringQuality={
        level:'medium',
        settings:{
          ...this.context.qualityManager.settings,
          pixelRatioCap:Math.min(1.25,this.context.qualityManager.settings.pixelRatioCap??1.25),
          panoramaImage360:true,
          panoramaImageTier:'medium'
        }
      };
      const previewContext={
        ...this.context,
        qualityManager:authoringQuality,
        events:{on(){return()=>{}},emit:(...args)=>this.context.events?.emit?.(...args)}
      };
      host.replaceChildren();
      this.previewRuntime=new EquirectangularPanoramaRuntime(host,previewContext,previewNode,{
        onHotspot:(item)=>{
          const index=this.hotspots.findIndex(h=>h.id===item.id);
          if(index>=0){
            this.selectedIndex=index;
            this.renderList();
            this.renderEditor();
          }
        },
        onCreatePoint:(point)=>{
          this.addHotspot(point);
          this.showPreview();
        }
      });
      await this.previewRuntime.mount();
    }catch(error){
      console.error('[TST360 Authoring Preview]',error);
      host.innerHTML=`<div class="feedback warn"><strong>Prévia WebGL indisponível.</strong><span>Você ainda pode calibrar pela imagem plana e exportar normalmente.</span></div>`;
    }
  }

  currentHeading(){
    return clamp(this.root.querySelector('[data-authoring-heading]').value,0,359);
  }

  buildExport(){
    const sourceBase=this.root.querySelector('[data-authoring-source-base]').value.trim();
    return buildPanoramaNodeExport({
      node:this.node,
      sectorId:this.sectorData.sectorId,
      sourceBase,
      hotspots:this.hotspots,
      startHeading:this.currentHeading(),
      sourceType:'external-photo'
    });
  }

  exportJson(){
    const output=this.buildExport();
    downloadBlob(jsonBlob(output),`${sanitizePanoramaId(this.node.id)}.json`);
  }

  async sourceBlob(){
    if(this.localFile)return this.localFile;
    if(!this.imageSourceUrl)throw new Error('Nenhuma imagem disponível.');
    const response=await fetch(this.imageSourceUrl);
    if(!response.ok)throw new Error(`Imagem indisponível (${response.status}).`);
    return response.blob();
  }

  async exportTiers(){
    const button=this.root.querySelector('[data-authoring-export-tiers]');
    const old=button.textContent;
    button.disabled=true;
    button.textContent='Gerando…';
    try{
      const blob=await this.sourceBlob();
      const validation=this.imageMeta;
      if(!validation?.valid){
        const proceed=confirm('A imagem não está próxima da proporção 2:1. Gerar tiers mesmo assim?');
        if(!proceed)return;
      }
      const bitmap=await blobToImageBitmap(blob);
      const base=sanitizePanoramaId(this.node.id);
      for(const [tier,spec] of Object.entries(PANORAMA_AUTHORING_TIERS)){
        const canvas=document.createElement('canvas');
        canvas.width=spec.width;
        canvas.height=spec.height;
        const ctx=canvas.getContext('2d',{alpha:false});
        ctx.imageSmoothingEnabled=true;
        ctx.imageSmoothingQuality='high';
        ctx.drawImage(bitmap,0,0,spec.width,spec.height);
        const out=await canvasToBlob(canvas,'image/webp',spec.quality);
        downloadBlob(out,`${base}_${tier}.webp`);
      }
      bitmap.close?.();
    }catch(error){
      console.error('[TST360 Authoring Export]',error);
      alert('Não foi possível gerar os WebP. A imagem original continua intacta.');
    }finally{
      button.disabled=false;
      button.textContent=old;
    }
  }

  handleClick(event){
    if(event.target.closest('[data-authoring-close]')){
      this.unmount().then(()=>this.onClose?.());
      return;
    }
    if(event.target.closest('[data-authoring-flat]')){
      void this.showFlat();return;
    }
    if(event.target.closest('[data-authoring-preview]')){
      void this.showPreview();return;
    }
    const marker=event.target.closest('[data-authoring-marker]');
    if(marker){
      this.selectedIndex=Number(marker.dataset.authoringMarker);
      this.renderAll();
      return;
    }
    const item=event.target.closest('[data-authoring-select]');
    if(item){
      this.selectedIndex=Number(item.dataset.authoringSelect);
      this.renderAll();
      return;
    }
    if(event.target.closest('[data-authoring-add-center]')){
      this.addHotspot({x:50,y:50});return;
    }
    if(event.target.closest('[data-authoring-add-view]')){
      if(this.previewRuntime){
        const point=this.previewRuntime.currentImagePoint();
        this.addHotspot(point);
        void this.showPreview();
      }
      return;
    }
    if(event.target.closest('[data-authoring-delete]')){
      if(this.selectedIndex>=0){
        this.hotspots.splice(this.selectedIndex,1);
        this.selectedIndex=Math.min(this.selectedIndex,this.hotspots.length-1);
        this.renderAll();
      }
      return;
    }
    if(event.target.closest('[data-authoring-export-json]')){
      this.exportJson();return;
    }
    if(event.target.closest('[data-authoring-export-tiers]')){
      void this.exportTiers();return;
    }

    const wrap=event.target.closest('[data-authoring-image-wrap]');
    if(wrap&&!event.target.closest('.authoring-marker')){
      const rect=wrap.getBoundingClientRect();
      const x=clamp((event.clientX-rect.left)/Math.max(1,rect.width)*100,0,100);
      const y=clamp((event.clientY-rect.top)/Math.max(1,rect.height)*100,0,100);
      this.addHotspot({x,y});
    }
  }

  handleInput(event){
    if(event.target.matches('[data-authoring-node]')){
      void this.loadNode(event.target.value);
      return;
    }
    if(event.target.matches('[data-authoring-file]')){
      void this.importFile(event.target.files?.[0]);
      return;
    }
    if(event.target.matches('[data-authoring-heading]')){
      this.root.querySelector('[data-authoring-heading-label]').textContent=`${event.target.value}°`;
      return;
    }
    const field=event.target.dataset.hotspotField;
    if(field&&this.hotspots[this.selectedIndex]){
      this.hotspots[this.selectedIndex][field]=event.target.value;
      this.renderMarkers();
      this.renderList();
      return;
    }
    const coord=event.target.dataset.hotspotCoordinate;
    if(coord&&this.hotspots[this.selectedIndex]){
      const current=imagePointFromHotspot(this.hotspots[this.selectedIndex],this.node?.image360);
      current[coord]=clamp(event.target.value,0,100);
      this.updateSelectedPoint(current);
      return;
    }
    if(event.target.matches('[data-authoring-action-type]')){
      const type=event.target.value;
      let target=null;
      const objectExp=this.sectorData.experiences.find(e=>e.type==='object3d');
      const missionExp=this.sectorData.experiences.find(e=>e.type==='mission3d');
      if(type==='node')target=this.graph.nodes.find(n=>n.id!==this.node.id)?.id??'';
      if(type==='object')target=objectExp?.id??'';
      if(type==='mission')target=missionExp?.id??'';
      this.updateAction(type,target);
      return;
    }
    if(event.target.matches('[data-authoring-action-target]')){
      const h=this.hotspots[this.selectedIndex];
      if(!h)return;
      const objectExp=this.sectorData.experiences.find(e=>e.type==='object3d');
      const missionExp=this.sectorData.experiences.find(e=>e.type==='mission3d');
      const type=actionTypeForHotspot(h,{objectId:objectExp?.id,missionId:missionExp?.id});
      this.updateAction(type,event.target.value);
    }
  }

  disposePreview(){
    this.previewRuntime?.dispose?.();
    this.previewRuntime=null;
  }

  releaseLocalFile(){
    if(this.localUrl)URL.revokeObjectURL(this.localUrl);
    this.localUrl=null;
    this.localFile=null;
  }

  async unmount(){
    this.disposePreview();
    this.releaseLocalFile();
    if(this.listener)this.root?.removeEventListener('click',this.listener);
    if(this.inputListener){
      this.root?.removeEventListener('input',this.inputListener);
      this.root?.removeEventListener('change',this.inputListener);
    }
    this.listener=null;
    this.inputListener=null;
    this.root?.replaceChildren();
  }
}
