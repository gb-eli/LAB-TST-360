export function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
export function scorePercent(done,total){return total?Math.round(done/total*100):0}
export function renderTasks(tasks,doneSet){return tasks.map((task,index)=>`<div class="task-item ${doneSet.has(task.id)?'done':''}"><span class="task-check">${doneSet.has(task.id)?'✓':index+1}</span><div><strong>${task.title}</strong>${task.hint?`<div class="muted">${task.hint}</div>`:''}</div></div>`).join('')}
export function saveResult(storage,moduleId,result){const history=storage.get(`results:${moduleId}`,[]);history.unshift({...result,date:new Date().toISOString()});storage.set(`results:${moduleId}`,history.slice(0,20));}
export function downloadJson(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}
export function setQualityOnRoot(root,qualityManager){root.dataset.quality=qualityManager.level}
