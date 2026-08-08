export class VisualTourProgressService{
  constructor(storage){
    this.storage=storage;
  }

  key(tourId){
    return`visual-tour-progress:${tourId}`;
  }

  get(tour){
    const saved=this.storage?.get?.(this.key(tour.id),null);
    const stepIds=new Set((tour.steps??[]).map(step=>step.id));
    const choiceIds=new Set((tour.routing?.choices??[]).map(choice=>choice.id));
    const visited=(saved?.visitedStepIds??[]).filter(id=>stepIds.has(id));
    const history=(saved?.historyStepIds??[]).filter(id=>stepIds.has(id));
    const decisions={};
    for(const [stepId,choiceId] of Object.entries(saved?.decisions??{})){
      if(stepIds.has(stepId)&&choiceIds.has(choiceId))decisions[stepId]=choiceId;
    }
    return{
      tourId:tour.id,
      currentStepId:stepIds.has(saved?.currentStepId)?saved.currentStepId:(tour.steps?.[0]?.id??null),
      visitedStepIds:[...new Set(visited)],
      historyStepIds:history,
      decisions,
      startedAt:saved?.startedAt??null,
      updatedAt:saved?.updatedAt??null,
      completedAt:saved?.completedAt??null
    };
  }

  save(tour,progress){
    const now=new Date().toISOString();
    const next={
      ...progress,
      tourId:tour.id,
      startedAt:progress.startedAt??now,
      updatedAt:now
    };
    this.storage?.set?.(this.key(tour.id),next);
    return next;
  }

  appendHistory(progress,stepId){
    const history=[...(progress.historyStepIds??[])];
    if(history.at(-1)!==stepId)history.push(stepId);
    return history.slice(-40);
  }

  visit(tour,progress,stepId){
    const visited=new Set(progress.visitedStepIds??[]);
    visited.add(stepId);
    const completed=visited.size>=(tour.steps?.length??0);
    return this.save(tour,{
      ...progress,
      currentStepId:stepId,
      visitedStepIds:[...visited],
      historyStepIds:this.appendHistory(progress,stepId),
      completedAt:completed?(progress.completedAt??new Date().toISOString()):null
    });
  }

  current(tour,progress,stepId){
    return this.save(tour,{
      ...progress,
      currentStepId:stepId,
      historyStepIds:this.appendHistory(progress,stepId)
    });
  }

  decide(tour,progress,stepId,choiceId){
    const valid=(tour.routing?.choices??[]).some(choice=>choice.id===choiceId);
    if(!valid)return progress;
    return this.save(tour,{
      ...progress,
      decisions:{...(progress.decisions??{}),[stepId]:choiceId}
    });
  }

  clearDecision(tour,progress,stepId){
    const decisions={...(progress.decisions??{})};
    delete decisions[stepId];
    return this.save(tour,{...progress,decisions});
  }

  reset(tour){
    this.storage?.remove?.(this.key(tour.id));
    return this.get(tour);
  }

  stats(tour,progress){
    const total=tour.steps?.length??0;
    const visited=new Set(progress.visitedStepIds??[]).size;
    return{
      total,
      visited,
      percent:total?Math.round(visited/total*100):0,
      complete:total>0&&visited>=total,
      decisions:Object.keys(progress.decisions??{}).length
    };
  }
}
