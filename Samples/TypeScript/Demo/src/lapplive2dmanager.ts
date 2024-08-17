/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { ACubismMotion } from '@framework/motion/acubismmotion';
import { csmVector } from '@framework/type/csmvector';


import * as LAppDefine from './lappdefine';
import { canvas } from './lappglmanager';
import { LAppModel } from './lappmodel';
import { LAppPal } from './lapppal';
import { LAppNames, LAppScript, LAppStory } from './lappstory';
import { strtod } from '@framework/live2dcubismframework';
import { CubismPhysicsSource } from '@framework/physics/cubismphysicsinternal';
import { LAppAudioController, LAppFade, LAppTextBox, LAppTitle } from './lapphtmlcontrollers';
import { LAppDelegate } from './lappdelegate';

export let s_instance: LAppLive2DManager = null;

/**
 * サンプルアプリケーションにおいてCubismModelを管理するクラス
 * モデル生成と破棄、タップイベントの処理、モデル切り替えを行う。
 */
export class LAppLive2DManager {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   */
  public static getInstance(): LAppLive2DManager {
    if (s_instance == null) {
      s_instance = new LAppLive2DManager();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance = void 0;
    }

    s_instance = null;
  }

  /**
   * 現在のシーンで保持しているモデルを返す。
   *
   * @param no モデルリストのインデックス値
   * @return モデルのインスタンスを返す。インデックス値が範囲外の場合はNULLを返す。
   */
  public getModel(no: number): LAppModel {
    if (no < this._models.getSize()) {
      return this._models.at(no);
    }

    return null;
  }

