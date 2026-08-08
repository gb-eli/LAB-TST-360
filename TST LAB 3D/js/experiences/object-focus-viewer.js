import {ThreeViewport} from '../graphics/three-runtime.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function themePreset(theme='construction'){
  const map={
    construction:'outdoor',
    industry:'industrial',
    'porto-logistica':'industrial',
    port:'industrial',
    health:'emergency',
    office:'office',
    warehouse:'confined',
    workshop:'industrial',
    electrical:'electrical',
    'obras-eletricas':'electrical'
  };
  return map[theme]??'neutral';
}

export class ObjectFocusViewer{
  constructor(host,context,experience){
    this.host=host;
    this.context=context;
    this.experience=experience;
    this.viewport=null;
    this.asset=null;
    this.holder=null;
    this.autoRotate=true;
    this.listener=null;
    this.offQuality=null;
    this.lightMode='sector';
    this.gridVisible=true;
    this.gridHelper=null;
    this.floorHalo=null;
  }

  async mount(){
    this.host.innerHTML=`<section class="object-focus object-focus-pro">
      <div class="object-focus-toolbar">
        <div><strong>${esc(this.experience.title)}</strong><small>Arraste para girar • pinça/roda para aproximar • mesma ferramenta para apresentação ou exploração individual</small></div>
        <div class="object-focus-actions">
          <button type="button" data-object-rotate>Rotação automática: ligada</button>
          <button type="button" data-object-light>Iluminação: setorial</button>
          <button type="button" data-object-grid>Grade: ligada</button>
          <button type="button" data-object-reset>Reenquadrar</button>
          <button type="button" data-object-capture>Capturar imagem</button>
        </div>
      </div>
      <div class="object-focus-layout">
        <div class="object-focus-stage-card">
          <div class="object-focus-host" data-object-host><div class="three-loading"><span class="spinner"></span><strong>Carregando objeto 3D…</strong><small>Somente este asset será solicitado.</small></div></div>
          <div class="object-focus-hud" data-object-hud></div>
        </div>
        <aside class="object-focus-callouts">
          <div class="object-focus-side-head">
            <strong>Leitura visual guiada</strong>
            <span>Experiência gráfica aprimorada</span>
          </div>
          <p>${esc(this.experience.description)}</p>
          <strong>Pontos para observar</strong>
          <ol>${(this.experience.callouts??[]).map(item=>`<li>${esc(item)}</li>`).join('')}</ol>
          <div class="object-focus-audit-grid">
            <article><b>Palco</b><span>base, halo, grade e iluminação temática</span></article>
            <article><b>Perfil</b><span>qualidade adaptativa respeitando Eco/Médio/Alto/Ultra</span></article>
            <article><b>Uso</b><span>feito para explicação em aula e exploração individual</span></article>
          </div>
          <small>Visualização educacional. Dimensões, capacidades e detalhes não devem ser usados como referência técnica de campo.</small>
        </aside>
      </div>
    </section>`;

    const viewHost=this.host.querySelector('[data-object-host]');
    try{
      this.viewport=new ThreeViewport(viewHost,this.context,{
        background:0x09131b,
        fog:false,
        environmentPreset:themePreset(this.experience.theme),
        visualProfile:this.experience.theme,
        dressingScale:.55,
        contextProps:false,
        scenicProps:false,
        atmosphere:false,
        cameraPosition:[4.2,2.8,5.0],
        target:[0,1.1,0],
        minDistance:1.4,
        maxDistance:8,
        enablePan:false,
        captureEnabled:true,
        ariaLabel:`${this.experience.title} — objeto 3D orbitável`
      });
      await this.viewport.init();
      this.buildStage();
      await this.loadObject();
      this.viewport.controls.autoRotate=true;
      this.viewport.controls.autoRotateSpeed=.85;
      this.applyLightingMode();
      this.applyGridMode();
      this.refreshHud();
      this.offQuality=this.context.events?.on?.('quality:changed',()=>this.refreshHud())??null;
      this.context.events?.emit?.('environment:object-opened',{
        title:this.experience.title,
        pack:this.experience.pack,
        assetId:this.experience.id
      });
    }catch(error){
      console.error('[TST360 ObjectFocus]',error);
      viewHost.innerHTML=`<div class="feedback warn"><strong>Objeto 3D indisponível.</strong><span>O restante da biblioteca visual continua funcionando.</span></div>`;
    }

    this.listener=event=>this.handle(event);
    this.host.addEventListener('click',this.listener);
    return this;
  }

