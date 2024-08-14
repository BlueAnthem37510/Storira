
import { ssrExportAllKey } from 'vite/runtime';
import * as LAppDefine from './lappdefine';
import { LAppDelegate } from './lappdelegate';
import { LAppFade, LAppTextBox, LAppTitle } from './lapphtmlcontrollers';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppScript, LAppStory } from './lappstory';

export type Command = (script : LAppScript) => void;

export class LAppCommand{
  _command :Command;
  _continue: boolean; //Should the next script run after
  constructor(command : Command, _continue :boolean){
    this._command = command;
    this._continue = _continue;
  }
  public run(script : LAppScript){
    this._command(script);
  }
}

function motionCommand(script :LAppScript){
  const expression = script.getExpressionName()
  const motion = script.getMotionName()
  const modelIndex = script.getModelIndex()
  const manager = LAppLive2DManager.getInstance();
  manager._models.at(modelIndex).setCommandExpression(expression)
  manager._models.at(modelIndex).startMotion(motion, 0, LAppDefine.PriorityForce,manager._finishedMotion)
}

function toggleCharacterCommand(script: LAppScript, toggle : boolean  ){
  const id = script.getModelIndex();
  const manager = LAppLive2DManager.getInstance();
  manager._models.at(id)._hidden = toggle;
  manager._models.at(id)._position = script.getModelPosition();
  return;
}

function musicCommand(script :LAppScript){
  const path = LAppDefine.ResourcesPath+LAppDefine.MusicDir + `bgm_${script.getAudioId()}.opus`
  const manager = LAppLive2DManager.getInstance();
  manager._music.play(path)
}
function endMusicCommand(script : LAppScript){
  LAppLive2DManager.getInstance()._music.clear();
}
function soundEffect(script:LAppScript){
   const path = LAppDefine.ResourcesPath+LAppDefine.SoundEffecrDir + `se_${script.getAudioId()}.mp3`
   //console.log(path)
   LAppLive2DManager.getInstance()._soundEffect.play(path );
}
function endSoundEffect(script: LAppScript){
  LAppLive2DManager.getInstance()._soundEffect.clear();
}


function messageCommand(script : LAppScript){
  const manager = LAppLive2DManager.getInstance();
  manager._textbox.message(script.getMessage(manager._story._language));
  const voice = script.getVoice();
  const path = LAppDefine.ResourcesPath + LAppDefine.VoiceDir + `${manager._story._id}/${voice}.wav`
  const nameId = script.getNameId();

  manager._names.GetName(nameId, manager._story._language).then(name => {
    manager._textbox.name(name)
  });

  manager._textbox.colour(LAppDefine.Colours.has(nameId) ?LAppDefine.Colours.get(nameId) : LAppDefine.DefaultColor)
  manager._voice.play(path)
  const speakerId  = script.getSpeackerIndex()
  if(speakerId < 0) return
  manager._models.at(speakerId)._wavFileHandler.start(path, manager._voice._audio);
}
function showTitle(script :LAppScript){
  const manager = LAppLive2DManager.getInstance();
  manager._title.display(script.getMessage(manager._story._language));
}
function changeBackground(script:LAppScript){
  const manager = LAppLive2DManager.getInstance();
  manager._story.getBackgrounds().then(backgrounds => {
    const backgroundId=  script.getBackgroundId();
    const delegate = LAppDelegate.getInstance()
    if(backgroundId < 0 ){
      delegate._view.hideBackground();
    }
    else{
      delegate._view.changeBackground(backgrounds[backgroundId]);
    }

  })
}
function changeCG(script:LAppScript){
  const manager = LAppLive2DManager.getInstance();
  manager._story.getCgs().then(cgs => {
    const cgId=  script.getBackgroundId();
    const delegate = LAppDelegate.getInstance()
      delegate._view.changeCg(cgs[cgId]);

  })
}

function fade(script :LAppScript, inout: boolean){
    const fade = new LAppFade();
    const col = script.getHTMLColour();
    const time = script.getTime();
    if(inout){
      fade.fadeIn(time, col);
    }
    else{
      fade.fadeOut(time, col);
    }
}


export const Commands = new Map<LAppDefine.Commands, LAppCommand>([
  [LAppDefine.Commands.FadeIn, new LAppCommand( (script :LAppScript) => { fade(script, true)}, true)],
  [LAppDefine.Commands.FadeOut, new LAppCommand( (script :LAppScript) => { fade(script, false)}, true)],
  [LAppDefine.Commands.Background, new LAppCommand(changeBackground, true)],
  [LAppDefine.Commands.Motion, new LAppCommand(motionCommand, true)],
  [LAppDefine.Commands.ShowCharacter, new LAppCommand((script : LAppScript) => (toggleCharacterCommand(script, false)), true)],
  [LAppDefine.Commands.HideCharacter, new LAppCommand((script : LAppScript) => (toggleCharacterCommand(script, true)), true)],
  [LAppDefine.Commands.Music, new LAppCommand(musicCommand, true)],
  [LAppDefine.Commands.EndMusic, new LAppCommand(endMusicCommand, true)],
  [LAppDefine.Commands.SoundEffect, new LAppCommand(soundEffect, true)],
  [LAppDefine.Commands.EndSoundEffect, new LAppCommand(endSoundEffect, true)],
  [LAppDefine.Commands.TextBox, new LAppCommand((script :LAppScript) => {new LAppTextBox().show()}, true)],
  [LAppDefine.Commands.HideTextBox, new LAppCommand((script :LAppScript) => {new LAppTextBox().hide()}, true)],
  [LAppDefine.Commands.Message, new LAppCommand(messageCommand, false)],
  [LAppDefine.Commands.Title, new LAppCommand(showTitle, true)],
  [LAppDefine.Commands.ShowCg, new LAppCommand(changeCG, true)],
  [LAppDefine.Commands.HideCg, new LAppCommand((script :LAppScript) => {LAppDelegate.getInstance()._view._cg._visible =  false}, true)],
  [LAppDefine.Commands.ShowSprite, new LAppCommand((script :LAppScript) => {LAppDelegate.getInstance()._view._sprites[script.getModelIndex()].show()}, true)],
  [LAppDefine.Commands.HideSprite, new LAppCommand((script :LAppScript) => {LAppDelegate.getInstance()._view._sprites[script.getModelIndex()]._visible = false}, true)],
])

