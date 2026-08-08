export class VisualTourRouteDirector{
  constructor(tour){
    this.tour=tour;
    this.routing=tour.routing??null;
    this.stepIndex=new Map((tour.steps??[]).map((step,index)=>[step.id,index]));
  }

  hasBranching(){
    return this.routing?.mode==='branch-and-converge';
  }

  choiceById(choiceId){
    return this.routing?.choices?.find(choice=>choice.id===choiceId)??null;
  }

  choiceForTarget(stepId){
    return this.routing?.choices?.find(choice=>choice.targetStepId===stepId)??null;
  }

  decisionFor(progress){
    const stepId=this.routing?.decisionStepId;
    if(!stepId)return null;
    const choiceId=progress?.decisions?.[stepId]??null;
    return choiceId?this.choiceById(choiceId):null;
  }

  choicesFor(stepId,progress){
    if(!this.hasBranching()||stepId!==this.routing.decisionStepId)return[];
    if(this.decisionFor(progress))return[];
    return this.routing.choices??[];
  }

  suggestedPath(progress){
    if(!this.hasBranching())return (this.tour.steps??[]).map(step=>step.id);
    const decision=this.decisionFor(progress);
    const entry=this.routing.entryStepId;
    const converge=this.routing.convergeStepId;
    if(!decision)return[
      entry,
      ...(this.routing.branchStepIds??[]),
      converge
    ].filter(Boolean);
    return[
      entry,
      decision.targetStepId,
      decision.thenStepId,
      converge
    ].filter(Boolean);
  }

  nextStepId(currentStepId,progress){
    const path=this.suggestedPath(progress);
    const currentIndex=path.indexOf(currentStepId);
    if(currentIndex<0)return null;

    // At the decision point, force an explicit choice before suggesting a branch.
    if(
      this.hasBranching() &&
      currentStepId===this.routing.decisionStepId &&
      !this.decisionFor(progress)
    )return null;

    // Prefer the first unvisited step after the current one.
    const visited=new Set(progress?.visitedStepIds??[]);
    for(let i=currentIndex+1;i<path.length;i++){
      if(!visited.has(path[i])||path[i]===this.routing?.convergeStepId)return path[i];
    }
    return path[currentIndex+1]??null;
  }

  previousStepId(currentStepId,progress){
    const history=(progress?.historyStepIds??[]).filter(id=>this.stepIndex.has(id));
    const reverse=[...history].reverse();
    const currentAt=reverse.indexOf(currentStepId);
    if(currentAt>=0){
      for(let i=currentAt+1;i<reverse.length;i++){
        if(reverse[i]!==currentStepId)return reverse[i];
      }
    }
    const path=this.suggestedPath(progress);
    const index=path.indexOf(currentStepId);
    return index>0?path[index-1]:null;
  }

  routeEdges(progress){
    if(this.hasBranching()&&!this.decisionFor(progress)){
      const entry=this.routing.entryStepId;
      const converge=this.routing.convergeStepId;
      return (this.routing.choices??[]).flatMap(choice=>[
        {from:entry,to:choice.targetStepId,branch:choice.id},
        {from:choice.targetStepId,to:choice.thenStepId,branch:choice.id,secondary:true},
        {from:choice.thenStepId,to:converge,branch:choice.id}
      ]);
    }
    const path=this.suggestedPath(progress);
    return path.slice(0,-1).map((from,index)=>({from,to:path[index+1]}));
  }

  state(progress,currentStepId){
    const choice=this.decisionFor(progress);
    const choices=this.choicesFor(currentStepId,progress);
    const path=this.suggestedPath(progress);
    return{
      branching:this.hasBranching(),
      choice,
      choices,
      path,
      nextStepId:this.nextStepId(currentStepId,progress),
      previousStepId:this.previousStepId(currentStepId,progress),
      edges:this.routeEdges(progress),
      converged:(this.routing?.branchStepIds??[]).every(id=>(progress?.visitedStepIds??[]).includes(id))
    };
  }
}
