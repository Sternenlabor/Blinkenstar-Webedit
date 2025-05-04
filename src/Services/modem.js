// @flow
/* eslint no-bitwise: 0 */
/* eslint-disable */

/* new modem function,
 *  cures transfer problems with different audio hardware
 *  (old class moved to modemLegacy.js)
 *
 *  main differences to old transfer protocol:
 *    - faded sine waves are used for bit encoding instead of rectangles
 *    - transfer protocol and state machine modified
 *    - sync signal is not necessary anymore (replaced by silence)
 *
 *  see firmware implementation, blinkenstar-firmware repository,
 *    /doc/blinkenstar_debugging.pdf
 */

import _ from 'lodash'
import { List, Map } from 'immutable'
import type { Animation } from 'Reducer'

const STARTCODE1 = 0xa5
const STARTCODE2 = 0x5a
const PATTERNCODE1 = 0x0f
const PATTERNCODE2 = 0xf0
const ENDCODE = 0x84

// $FlowFixMe
Math.radians = function (degrees) {
    return (degrees * Math.PI) / 180
}

// silence, short duration (low activity for bit encoding)
var lowShort = []
for (var j = 0; j < 72; j += 1) {
    lowShort.push(0)
}
// silence, long duration (low activity for bit encoding)
var lowLong = []
for (var j = 0; j < 144; j += 1) {
    lowLong.push(0)
}

// faded sine wave, short duration (high activity for bit encoding)
var highShort = []
for (var j = 0; j < 18; j += 1) highShort.push((j / 18.0) * Math.sin(Math.radians(j * 10)))
for (var j = 0; j < 36; j += 1) highShort.push(Math.sin(Math.radians((j + 18) * 10)))
for (var j = 0; j < 18; j += 1) highShort.push(((18 - j) / 18.0) * Math.sin(Math.radians((j + 54) * 10)))

// faded sine wave, long duration (high activity for bit encoding)
var highLong = []
for (var j = 0; j < 18; j += 1) highLong.push((j / 18.0) * Math.sin(Math.radians(j * 10)))
for (var j = 0; j < 108; j += 1) highLong.push(Math.sin(Math.radians((j + 18) * 10)))
for (var j = 0; j < 18; j += 1) highLong.push(((18 - j) / 18.0) * Math.sin(Math.radians((j + 126) * 10)))

var bits = [
    [lowShort, lowLong],
    [highShort, highLong]
]

const supportedFrequencies = [16000, 22050, 24000, 32000, 44100, 48000]

const _hammingCalculateParityLowNibble = [0, 3, 5, 6, 6, 5, 3, 0, 7, 4, 2, 1, 1, 2, 4, 7]
const _hammingCalculateParityHighNibble = [0, 9, 10, 3, 11, 2, 1, 8, 12, 5, 6, 15, 7, 14, 13, 4]

export default class Modem {
    hilo: 0 | 1 = 0
    data: number[]
    rawData: List<Animation>
    constructor(animations: Map<string, Animation>) {
        this.setData(animations)
    }

    // sync signal
    generateSyncSignal(number: number = 1): number[] {
        var ssig = []
        for (var j = 0; j < number * 360; j += 1)
            if (j < number / 2)
                ssig.push(Math.sin(Math.radians(j / 4))) // a slow sine in the fist half
            else ssig.push(0) // then mute in the second half - worked on most platforms
        return ssig
    }

    _textFrameHeader(animation: Animation): number[] {
        return [(0x01 << 4) | (animation.text.length >> 8), animation.text.length & 0xff]
    }

    _textHeader(animation: Animation): number[] {
        if (!animation.repeat) animation.repeat = 0
        if (animation.speed == null || animation.delay == null || animation.direction == null || animation.repeat == null) {
            throw new Error('Missing Speed, Delay, Repeat or Direction')
        }
        return [(animation.speed << 4) | (animation.delay * 2), (animation.direction << 4) | animation.repeat]
    }

    _animationFrameHeader(animation: Animation): number[] {
        // return [0x02 << 4 | animation.animation.data.size >> 8, animation.animation.data.size & 0xFF];
        // this caused problem when animation window was not
        // displayed before transfer (type of data already array)
        // below a quick fix:
        var d0 = animation.animation.data,
            parsed = Array.isArray(d0) ? d0 : d0.toArray()
        return [(0x02 << 4) | (parsed.length >> 8), parsed.length & 0xff]
    }

    _animationHeader(animation: Animation): number[] {
        if (!animation.repeat) animation.repeat = 0
        if (animation.speed == null || animation.delay == null || animation.repeat == null) {
            throw new Error('Missing Speed, Delay or Repeat')
        }
        return [animation.speed, (animation.delay << 4) | animation.repeat]
    }

    setData(animations: Map<string, Animation>) {
        const data = _.flatten(
            animations
                .toList()
                .map((animation) => {
                    let d = [PATTERNCODE1, PATTERNCODE2]
                    console.log(animation)
                    if (animation.type === 'text') {
                        if (!animation.text) {
                            console.warn('Animation has no text')
                            animation.text = ' '
                        }
                        d = d.concat(this._textFrameHeader(animation))
                        d = d.concat(this._textHeader(animation))
                        // $FlowFixMe
                        d = d.concat(_.map(animation.text, (char) => char.charCodeAt(0)))
                    } else if (animation.type === 'pixel') {
                        d = d.concat(this._animationFrameHeader(animation))
                        d = d.concat(this._animationHeader(animation))
                        // d = d.concat(animation.animation.data.toArray());
                        // this caused problem when animation window was not
                        // displayed before transfer (type of data already array)
                        // below a quick fix:
                        var d0 = animation.animation.data,
                            parsed = Array.isArray(d0) ? d0 : d0.toArray()
                        d = d.concat(parsed)
                    }
                    return d
                })
                .toArray()
        )

        // build frames using new transfer protocol, for details see blinkenstar-firmware
        this.data = [STARTCODE1, STARTCODE1, STARTCODE1, STARTCODE2, ...data, ENDCODE, ENDCODE, ENDCODE]
        console.log(this.data)
    }

    modemCode(rawByte: number): number[] {
        let byte = rawByte
        return _.flatten(
            _.range(8).map(() => {
                this.hilo ^= 1
                const resultByte = bits[this.hilo][byte & 0x01]
                byte >>= 1
                return resultByte
            })
        )
    }

    _hamming128(byte: number): number {
        return _hammingCalculateParityLowNibble[byte & 0x0f] ^ _hammingCalculateParityHighNibble[byte >> 4]
    }

    _hamming2416(first: number, second: number): number {
        return (this._hamming128(second) << 4) | this._hamming128(first)
    }

    hamming(first: number, second: number): number {
        return this._hamming2416(first, second)
    }

    generateAudio(): Float32Array {
        if (this.data.length % 2 !== 0) {
            this.data.push(0)
        }
        this.data = _.flatten(
            _.range(0, this.data.length, 2).map((index) => {
                const first = this.data[index]
                const second = this.data[index + 1]
                return [first, second, this.hamming(first, second)]
            })
        )

        let sound = this.generateSyncSignal(200)
        const t = {}
        this.data.forEach((byte) => {
            sound = sound.concat(this.modemCode(byte))
            t[byte] = this.modemCode(byte)
        })
        // sound = sound.concat(this.generateSyncSignal(200));

        //  the next lines are a workaround because
        //    return Float32Array.from(sound);
        //  did not work on iOS ...
        let dummy = new Float32Array(sound.length)
        dummy.set(sound)
        return dummy
    }
}
