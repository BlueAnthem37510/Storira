
import * as LAppDefine from './lappdefine';
import { LAppPrompt } from './lapphtmlcontrollers';


export let s_instance: LAppStorySelector;

export class LAppStorySelector extends LAppPrompt{
  _loaded:boolean;
  _adventures:any;
  _stories:Map<string, Array<LAppAdventurePart>>;
  constructor(){
    super("storyselectorcontainer", "storyselector");
    this._open.addEventListener("click", x => LAppStorySelector.getInstance().showStoryGroups())
    this._stories = new Map<string, Array<LAppAdventurePart>>;
  }
  public clear(){
    //remove all but the cross
    while (this._container.children.length > 1) {
      this._container.removeChild(this._container.lastChild);
    }
  }
  public static getInstance(): LAppStorySelector {
    if (s_instance == null) {
      s_instance = new LAppStorySelector();
    }

    return s_instance;
  }
  public async getAdventuresJson() : Promise<any>{
    if(this._loaded) return this._adventures
    this._adventures = await fetch(LAppDefine.KarthAdventurePath).then(response =>{
      return response.json();
    }) //need to add error handling
    this._loaded = true;
    return this._adventures
  }
  public async getStoryGroups() : Promise<Array<string>>{
    return this.getAdventuresJson().then(x => {return Object.keys(x)})
  }


  public static prettyGroup(groupName :string) :string {
    return groupName.replace("_" , " ").replace("_", " ")
  }
  public async showStoryGroups(){
    this.clear();
    const groups =  await this.getStoryGroups();
    groups.forEach(group => {
        const child = document.createElement("p");
        child.innerText = LAppStorySelector.prettyGroup(group);
        child.addEventListener("click",x => LAppStorySelector.getInstance().showStories(group) );
        this._container.appendChild(child)
    });
  }
  public async showStories(group :string){
    this.clear();
    const adventures= await this.getAdventureParts(group);
    const ul = document.createElement("ul")
    adventures.forEach(adventure => {

      const child = document.createElement("li");
      child.addEventListener("click",x =>  {
        const params = new URLSearchParams(window.location.search);
        params.set("id", adventure._id);
        window.location.replace("?"+params)
      });

      child.innerText = adventure._titles["en"];
      ul.appendChild(child);

    });
    this._container.appendChild(ul);
  }

  public async getAdventureParts(group :string) {
    if(this._stories != null && this._stories.has(group)) return this._stories.get(group);

    const groups =await this.getStoryGroups();
    if (!groups.includes(group)) return;
    const adventures = await this.getAdventuresJson();
    const groupStories = adventures[group];
    const keys = Object.keys(groupStories)
    const adventureCollection = new Array<LAppAdventurePart>();
    keys.forEach(key => {
        adventureCollection.push(new LAppAdventurePart(groupStories[key]));

    });
    this._stories.set(group, adventureCollection);
    return adventureCollection;
  }
}

export class LAppAdventurePart{
  _id :string;
  _titles :any;
  constructor(blob :any){
    this._id = blob.id;
    this._titles =blob.title;
  }
  public getAdventureId() :string{
    return this._id.substring(0,5)
  }
  public getPartId() :string{
    return this._id.substring(7)
  }

}
