import {QUALITY_LEVELS} from './quality-manager.js';
export class PerformanceManager{
 constructor(quality,events){this.quality=quality;this.events=events;this.samples=[];this.last=0;this.cooldown=12000}
 sample(ms){if(!Number.isFinite(ms)||ms<=0)return;this.samples.push(1000/ms);if(this.samples.length>180)this.samples.shift();if(this.samples.length>=120)this.evaluate()}
 average(){return this.samples.length?this.samples.reduce((a,b)=>a+b,0)/this.samples.length:60}
 evaluate(){if(this.quality.mode!=='auto')return;const now=performance.now();if(now-this.last<this.cooldown)return;const fps=this.average();let i=QUALITY_LEVELS.indexOf(this.quality.level),next=null;if(fps<36&&i>0)next=QUALITY_LEVELS[i-1];else if(fps>57&&i<QUALITY_LEVELS.length-1)next=QUALITY_LEVELS[i+1];if(!next)return;this.quality.setLevel(next);this.samples.length=0;this.last=now;this.events.emit('quality:changed',{level:next,fps,mode:'auto'})}
}
