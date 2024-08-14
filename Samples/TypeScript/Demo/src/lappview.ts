/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { CubismViewMatrix } from '@framework/math/cubismviewmatrix';

import * as LAppDefine from './lappdefine';
import { LAppDelegate } from './lappdelegate';
import { canvas, gl } from './lappglmanager';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppPal } from './lapppal';
import { LAppSprite, LAppSpriteContainer, Position } from './lappsprite';
import { TextureInfo } from './lapptexturemanager';
import { TouchManager } from './touchmanager';
import { formatPostcssSourceMap } from 'vite';
import { l } from 'vite/dist/node/types.d-FdqQ54oU';
import { CubismMotionSegmentType } from '@framework/motion/cubismmotioninternal';

/**
 * 描画クラス。
 */
export class LAppView {
  /**
   * コンストラクタ
   */
  constructor() {

    this._programId = null;
    const getBackSize = (textureInfo: TextureInfo): Position => {
      const width = canvas.width;
      const height = canvas.height;
      const x: number = width * 0.5;
      const y: number = height * 0.5;
      //4:3
      if(width*0.75 > height){
        return new Position(x, y, width, width*0.75);
      }
      else{
        return new Position(x, y, height*1.25, height);
      }

    };
    this._back = new LAppSpriteContainer(getBackSize, LAppDefine.ResourcesPath + LAppDefine.BackgroundsDir);
    this._back._itemId = 0;
    this._cg = new LAppSpriteContainer(getBackSize, LAppDefine.ResourcesPath + LAppDefine.CgDir);
    this._cg._visible = false;
    this._sprites = new Array<LAppSpriteContainer>();
    //this._languageSelector = null;

    // タッチ関係のイベント管理
    this._touchManager = new TouchManager();

    // デバイス座標からスクリーン座標に変換するための
    this._deviceToScreen = new CubismMatrix44();

    // 画面の表示の拡大縮小や移動の変換を行う行列
    this._viewMatrix = new CubismViewMatrix();
  }

  /**
   * 初期化する。
   */
  public initialize(): void {
    const { width, height } = canvas;

    const ratio: number = width / height;
    const left: number = -ratio;
    const right: number = ratio;
    const bottom: number = LAppDefine.ViewLogicalLeft;
    const top: number = LAppDefine.ViewLogicalRight;

    this._viewMatrix.setScreenRect(left, right, bottom, top); // デバイスに対応する画面の範囲。 Xの左端、Xの右端、Yの下端、Yの上端
    this._viewMatrix.scale(LAppDefine.ViewScale, LAppDefine.ViewScale);

    this._deviceToScreen.loadIdentity();
    if (width > height) {
      const screenW: number = Math.abs(right - left);
      this._deviceToScreen.scaleRelative(screenW / width, -screenW / width);
    } else {
      const screenH: number = Math.abs(top - bottom);
      this._deviceToScreen.scaleRelative(screenH / height, -screenH / height);
    }
    this._deviceToScreen.translateRelative(-width * 0.5, -height * 0.5);

    // 表示範囲の設定
    this._viewMatrix.setMaxScale(LAppDefine.ViewMaxScale); // 限界拡張率
    this._viewMatrix.setMinScale(LAppDefine.ViewMinScale); // 限界縮小率

    // 表示できる最大範囲
    this._viewMatrix.setMaxScreenRect(
      LAppDefine.ViewLogicalMaxLeft,
      LAppDefine.ViewLogicalMaxRight,
      LAppDefine.ViewLogicalMaxBottom,
      LAppDefine.ViewLogicalMaxTop
    );


  }

  /**
   * 解放する
   */
  public release(): void {
    this._viewMatrix = null;
    this._touchManager = null;
    this._deviceToScreen = null;

    this._cg._sprite.release();
    this._cg = null;
    this._back._sprite.release();
    this._back = null;

    for (let i = 0; i  < this._sprites.length; i++) {
      this._sprites[i]._sprite.release() ;
      this._sprites[i] = null;

    }
    gl.deleteProgram(this._programId);
    this._programId = null;
  }

