export const QUALITY_LEVELS=['eco','medium','high','ultra'];
export const QUALITY_PROFILES={
 eco:{pixelRatioCap:1,shadows:false,texture:'low',lodBias:2,animations:false,particles:.2,realism:0,contactShadows:false,materialDetail:false,skinnedCharacters:false,populationCount:0,skinnedPopulation:0,populationActiveDistance:0,ambientActivityCount:0,ambientActiveDistance:0,ambientMotionFactor:0,panoramaImage360:false,panoramaImageTier:null,contextDressingCount:1,contextPropCount:0,scenicPropCount:0,atmosphereDetail:0},
 medium:{pixelRatioCap:1.25,shadows:true,texture:'medium',lodBias:1,animations:true,particles:.55,realism:.45,contactShadows:true,materialDetail:false,skinnedCharacters:true,populationCount:2,skinnedPopulation:0,populationActiveDistance:11,ambientActivityCount:2,ambientActiveDistance:28,ambientMotionFactor:.55,panoramaImage360:true,panoramaImageTier:'medium',contextDressingCount:3,contextPropCount:1,scenicPropCount:0,atmosphereDetail:1},
 high:{pixelRatioCap:1.6,shadows:true,texture:'high',lodBias:0,animations:true,particles:1,realism:.78,contactShadows:true,materialDetail:true,skinnedCharacters:true,populationCount:4,skinnedPopulation:2,populationActiveDistance:16,ambientActivityCount:4,ambientActiveDistance:38,ambientMotionFactor:1,panoramaImage360:true,panoramaImageTier:'high',contextDressingCount:5,contextPropCount:2,scenicPropCount:1,atmosphereDetail:2},
 ultra:{pixelRatioCap:2,shadows:true,texture:'ultra',lodBias:-1,animations:true,particles:1.25,realism:1,contactShadows:true,materialDetail:true,skinnedCharacters:true,populationCount:6,skinnedPopulation:3,populationActiveDistance:22,ambientActivityCount:6,ambientActiveDistance:48,ambientMotionFactor:1.15,panoramaImage360:true,panoramaImageTier:'ultra',contextDressingCount:7,contextPropCount:3,scenicPropCount:2,atmosphereDetail:3}
};
export class QualityManager{
 constructor(storage){this.storage=storage;this.mode=storage.get('quality-mode','auto');this.level=storage.get('quality-level',this.detect())}
 detect(){const memory=navigator.deviceMemory??4,cores=navigator.hardwareConcurrency??4;if(memory<=2||cores<=2)return'eco';if(memory>=8&&cores>=8)return'high';return'medium'}
 setMode(mode){this.mode=mode;this.storage.set('quality-mode',mode);if(mode!=='auto')this.setLevel(mode)}
 setLevel(level){if(!QUALITY_PROFILES[level])return false;this.level=level;this.storage.set('quality-level',level);return true}
 get settings(){return QUALITY_PROFILES[this.level]}
}
