/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { transformWithEsbuild } from "vite";

/** @deprecated この変数は getInstance() が非推奨になったことに伴い、非推奨となりました。 */
export let s_instance: LAppAudioHandler = null;

export class LAppAudioHandler {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   * @deprecated このクラスでのシングルトンパターンの使用は非推奨となりました。代わりに new LAppWavFileHandler() を使用してください。
   */
  public static getInstance(): LAppAudioHandler {
    if (s_instance == null) {
      s_instance = new LAppAudioHandler();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   *
   * @deprecated この関数は getInstance() が非推奨になったことに伴い、非推奨となりました。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance = void 0;
    }

    s_instance = null;
  }

  public update(deltaTimeSeconds: number) {
    let goalOffset: number;
    let rms: number;

    // データロード前/ファイル末尾に達した場合は更新しない
    if (
      this._pcmData == null ||
      this._sampleOffset >= this._wavFileInfo._samplesPerChannel
    ) {
      this._lastRms = 0.0;
      return false;
    }

    // 経過時間後の状態を保持
    this._userTimeSeconds += deltaTimeSeconds;
    goalOffset = Math.floor(
      this._userTimeSeconds * this._wavFileInfo._samplingRate
    );
    if (goalOffset > this._wavFileInfo._samplesPerChannel) {
      goalOffset = this._wavFileInfo._samplesPerChannel;
    }

    // RMS計測
    rms = 0.0;
    for (
      let channelCount = 0;
      channelCount < this._wavFileInfo._numberOfChannels;
      channelCount++
    ) {
      for (
        let sampleCount = this._sampleOffset;
        sampleCount < goalOffset;
        sampleCount++
      ) {
        const pcm = this._pcmData[channelCount][sampleCount];
        rms += pcm * pcm;
      }
    }
    rms = Math.sqrt(
      rms /
        (this._wavFileInfo._numberOfChannels *
          (goalOffset - this._sampleOffset))
    );

    this._lastRms = rms;
    this._sampleOffset = goalOffset;
    return true;
  }

  public start(filePath: string, container: HTMLAudioElement): void {
    // サンプル位参照位置を初期化
    this._sampleOffset = 0;
    this._userTimeSeconds = 0.0;

    // RMS値をリセット
    this._lastRms = 0.0;

    this.loadFile(filePath);
  }

  public getRms(): number {
    return this._lastRms;
  }
  public loadFile(filePath: string): Promise<boolean> {
    this._audioContext = new AudioContext();
    return new Promise(resolveValue => {
      let ret = false;

      if (this._pcmData != null) {
        this.releasePcmData();
      }

      // ファイルロード
      const asyncFileLoad = async () => {
        return fetch(filePath).then(responce => {
          return responce.arrayBuffer().then()}) ;
      };

      const asyncWavFileManager = (async () => {

        this._byteReader._fileByte = await asyncFileLoad();
        this._byteReader._fileDataView = new DataView(
          this._byteReader._fileByte
        );
        this._byteReader._fileSize = this._byteReader._fileByte.byteLength;
        this._byteReader._readOffset = 0;

        this._wavFileInfo._fileName = filePath;
        try{

          const decodedBuffer = await this._audioContext.decodeAudioData(this._byteReader._fileByte);
          this._wavFileInfo._numberOfChannels= decodedBuffer.numberOfChannels;
          this._wavFileInfo._samplingRate = decodedBuffer.sampleRate;
          this._wavFileInfo._samplesPerChannel = decodedBuffer.getChannelData(0).length;
          this._pcmData = new Array<Float32Array>(this._wavFileInfo._numberOfChannels);
          for (let channelIndex = 0; channelIndex < this._wavFileInfo._numberOfChannels; channelIndex++) {
            this._pcmData[channelIndex] = decodedBuffer.getChannelData(channelIndex)
          }
          ret = true;

          resolveValue(ret);

        } catch (e) {
          //probably failed because the file doesnt exist so doesnt need to clog the console. TODO add check
          //console.log(e);

        }
      })().then(() => {
        resolveValue(ret);
      });
    });
  }


  public releasePcmData(): void {
    for (
      let channelCount = 0;
      channelCount < this._wavFileInfo._numberOfChannels;
      channelCount++
    ) {
      delete this._pcmData[channelCount];
    }
    delete this._pcmData;
    this._pcmData = null;
  }

  constructor() {

    this._pcmData = null;
    this._userTimeSeconds = 0.0;
    this._lastRms = 0.0;
    this._sampleOffset = 0.0;
    this._wavFileInfo = new AudioFileInfo();
    this._byteReader = new ByteReader();

  }
  _audioContext: AudioContext;
  _pcmData: Array<Float32Array>;
  _userTimeSeconds: number;
  _lastRms: number;
  _sampleOffset: number;
  _wavFileInfo: AudioFileInfo;
  _byteReader: ByteReader;
  _loadFiletoBytes = (arrayBuffer: ArrayBuffer, length: number): void => {
    this._byteReader._fileByte = arrayBuffer;
    this._byteReader._fileDataView = new DataView(this._byteReader._fileByte);
    this._byteReader._fileSize = length;
  };
}

export class AudioFileInfo {
  constructor() {
    this._fileName = '';
    this._numberOfChannels = 0;
    this._bitsPerSample = 0;
    this._samplingRate = 0;
    this._samplesPerChannel = 0;
  }

  _fileName: string; ///< ファイル名
  _numberOfChannels: number; ///< チャンネル数
  _bitsPerSample: number; ///< サンプルあたりビット数
  _samplingRate: number; ///< サンプリングレート
  _samplesPerChannel: number; ///< 1チャンネルあたり総サンプル数
}

export class ByteReader {
  constructor() {
    this._fileByte = null;
    this._fileDataView = null;
    this._fileSize = 0;
    this._readOffset = 0;
  }

  _fileByte: ArrayBuffer; ///< ロードしたファイルのバイト列
  _fileDataView: DataView;
  _fileSize: number; ///< ファイルサイズ
  _readOffset: number; ///< ファイル参照位置

}
