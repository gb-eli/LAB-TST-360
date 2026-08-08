export class PanoramaGraphLoader{
  constructor(assetProvider,graphPath){
    this.assets=assetProvider;
    this.graphPath=graphPath;
    this.graphPromise=null;
    this.nodePromises=new Map();
  }

  async graph(){
    if(!this.graphPromise){
      this.graphPromise=this.assets.json(this.graphPath,{cache:'no-cache'})
        .catch(error=>{this.graphPromise=null;throw error});
    }
    return this.graphPromise;
  }

  async node(nodeId){
    if(this.nodePromises.has(nodeId))return this.nodePromises.get(nodeId);
    const promise=(async()=>{
      const graph=await this.graph();
      const entry=graph.nodes?.find(node=>node.id===nodeId);
      if(!entry)throw new Error(`Ponto panorâmico não encontrado: ${nodeId}.`);
      return this.assets.json(entry.path,{cache:'no-cache'});
    })().catch(error=>{
      this.nodePromises.delete(nodeId);
      throw error;
    });
    this.nodePromises.set(nodeId,promise);
    return promise;
  }

  stats(){
    return{
      graphLoaded:!!this.graphPromise,
      nodesCached:this.nodePromises.size
    };
  }
}
