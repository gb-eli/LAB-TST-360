const DEFAULT_MAP={idle:'idle',inspect:'inspect',reach:'reach',walk:'walk',climb:'climb',crouch:'crouch',seated:'seated'};

export class CharacterMotionController{
  constructor(character,{initial='idle',speed=1,map={}}={}){
    this.character=character;this.state=initial;this.speed=speed;this.map={...DEFAULT_MAP,...map};this.paused=false;this.elapsed=0;this.setState(initial,true)
  }
  setState(state,immediate=false){this.state=this.map[state]?state:'idle';this.character?.setPose?.(this.map[this.state],immediate);return this.state}
  setSpeed(speed=1){this.speed=Math.max(.05,Number(speed)||1)}
  pause(){this.paused=true}
  resume(){this.paused=false}
  update(delta,elapsed){if(this.paused)return;this.elapsed+=delta*this.speed;this.character?.update?.(delta*this.speed,this.elapsed)}
  dispose(){this.character=null}
}

export function createCharacterMotion(character,options={}){return new CharacterMotionController(character,options)}
