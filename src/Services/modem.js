// @flow
/* eslint no-bitwise: 0 */
/* eslint-disable */
import _ from 'lodash';
import { List, Map } from 'immutable';

const STARTCODE1 = 0xa5;
const STARTCODE2 = 0x5a;
const PATTERNCODE1 = 0x0f;
const PATTERNCODE2 = 0xf0;
const ENDCODE = 0x84;

const HI = 0;
const LOW = 0;

const sync = [
  _.range(70).map(() => HI),
  _.range(70).map(() => LOW),
];

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

var slowshort = [];
for(var j = 0; j < 72; j += 1) {
    slowshort.push(0);
}
var slowlong = [];
for(var j = 0; j < 144; j += 1) {
    slowlong.push(0);
}

var fastshort = [];
for(var j = 0; j < 18; j += 1) fastshort.push(j*Math.sin(Math.radians(j*10)));
for(var j = 0; j < 36; j += 1) fastshort.push(18*Math.sin(Math.radians((j+18)*10)));
for(var j = 0; j < 18; j += 1) fastshort.push((18-j)*Math.sin(Math.radians((j+54)*10)));

var fastlong = [];
for(var j = 0; j < 18; j += 1) fastlong.push(j*Math.sin(Math.radians(j*10)));
for(var j = 0; j < 108; j += 1) fastlong.push(18*Math.sin(Math.radians((j+18)*10)));
for(var j = 0; j < 18; j += 1) fastlong.push((18-j)*Math.sin(Math.radians((j+126)*10)));


var bits = [
  [
	slowshort,slowlong,
//    _.range(3).map(() => LOW),
//    _.range(5).map(() => LOW),
  ], [
    fastshort,fastlong,
//    _.range(3).map(() => HI),
//    _.range(5).map(() => HI),
  ],
];

const supportedFrequencies = [16000, 22050, 24000, 32000, 44100, 48000];

const _hammingCalculateParityLowNibble = [0, 3, 5, 6, 6, 5, 3, 0, 7, 4, 2, 1, 1, 2, 4, 7];
const _hammingCalculateParityHighNibble = [0, 9, 10, 3, 11, 2, 1, 8, 12, 5, 6, 15, 7, 14, 13, 4];

export default class Modem {
  hilo: 0|1 = 0;
  data: number[];
  rawData: List<Animation>;
  constructor(animations: Map<string, Animation>) {
    this.setData(animations);
  }
  _generateSync(): number[] {
    this.hilo ^= 1;
    return sync[this.hilo];
  }
  generateSyncSignal(number: number = 1): number[] {
    return _.flatten(_.range(number).map(() => this._generateSync()));
  }

  _textFrameHeader(animation: Animation): number[] {
    return [0x01 << 4 | animation.text.length >> 8, animation.text.length & 0xFF];
  }

  _textHeader(animation: Animation): number[] {
    if (animation.speed == null || animation.delay == null || animation.direction == null || animation.repeat == null) {
      throw new Error('Missing Speed, Delay, Repeat or Direction');
    }
    return [animation.speed << 4 | (animation.delay * 2), animation.direction << 4 | animation.repeat];
  }

  _animationFrameHeader(animation: Animation): number[] {
    return [0x02 << 4 | animation.animation.data.size >> 8, animation.animation.data.size & 0xFF];
  }

  _animationHeader(animation: Animation): number[] {
    if (animation.speed == null || animation.delay == null || animation.repeat == null) {
      throw new Error('Missing Speed, Delay or Repeat');
    }
    return [animation.speed, animation.delay << 4 | animation.repeat ];
  }

  setData(animations: Map<string, Animation>) {
    const data = _.flatten(animations.toList().map(animation => {
      let d = [PATTERNCODE1, PATTERNCODE2];
      console.log(animation);
      if (animation.type === 'text') {
        d = d.concat(this._textFrameHeader(animation));
        d = d.concat(this._textHeader(animation));
        d = d.concat(_.map(animation.text, char => char.charCodeAt(0)));
      }else if (animation.type === 'pixel') {
        d = d.concat(this._animationFrameHeader(animation));
        d = d.concat(this._animationHeader(animation));
		console.log('before');
		var 
			d0 = animation.animation.data, 
			parsed = Array.isArray(d0) ? d0 : d0.toArray();
        d = d.concat(parsed);
		console.log('after');
      }
      return d;
    }).toArray());
    this.data = [STARTCODE1, STARTCODE1, STARTCODE1, STARTCODE2, ...data, ENDCODE, ENDCODE, ENDCODE];
    console.log(this.data);
  }

  modemCode(rawByte: number): number[] {
    let byte = rawByte;
    return _.flatten(_.range(8).map(() => {
      this.hilo ^= 1;
      const resultByte = bits[this.hilo][byte & 0x01];
      byte >>= 1;
      return resultByte;
    }));
  }

  _hamming128(byte: number): number {
    return _hammingCalculateParityLowNibble[byte & 0x0F] ^ _hammingCalculateParityHighNibble[byte >> 4];
  }

  _hamming2416(first: number, second: number): number {
    return this._hamming128(second) << 4 | this._hamming128(first);
  }

  hamming(first: number, second: number): number {
    return this._hamming2416(first, second);
  }
  
  generateAudio(): Float32Array {
    if (this.data.length % 2 !== 0) {
      this.data.push(0);
    }
    this.data = _.flatten(_.range(0, this.data.length, 2).map(index => {
      const first = this.data[index];
      const second = this.data[index + 1];
      return [first, second, this.hamming(first, second)];
    }));
  
    let sound = this.generateSyncSignal(70);
    // let sound = [];
    let count = 0;
    const t = {};
    this.data.forEach(byte => {
      sound = sound.concat(this.modemCode(byte));
      t[byte] = this.modemCode(byte);
       count += 1;
      // if (count === 9) {
      //  sound = sound.concat(this.generateSyncSignal(4));
      //  count = 0;
      //}
    });
    sound = sound.concat(this.generateSyncSignal(200));
    return Float32Array.from(sound);
  }
}
