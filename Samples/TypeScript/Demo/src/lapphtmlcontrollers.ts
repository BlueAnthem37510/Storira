
import * as LAppDefine from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';


export class LAppAudioController{
    constructor(loop :boolean){
      this._audio = null;
      this._path = null;
      this._loop = loop;
      this._audiocontext = null;
    }
    public pause(){
      if (this._audio == null) return
      this._audio.pause();
    }
    public clear(){
      if (this._audio == null) return
      this._audio.pause();
      this._audio = null;
    }
    public play(path: string){

      if(this._audio != null){
        this._audio.pause();
      }
      this._audio = new Audio(path)
      if(this._loop){
        this._audio.setAttribute("loop","true")
      }

      this._audio.addEventListener("canplaythrough", (event) => {
        /* the audio is now playable; play it if permissions allow */
        this._audio.play();

      });
    }
      _audiocontext: AudioContext;
      _audio: HTMLAudioElement;
      _path: string;
      _loop: boolean;
}
export class LAppHtmlController{
    _container: HTMLElement;
    constructor(containerId : string){
      this._container = document.getElementById(containerId);
    }
    public show(){
      LAppHtmlController.show(this._container);
    }
    public hide(){
      LAppHtmlController.hide(this._container);
    }
    public static show(elem : any){
      LAppHtmlController.getElement(elem).style.display = "block";
    }
    public static hide(elem : any){
      LAppHtmlController.getElement(elem).style.display = "none";
    }
    public static toggle(elem :any){
      var display =LAppHtmlController.getElement(elem).style.display;
      if(display == "none"){
         display = "block";
      }
      else{
        display = "none";
      }
      LAppHtmlController.getElement(elem).style.display = display;
    }

    public static getElement(elem :any) : HTMLElement{

      if(typeof elem == "string"){
          return document.getElementById(String(elem));
      }
      else{
          return elem as HTMLElement;
      }
    }
}
  export class LAppTextBox extends LAppHtmlController{
    _text: HTMLElement;
    _nameText: HTMLElement;
    _nameColour:HTMLElement;
    _nameContainer:HTMLElement;
    _stars:HTMLCollectionOf<Element>;
    constructor(){
      super("textbox")
      this._nameContainer = document.getElementById("nameContainer");
      this._text = document.getElementById("text")
      this._nameText = document.getElementById("nameText")
      this._nameColour = document.getElementById("colourBox");
      this._stars = document.getElementsByClassName("star");
    }
    public message(text: string){
      this._text.innerText = text;
    }
    public name(name :string){

      if(name == null ){
        LAppHtmlController.hide(this._nameContainer);
        return;
      }
      LAppHtmlController.show(this._nameContainer);
      this._nameText.innerText = name;
    }
    public colour(colour :string){
      this._nameColour.style["backgroundColor"] = colour;
      for (let index = 0; index < this._stars.length; index++) {
        this._stars[index].setAttribute("style", "background-color:"+colour)

      }

    }
    public clear(){
      this._text.innerText =  "";
    }
  }

  export class LAppFade  extends LAppHtmlController{

    constructor(){
      super("fade")
    }

   public fadeIn( time: number, colour : string){
    this.show();
    this._container.style["backgroundColor"]  = colour;
    this._container.animate([{ opacity: 0 },{ opacity: 1 }],{duration: time,iterations: 1})
   }
   public fadeOut(time: number, colour : string){
    const anim = this._container.animate([{ opacity: 1 },{ opacity: 0 }],{duration: time,iterations: 1})
    anim.onfinish = (event :any) => new LAppFade().hide();
   }

  }
  export class LAppTitle extends LAppHtmlController{
    _text: HTMLElement;
    constructor(){
      super("titleContainer")
      this._text = LAppHtmlController.getElement("titleText");
      this.hide();

    }
    public display(text : string){
      this.show();
      this._text.innerText = text;
      const anim =this._container.animate({ opacity: [0, 1, 1, 0], left: ["52%", "50%", "50%", "42%"],
      },{duration: 2000,iterations: 1, fill:"forwards", easing: "cubic-bezier(0.000, 0.250, 1.000, 0.775)"});
      anim.onfinish = (event :any) => LAppHtmlController.hide("titleContainer");
    }
  }
  export class LAppPrompt extends LAppHtmlController{
      constructor(containerId : string, openElement : string){
        super(containerId);
        this.hide();
        this._open  = document.getElementById(openElement);
        this._open.addEventListener("click", x =>LAppHtmlController.show(this._container))
        this._close =  document.createElement("span");
        this._close.innerText = "X";
        this._close.className = "close";
        this._close.addEventListener("click", x =>LAppHtmlController.hide(this._container));
        this._container.appendChild(this._close)

      }
      _close : HTMLElement;
      _open : HTMLElement;
  }