  /**
   * 描画する。
   */
  public render(): void {

    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();

    live2DManager.setViewMatrix(this._viewMatrix);

    gl.useProgram(this._programId);
    if(!this._back){
      this.changeBackground(0);
    }
    if (this._back._sprite && this._back._visible) {
      this._back._sprite.render(this._programId);
    }
    if (this._cg._sprite && this._cg._visible){
      this._cg._sprite.render(this._programId);
    }

    this._sprites.forEach(sprite => {
      if(sprite._sprite && sprite._visible)
        sprite._sprite.render(this._programId);
    });

    gl.flush();


    live2DManager.onUpdate();

  }
  public clearCg(){
    this._cg._visible = false;
  }
  public hideBackground(){
    if(this._back._sprite){
      this._back._visible = false;
    }
  }
  public changeBackground(background: number){
      this._back._itemId = background;
      this._back._visible = true;
      this._back.generateSprite();
      /*if (background == null) return;
      const textureManager = LAppDelegate.getInstance().getTextureManager();
      const resourcesPath = LAppDefine.ResourcesPath;
      const imageName = LAppDefine.BackgroundsDir;
      const width: number = canvas.width;
      const height: number = canvas.height;
      // 非同期なのでコールバック関数を作成
      //const initBackGroundTexture = (textureInfo: TextureInfo): void => {
      /* const x: number = width * 0.5;
        const y: number = height * 0.5;
        //4:3
        if(width*0.75 > height){
          this._back = new LAppSprite(x, y, width, width*0.75, textureInfo.id, background);
        }
        else{
          this._back = new LAppSprite(x, y, height*1.25, height, textureInfo.id, background);
        }

      };

    textureManager.createTextureFromPngFile(
      resourcesPath + imageName + background.toString()+ ".png",
      false,
      initBackGroundTexture
    );*/


  }
  public changeCg(cg: number){
    this._cg._itemId = cg;
    this._cg._visible = true;
    this._cg.generateSprite();
    /*if (cg == null) return;
    const textureManager = LAppDelegate.getInstance().getTextureManager();
    const resourcesPath = LAppDefine.ResourcesPath;
    const imageName = LAppDefine.CgDir;
    const width: number = canvas.width;
    const height: number = canvas.height;
    // 非同期なのでコールバック関数を作成
    const initCgTexture = (textureInfo: TextureInfo): void => {
      const x: number = width * 0.5;
      const y: number = height * 0.5;
      //4:3
      if(width*0.75 > height){
        this._cg = new LAppSprite(x, y, width, width*0.75, textureInfo.id, cg);
      }
      else{
        this._cg = new LAppSprite(x, y, height*1.25, height, textureInfo.id, cg);
      }
      this._cg._visible = false;
    };

  textureManager.createTextureFromPngFile(
    resourcesPath + imageName + cg.toString()+ ".png",
    false,
    initCgTexture
  );*/

}
/**
 * addSprite
 */
public addSprite( sprite :number) {
    for (let index = 0; index < this._sprites.length; index++) {
      const element = this._sprites[index];
      if(element._itemId == sprite){
        this._sprites[index]._visible = true;
        element.generateSprite();
        return;
      }
    }
    const spriteSize = (textureInfo: TextureInfo): Position => {
      const width = canvas.width;
      const height = canvas.height * 0.9;
      const imgHeight  =textureInfo.img.naturalHeight;
      const imgWidth =textureInfo.img.naturalWidth;
      const ratio:number = imgHeight > imgWidth ? imgWidth/imgHeight : imgHeight/imgWidth;
      return new Position(width * 0.5, height*0.5, height*ratio, height);

    };
    const newSprite =  new LAppSpriteContainer(spriteSize, LAppDefine.ResourcesPath + LAppDefine.SpritesDir);
    newSprite._itemId = sprite;
    newSprite._visible = false;
    newSprite.generateSprite();
    this._sprites.push(newSprite);
    /*const width: number = canvas.width;
    const height: number = canvas.height;
    const textureManager = LAppDelegate.getInstance().getTextureManager();
    const resourcesPath = LAppDefine.ResourcesPath;
    const spritePath = LAppDefine.SpritesDir;
    const initSprite = (textureInfo: TextureInfo): void => {
      const x: number = width * 0.5;
      const y: number = height * 0.5;
      //4:3

      this._sprites.push(new LAppSprite(x, y, textureInfo.img.naturalWidth, textureInfo.img.naturalHeight, textureInfo.id) )
    };
    textureManager.createTextureFromPngFile(
      resourcesPath + spritePath + sprite.toString()+ ".png",
      false,
      initSprite
    );*/
}
  /**
   * 画像の初期化を行う。
   */
  public initializeSprite(): void {
    const width: number = canvas.width;
    const height: number = canvas.height;

    const textureManager = LAppDelegate.getInstance().getTextureManager();
    const resourcesPath = LAppDefine.ResourcesPath;

    let imageName = '';

    this._back.generateSprite();
    this._cg.generateSprite();
    this._sprites.forEach(element => {
      element.generateSprite();
    });
    // シェーダーを作成
    if (this._programId == null) {
      this._programId = LAppDelegate.getInstance().createShader();
    }
  }


