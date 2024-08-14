
import * as LAppCommands from './lappcommands';
import * as LAppDefine from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';


export class LAppNames{
  _loaded : Boolean;
  _names : any;
  _usedNames : Map<number, string>
  constructor(){
    this._loaded = false;
    this._usedNames = new Map();
  }
  public async GetNames(){
    if(this._loaded) return this._names;
    this._names = await fetch("https://karth.top/api/adventure_chara_name.json").then(response =>{
      return response.json();
    })
    this._loaded = true;
    return this._names;
  }
  public async GetName(index: number, language :string){
    if(index == 0) return null;
    if (this._usedNames.has(index)){
      return this._usedNames.get(index);
    }
    const names = await this.GetNames();

      const name = names[index].name[language];
      this._usedNames.set(index, name)
      return name;
  }
}
export class LAppStory{
    constructor(storyId : string, lan : string){
    this._loaded = false;
    this._index = 1;
    this._id = storyId
    this._waiting = false;
    this._language = enumFromStringValue( LAppDefine.Languages, lan == undefined ? lan :lan.toLowerCase());
    if(this._language  == undefined){
      this._language = LAppDefine.Languages.EN
      return;
    }


    }
    public GetKarthPath(): string
    {
      return `https://karth.top/api/adventure/${this._language == LAppDefine.Languages.JP ? LAppDefine.JPPath : LAppDefine.WWPath}/${this._id}.json`
    }
    public changeLanguage(language : string){
        if(this._language == language) return;
        if(this._language == LAppDefine.Languages.JP || language == LAppDefine.Languages.JP){
          //need to pull story from api again if changing to or from JP
          this._loaded = false;
        }
        this._language = language;
        this._index = 1;
    }
    public async getStory() : Promise<any>{
      if(this._loaded) return this._story
      this._story = await fetch(this.GetKarthPath()).then(response =>{
        return response.json();
      }) //need to add error handling
      this._loaded = true;
      return this._story
    }
    public async getCharacterIds(): Promise<Array<string>>{
      const story = await this.getStory();
      const output = []
      for (let i = 0; i < story.setting.character.length; i++) {
        const element = story.setting.character[i];
        output.push(element.toString())
      }
      return output
    }
    public async getSprites(){ Promise<Array<number>>

      const story = await this.getStory();
      const output = new Array<number>();
      for (let i = 0; i < story.setting.sprite.length; i++) {
        const element = story.setting.sprite[i];
        output.push(element as number);
      }
      return output;
    }

    public async getBackgrounds(): Promise<Array<number>>{
      const story = await this.getStory();
      const output = [];
      for (let i = 0; i < story.setting.bg.length; i++) {
        const element = story.setting.bg[i] as string;
        output.push(Number(element.replace("background_", "").replace(".pvr", "")))
      }
      return output
    }
    public async getCgs() : Promise<Array<number>>{
      const story = await this.getStory();
      return Object.values( story.setting.cg)

    }
    public async getCurrentScript() : Promise<LAppScript>{
        const story = await this.getStory();
        const script = story.script[this._index.toString()];
        if(script == undefined) return null;
        return new LAppScript(script)
    }
    public wait(script :LAppScript){
      this._waiting = true;
      //console.log("waiting...")
      setTimeout(() => {
        if(this._waiting){
          this._waiting = false;
          this.runScript();

          //console.log("Waited!")
        }
      }, script.getTime());
    }
    public runScript() {
      if(this._waiting) return;

      this.getCurrentScript().then(script => {
        //console.log(script)
        const commandType = script.getCommandType();
        if(commandType == LAppDefine.Commands.Wait){
          this._index += 1;
          this.wait(script);
          return;
        }
        if (!LAppCommands.Commands.has(commandType)){
            console.log("Command not implemented: " + commandType);
            this._index += 1;
            this.runScript();
            return;
        }
        const command = LAppCommands.Commands.get(commandType);
        command.run(script);
        this._index +=1;

        if(command._continue){
          this.runScript();
        }
        else{

          return;
        }
      });
    }


    _story: any;
    _loaded: boolean;
    _index: number;
    _id: string;
    _waiting: boolean;
    _language: string;
}
export class LAppScript{
  constructor(script: any){
    this._script = script;
  }
  public getModelIndex(): number{
    return this._script.args.id == undefined ? null : this._script.args.id-1;
  }
  public getSpeackerIndex(): number{
    return this._script.args.speakerId == undefined ? null : this._script.args.speakerId-1;
  }
  public getMessage(language : string){
    if(language== LAppDefine.Languages.JP){
      return this._script.args.body
   }
   else{
    return this._script.args.body[language]
   }
  }
  public getTime(): number{
    return this._script.args.time*1000;
  }
  public getHTMLColour():string{
    const r = this._script.args.r;
    const g = this._script.args.g;
    const b= this._script.args.b;
    const a = this._script.args.a;
    return `rgba(${r},${g}, ${b}, ${a})`
  }
  public getNameId():number{
    return this._script.args.nameId;
  }
  public getVoice(): string{
    return this._script.args.voiceId;
  }
  public getCommandType(): any {//string{
    return this._script.type
  }
  public getExpressionName(): string{
    return this._script.args.expression
  }
  public getMotionName():string{
    return this._script.args.motion
  }
  public getModelPosition():number{
    return this._script.args.position
  }
  public getBackgroundId():number{
    return this.getModelIndex();
  }
  public getAudioId():number{
    return this.getModelIndex()+1;
  }
  _script: any;
}





//https://stackoverflow.com/a/41548441
export function enumFromStringValue<T> (enm: { [s: string]: T}, value: string): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value)
    ? value as unknown as T
    : undefined;
}