  buildStage(){
    const T=this.viewport.runtime.THREE;
    const floor=new T.Mesh(
      new T.CircleGeometry(3.85,54),
      new T.MeshStandardMaterial({color:0x25333c,roughness:.9,metalness:.05})
    );
    floor.rotation.x=-Math.PI/2;
    floor.receiveShadow=true;
    this.viewport.scene.add(floor);

    const base=new T.Mesh(
      new T.CylinderGeometry(1.68,1.84,.2,48),
      new T.MeshStandardMaterial({color:0x121d26,roughness:.55,metalness:.18})
    );
    base.position.y=.1;
    base.receiveShadow=true;
    this.viewport.scene.add(base);

    const ring=new T.Mesh(
      new T.RingGeometry(2.55,2.78,72),
      new T.MeshStandardMaterial({color:0x4d8093,emissive:0x173645,emissiveIntensity:.42,roughness:.52})
    );
    ring.rotation.x=-Math.PI/2;
    ring.position.y=.014;
    this.floorHalo=ring;
    this.viewport.scene.add(ring);

    this.gridHelper=new T.GridHelper(5.6,22,0x457186,0x223746);
    this.gridHelper.position.y=.016;
    const gridMaterials=Array.isArray(this.gridHelper.material)?this.gridHelper.material:[this.gridHelper.material];
    for(const mat of gridMaterials){
      mat.transparent=true;
      mat.opacity=.38;
    }
    this.viewport.scene.add(this.gridHelper);

    const backdrop=new T.Mesh(
      new T.PlaneGeometry(6.4,4.6),
      new T.MeshBasicMaterial({color:0x173242,transparent:true,opacity:.28})
    );
    backdrop.position.set(0,2.05,-2.55);
    this.viewport.scene.add(backdrop);

    this.holder=new T.Group();
    this.viewport.scene.add(this.holder);

    this.viewport.addAnimator(({elapsed})=>{
      if(this.floorHalo)this.floorHalo.rotation.z=elapsed*.12;
      if(this.gridHelper){
        const gridMaterials=Array.isArray(this.gridHelper.material)?this.gridHelper.material:[this.gridHelper.material];
        for(const mat of gridMaterials)mat.opacity=.34+.06*Math.sin(elapsed*.9);
      }
    });
  }

  async loadObject(){
    const T=this.viewport.runtime.THREE;
    const quality=this.context.qualityManager.level;
    const object=await this.context.assetManager.acquireFromPack(
      this.experience.pack,
      this.experience.id,
      quality
    );
    this.asset=object;
    this.holder.add(object);

    let box=new T.Box3().setFromObject(object);
    const size=new T.Vector3();box.getSize(size);
    const maxDim=Math.max(size.x,size.y,size.z,.001);
    const target=2.65;
    object.scale.multiplyScalar(target/maxDim);

    box=new T.Box3().setFromObject(object);
    const center=new T.Vector3();box.getCenter(center);
    object.position.x-=center.x;
    object.position.z-=center.z;
    object.position.y-=box.min.y;

    const targetY=Math.min(1.4,Math.max(.65,(box.max.y-box.min.y)*.45));
    this.viewport.controls.target.set(0,targetY,0);
    this.viewport.controls.update();
    this.refreshHud();
  }

  applyLightingMode(){
    if(!this.viewport?.environment)return;
    const preset=this.lightMode==='focus'?'forensic':themePreset(this.experience.theme);
    this.viewport.environment.apply(preset);
    const button=this.host?.querySelector('[data-object-light]');
    if(button)button.textContent=`Iluminação: ${this.lightMode==='focus'?'realce':'setorial'}`;
    this.refreshHud();
  }

  applyGridMode(){
    if(this.gridHelper)this.gridHelper.visible=this.gridVisible;
    const button=this.host?.querySelector('[data-object-grid]');
    if(button)button.textContent=`Grade: ${this.gridVisible?'ligada':'oculta'}`;
    this.refreshHud();
  }

  refreshHud(){
    const hud=this.host?.querySelector('[data-object-hud]');
    if(!hud)return;
    const quality=this.context.qualityManager.level;
    const callouts=(this.experience.callouts??[]).length;
    hud.innerHTML=`
      <div class="object-focus-hud-head">
        <strong>${esc(this.experience.sectorLabel??'Ambiente 3D')}</strong>
        <span>${esc(this.experience.title)}</span>
      </div>
      <div class="object-focus-hud-grid">
        <article><b>qualidade</b><span>${esc(quality)}</span></article>
        <article><b>luz</b><span>${this.lightMode==='focus'?'realce':'setorial'}</span></article>
        <article><b>grade</b><span>${this.gridVisible?'visível':'oculta'}</span></article>
        <article><b>observações</b><span>${callouts} pontos</span></article>
      </div>
    `;
  }

  handle(event){
    const rotate=event.target.closest('[data-object-rotate]');
    if(rotate&&this.viewport?.controls){
      this.autoRotate=!this.autoRotate;
      this.viewport.controls.autoRotate=this.autoRotate;
      rotate.textContent=`Rotação automática: ${this.autoRotate?'ligada':'desligada'}`;
      return;
    }
    if(event.target.closest('[data-object-light]')){
      this.lightMode=this.lightMode==='sector'?'focus':'sector';
      this.applyLightingMode();
      return;
    }
    if(event.target.closest('[data-object-grid]')){
      this.gridVisible=!this.gridVisible;
      this.applyGridMode();
      return;
    }
    if(event.target.closest('[data-object-reset]')&&this.viewport){
      this.viewport.camera.position.set(4.2,2.8,5.0);
      this.viewport.controls.target.set(0,1.1,0);
      this.viewport.controls.update();
      return;
    }
    if(event.target.closest('[data-object-capture]')&&this.viewport){
      const safe=String(this.experience.id||'objeto').replace(/[^a-z0-9-]+/gi,'-').toLowerCase();
      this.viewport.capturePng(`tst360-${safe}.png`);
    }
  }

  dispose(){
    if(this.listener)this.host?.removeEventListener('click',this.listener);
    this.listener=null;
    this.offQuality?.();
    this.offQuality=null;
    if(this.asset){
      this.context.assetManager.release(this.asset);
      this.asset=null;
    }
    this.viewport?.dispose?.();
    this.viewport=null;
    this.host?.replaceChildren();
  }
}