  /**
   * タッチされた時に呼ばれる。
   *
   * @param pointX スクリーンX座標
   * @param pointY スクリーンY座標
   */
  public onTouchesBegan(pointX: number, pointY: number): void {
    this._touchManager.touchesBegan(
      pointX * window.devicePixelRatio,
      pointY * window.devicePixelRatio
    );
  }

  /**
   * タッチしているときにポインタが動いたら呼ばれる。
   *
   * @param pointX スクリーンX座標
   * @param pointY スクリーンY座標
   */
  public onTouchesMoved(pointX: number, pointY: number): void {
    const viewX: number = this.transformViewX(this._touchManager.getX());
    const viewY: number = this.transformViewY(this._touchManager.getY());

    this._touchManager.touchesMoved(
      pointX * window.devicePixelRatio,
      pointY * window.devicePixelRatio
    );

    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();
    live2DManager.onDrag(viewX, viewY);
  }

  /**
   * タッチが終了したら呼ばれる。
   *
   * @param pointX スクリーンX座標
   * @param pointY スクリーンY座標
   */
  public onTouchesEnded(pointX: number, pointY: number): void {
    // タッチ終了
    const live2DManager: LAppLive2DManager = LAppLive2DManager.getInstance();
    live2DManager.onDrag(0.0, 0.0);

    {
      // シングルタップ
      const x: number = this._deviceToScreen.transformX(
        this._touchManager.getX()
      ); // 論理座標変換した座標を取得。
      const y: number = this._deviceToScreen.transformY(
        this._touchManager.getY()
      ); // 論理座標変化した座標を取得。

      if (LAppDefine.DebugTouchLogEnable) {
        LAppPal.printMessage(`[APP]touchesEnded x: ${x} y: ${y}`);
      }
      live2DManager.onTap(x, y);

      // 歯車にタップしたか
      //if (
      //  this._languageSelector.isHit(
      //    pointX * window.devicePixelRatio,
      //    pointY * window.devicePixelRatio
      //  )
      //) {
      //  live2DManager.changeLanguage();
      // }
    }
  }

  /**
   * X座標をView座標に変換する。
   *
   * @param deviceX デバイスX座標
   */
  public transformViewX(deviceX: number): number {
    const screenX: number = this._deviceToScreen.transformX(deviceX); // 論理座標変換した座標を取得。
    return this._viewMatrix.invertTransformX(screenX); // 拡大、縮小、移動後の値。
  }

  /**
   * Y座標をView座標に変換する。
   *
   * @param deviceY デバイスY座標
   */
  public transformViewY(deviceY: number): number {
    const screenY: number = this._deviceToScreen.transformY(deviceY); // 論理座標変換した座標を取得。
    return this._viewMatrix.invertTransformY(screenY);
  }

  /**
   * X座標をScreen座標に変換する。
   * @param deviceX デバイスX座標
   */
  public transformScreenX(deviceX: number): number {
    return this._deviceToScreen.transformX(deviceX);
  }

  /**
   * Y座標をScreen座標に変換する。
   *
   * @param deviceY デバイスY座標
   */
  public transformScreenY(deviceY: number): number {
    return this._deviceToScreen.transformY(deviceY);
  }

  _touchManager: TouchManager; // タッチマネージャー
  _deviceToScreen: CubismMatrix44; // デバイスからスクリーンへの行列
  _viewMatrix: CubismViewMatrix; // viewMatrix
  _programId: WebGLProgram; // シェーダID
  _back: LAppSpriteContainer; // 背景画像
  _cg: LAppSpriteContainer;
  _sprites: Array<LAppSpriteContainer>;
  //_languageSelector: LAppSprite; // 背景画像
  _changeModel: boolean; // モデル切り替えフラグ
  _isClick: boolean; // クリック中

}
