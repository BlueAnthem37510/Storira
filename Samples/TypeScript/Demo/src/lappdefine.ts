/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LogLevel } from '@framework/live2dcubismframework';

/**
 * Sample Appで使用する定数
 */

// Canvas width and height pixel values, or dynamic screen size ('auto').
export const CanvasSize: { width: number; height: number } | 'auto' = 'auto';

// screen
export const ViewScale = 1.0;
export const ViewMaxScale = 2.0;
export const ViewMinScale = 0.8;

export const ViewLogicalLeft = -1.0;
export const ViewLogicalRight = 1.0;
export const ViewLogicalBottom = -1.0;
export const ViewLogicalTop = 1.0;

export const ViewLogicalMaxLeft = -2.0;
export const ViewLogicalMaxRight = 2.0;
export const ViewLogicalMaxBottom = -2.0;
export const ViewLogicalMaxTop = 1.0;

// 相対パス
export const ResourcesPath = '../../Resources/';


export const BackgroundsDir = 'backgrounds/'
export const CgDir = "cg/"
export const SpritesDir = "sprites/"
export const MusicDir = 'bgm/'
export const SoundEffecrDir = "se/"
export const VoiceDir = "voice/"
export const ModelDir = "models/"


export const KarthAdventurePath = "https://karth.top/api/adventure.json";
// 歯車
export const LanguageIconName = 'earth-asia-solid.svg';

// 終了ボタン
export const PowerImageName = 'CloseNormal.png';

// モデル定義---------------------------------------------
// モデルを配置したディレクトリ名の配列
// ディレクトリ名とmodel3.jsonの名前を一致させておくこと

export const ModelDirSize: number = ModelDir.length;

// 外部定義ファイル（json）と合わせる
export const MotionGroupIdle = 'Idle'; // アイドリング
export const MotionGroupTapBody = 'TapBody'; // 体をタップしたとき

// 外部定義ファイル（json）と合わせる
export const HitAreaNameHead = 'Head';
export const HitAreaNameBody = 'Body';

//Starira Models Hit Area Ids
export const HitIdsHead = ["HitAreaHead", "HitAreaFace"]
export const HitIdsBody = ["HitAreaArmL", "HitAreaArmR", "HitAreaBust", "HitAreaWaist"]


export enum Commands{
    ShowCharacter = "showCharacter",
    HideCharacter = "hideCharacter",
    ShowCg = "showCg",
    HideCg = "hideCg",
    ShowSprite = "showSprite",
    HideSprite = "hideSprite",
    Message = "message",
    Motion = "motionCharacter",
    Background = "bg",
    Music ="beginBgm",
    EndMusic = "endBgm",
    SoundEffect = "beginSe",
    EndSoundEffect = "endSe",
    TextBox ="showMessageWindow",
    HideTextBox = "hideMessageWindow",
    FadeIn ="fadeIn",
    FadeOut = "fadeOut",
    Wait ="wait",
    Title ="showTitle"
}


export const JPPath = "jp"
export const WWPath = "ww"
export enum Languages {
    JP = "ja",
    EN = "en",
    KO = "ko",
    CH = "zh_hant"
}



export const YPosition = 0.175;
export const ModelScale = 1.2;
// モーションの優先度定数
export const PriorityNone = 0;
export const PriorityIdle = 1;
export const PriorityNormal = 2;
export const PriorityForce = 3;

// MOC3の一貫性検証オプション
export const MOCConsistencyValidationEnable = true;

// デバッグ用ログの表示オプション
export const DebugLogEnable = true;
export const DebugTouchLogEnable = false;

// Frameworkから出力するログのレベル設定
export const CubismLoggingLevel: LogLevel = LogLevel.LogLevel_Verbose;

// デフォルトのレンダーターゲットサイズ
export const RenderTargetWidth = 1900;
export const RenderTargetHeight = 1000;
export const DefaultColor = "#808080"
export const Colours = new Map([
  [101, "#FB5458"],
  [102, "#6292E9"],
  [103, "#61BF99"],
  [104, "#FE9952"],
  [105, "#CBC6CC"],
  [106, "#95CAED"],
  [107, "#FDD162"],
  [108, "#8C67AA"],
  [109, "#E08696"],
  [201, "#B497C5"],
  [202, "#F6B5E6"],
  [203, "#B4DC84"],
  [204, "#80C694"],
  [205, "#E07284"],
  [301, "#F6D860"],
  [302, "#7FCDEB"],
  [303, "#E777AB"],
  [304, "#E89D51"],
  [305, "#7BC6AD"],
  [401, "#D6D9F7"],
  [402, "#FFBB48"],
  [403, "#ED89F6"],
  [404, "#72D9DC"],
  [405, "#EA64A1"],
  [406, "#5EC3CF"],
  [407, "#DCEFF3"],
  [408, "#FFE876"],
  [409, "#E93D77"],
  [410, "#3BA83D"],
  [501, "#D4314E"],
  [502, "#229773"],
  [503, "#ECDF5C"],
  [801, "#000000"], //kirin
  [802, "#92E5E9"], //elle
]);