  /**
   * 現在のシーンで保持しているすべてのモデルを解放する
   */
  public releaseAllModel(): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      this._models.at(i).release();
      this._models.set(i, null);
    }

    this._models.clear();
  }

  /**
   * 画面をドラッグした時の処理
   *
   * @param x 画面のX座標
   * @param y 画面のY座標
   */
  public onDrag(x: number, y: number): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      const model: LAppModel = this.getModel(i);

      if (model) {
        model.setDragging(x, y);
      }
    }
  }


  public backGroundCommand(script: LAppScript) {
    this._story.getBackgrounds().then(backgrounds => {
      this._background = backgrounds[script.getBackgroundId()]
    })
    this._story._index += 1;

  }

  public waitCommand(script: LAppScript) {
    this._story._waiting = true;
    //console.log("waiting...")
    setTimeout(() => {
      if (this._story._waiting) {

        this._story._waiting = false;
        //console.log("Waited!")
      }
    }, script.getTime());

  }
  public titleCommand(script: LAppScript) {

    this._title.display(script.getMessage(this._story._language));
    this._story._index += 1;

    return;
  }


  public onTap(x: number, y: number): void {
    if (this._story == null) return;
    if (!this._story._waiting) this._story.runScript();


  }

  /**
   * 画面を更新するときの処理
   * モデルの更新処理及び描画処理を行う
   */
  public onUpdate(): void {
    const { width, height } = canvas;

    const modelCount: number = this._models.getSize();

    for (let i = 0; i < modelCount; ++i) {
      const projection: CubismMatrix44 = new CubismMatrix44();

      const model: LAppModel = this.getModel(i);

      if (model.getModel()) {
        if (model.getModel().getCanvasWidth() > 1.0 && width < height) {
          // 横に長いモデルを縦長ウィンドウに表示する際モデルの横サイズでscaleを算出する
          model.getModelMatrix().setWidth(5.0);
          projection.scale(LAppDefine.ModelScale, (width / height) * LAppDefine.ModelScale);
        } else {
          projection.scale((height / width) * LAppDefine.ModelScale, LAppDefine.ModelScale);
        }
        model.getModelMatrix().centerY(LAppDefine.YPosition);

        if (model._position == null) {
          model.getModelMatrix().centerX(1)
        }
        else {
          model.getModelMatrix().centerX(0.5*model._position -0.5)
        }

        // 必要があればここで乗算
        if (this._viewMatrix != null) {
          projection.multiplyByMatrix(this._viewMatrix);
        }
      }

      model.update();
      model.draw(projection); // 参照渡しなのでprojectionは変質する。
    }
  }

  /**
   * 次のシーンに切りかえる
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   */
  public reset() {
    this._story._index = 1
    for (let index = 0; index < this._models._size; index++) {
      this._models.at(index)._hidden = true;
    }
    this._voice.pause();
    this._music.pause();
    this._background = 0;
    this._textbox.clear();
    this._textbox.hide();
    this._fade.hide();

  }
  public changeLanguage(): void {
    const languageList = Object.values(LAppDefine.Languages)
    this._languageIndex = (this._languageIndex + 1) % languageList.length;
    const language = languageList[this._languageIndex]
    this._story.changeLanguage(language)
    this.reset();
    console.log("Language changed to: " + language)
  }

  /**
   * シーンを切り替える
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   */
  public changeScene(name: string): void {

    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(`[APP]model: ${name}`);
    }

    // ModelDir[]に保持したディレクトリ名から
    // model3.jsonのパスを決定する。
    // ディレクトリ名とmodel3.jsonの名前を一致させておくこと。
    const model: string = name;
    const modelPath: string = LAppDefine.ResourcesPath + model + '/';
    let modelJsonName: string = "model.model3.json";

    this.releaseAllModel();
    this._models.pushBack(new LAppModel());
    this._models.at(0).loadAssets(modelPath, modelJsonName);
  }
  public addModel(name: string) {
    const model: string = name;
    const modelPath: string = LAppDefine.ResourcesPath + LAppDefine.ModelDir + model + '/';
    let modelJsonName: string = "model.model3.json";
    this._models.pushBack(new LAppModel());
    const index = this._models._size - 1;
    this._models.at(index).loadAssets(modelPath, modelJsonName);
    this._models.at(index)._hidden = true;

  }

  public setViewMatrix(m: CubismMatrix44) {
    for (let i = 0; i < 16; i++) {
      this._viewMatrix.getArray()[i] = m.getArray()[i];
    }
  }

  /**
   * コンストラクタ
   */
  constructor() {

    this._viewMatrix = new CubismMatrix44();
    this._textbox = new LAppTextBox();
    this._textbox.hide();
    this._fade = new LAppFade();
    this._title = new LAppTitle();
    this._models = new csmVector<LAppModel>();
    this._background = 0;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("id")) {
      console.log("No story id :(")
      this._story = null;
      return;
    }
    this._story = new LAppStory(params.get("id"), params.get("lan"));
    const index = params.get("index")
    if(index){
      const num = Number(index)
      this._story._index = num;

    }
    this._music = new LAppAudioController(true);
    this._voice = new LAppAudioController(false);
    this._soundEffect = new LAppAudioController(false);
    this._names = new LAppNames()

    this._story.getCharacterIds().then(characters => {
      characters.forEach(x =>
        this.addModel(x)
      )
      this._names.GetNames();
    }

    )
    this._story.getSprites().then(sprites =>{
      sprites.forEach(sprite => {
        LAppDelegate.getInstance()._view.addSprite(sprite);
      });
    this._story.getCgs().then(cgs =>{
      cgs.forEach(cg =>{
        LAppDelegate.getInstance()._view.addCg(cg);
      })
    })

  })

    this._languageIndex = 0;

  }

  _viewMatrix: CubismMatrix44; // モデル描画に用いるview行列
  _models: csmVector<LAppModel>; // モデルインスタンスのコンテナ
  _story: LAppStory;
  _names: LAppNames;
  _music: LAppAudioController;
  _textbox: LAppTextBox;
  _voice: LAppAudioController;
  _soundEffect: LAppAudioController;
  _title: LAppTitle;
  _fade: LAppFade;
  _languageIndex: number; // 表示するシーンのインデックス値
  _background: number;

  // モーション再生終了のコールバック関数
  _finishedMotion = (self: ACubismMotion): void => {
    //LAppPal.printMessage('Motion Finished:');
    //console.log(self);
  };
}
