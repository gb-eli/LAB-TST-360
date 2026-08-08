function hexToRgb(hex){return{r:(hex>>16)&255,g:(hex>>8)&255,b:hex&255}}
function clamp(v){return Math.max(0,Math.min(255,v))}
function seeded(seed=1){let x=seed>>>0;return()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}

const PRESETS={
  concrete:{base:0x74797a,variance:24,roughness:.96,metalness:0,repeat:[5,5],seed:13},
  paintedWall:{base:0x415768,variance:12,roughness:.88,metalness:0,repeat:[3,2],seed:21},
  paintedSteel:{base:0x657e8b,variance:10,roughness:.58,metalness:.24,repeat:[2,2],seed:35},
  darkSteel:{base:0x252e34,variance:10,roughness:.5,metalness:.36,repeat:[2,2],seed:48},
  wood:{base:0x76543c,variance:22,roughness:.78,metalness:0,repeat:[4,2],seed:59},
  rubber:{base:0x24282a,variance:9,roughness:.98,metalness:0,repeat:[4,4],seed:77}
};

export class SurfaceLibrary{
  constructor(viewport){this.viewport=viewport;this.T=viewport.runtime.THREE;this.textures=[];this.materials=[]}
  size(){const q=this.viewport.context.qualityManager.level;return q==='eco'?32:q==='medium'?48:q==='high'?64:96}
  texture(def){
    const size=this.size(),canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),rgb=hexToRgb(def.base),rnd=seeded(def.seed+size);
    const img=ctx.createImageData(size,size);
    for(let i=0;i<img.data.length;i+=4){const n=(rnd()-.5)*def.variance;img.data[i]=clamp(rgb.r+n);img.data[i+1]=clamp(rgb.g+n);img.data[i+2]=clamp(rgb.b+n);img.data[i+3]=255}
    ctx.putImageData(img,0,0);
    if(def===PRESETS.wood){ctx.globalAlpha=.16;ctx.strokeStyle='#26170e';for(let y=5;y<size;y+=8){ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(size*.3,y-2,size*.7,y+3,size,y);ctx.stroke()}}
    const tex=new this.T.CanvasTexture(canvas);tex.colorSpace=this.T.SRGBColorSpace;tex.wrapS=tex.wrapT=this.T.RepeatWrapping;tex.repeat.set(...def.repeat);tex.anisotropy=Math.min(this.viewport.renderer.capabilities.getMaxAnisotropy(),this.viewport.context.qualityManager.level==='ultra'?8:4);this.textures.push(tex);return tex;
  }
  material(name,extra={}){const def=PRESETS[name]||PRESETS.concrete,mat=new this.T.MeshStandardMaterial({map:this.texture(def),roughness:def.roughness,metalness:def.metalness,...extra});this.materials.push(mat);return mat}
  dispose(){for(const m of this.materials.splice(0))m.dispose?.();for(const t of this.textures.splice(0))t.dispose?.()}
}
export const SURFACE_PRESETS=Object.freeze(Object.keys(PRESETS));
