export class EnvironmentExperienceRegistry{
  constructor(assetProvider){
    this.assets=assetProvider;
    this.indexPromise=null;
    this.sectorPromises=new Map();
  }

  async index(){
    if(!this.indexPromise){
      this.indexPromise=this.assets.json('data/environments/index.json',{cache:'no-cache'})
        .catch(error=>{this.indexPromise=null;throw error});
    }
    return this.indexPromise;
  }

  async sector(sectorId){
    if(this.sectorPromises.has(sectorId))return this.sectorPromises.get(sectorId);
    const promise=(async()=>{
      const index=await this.index();
      const entry=index?.sectors?.[sectorId];
      if(!entry)throw new Error(`Biblioteca visual não encontrada para o setor: ${sectorId}.`);
      return this.assets.json(entry.path,{cache:'no-cache'});
    })().catch(error=>{
      this.sectorPromises.delete(sectorId);
      throw error;
    });
    this.sectorPromises.set(sectorId,promise);
    return promise;
  }

  async list(){
    const index=await this.index();
    return Object.entries(index?.sectors??{}).map(([id,value])=>({id,...value}));
  }

  stats(){
    return{
      indexLoaded:!!this.indexPromise,
      sectorFilesCached:this.sectorPromises.size
    };
  }
}
