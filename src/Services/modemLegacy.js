// @flow
/* eslint no-bitwise: 0 */
/* eslint-disable */
import _ from 'lodash'
import { List, Map } from 'immutable'
import type { Animation } from 'Reducer'

const STARTCODE = 0x99
const PATTERNCODE = 0xa9
const ENDCODE = 0x84

const HI = 1
const LOW = -1

const sync = [_.range(17).map(() => LOW), _.range(17).map(() => HI)]
const bits = [
    [_.range(3).map(() => LOW), _.range(5).map(() => LOW)],
    [_.range(3).map(() => HI), _.range(5).map(() => HI)]
]

const supportedFrequencies = [16000, 22050, 24000, 32000, 44100, 48000]

const _hammingCalculateParityLowNibble = [0, 3, 5, 6, 6, 5, 3, 0, 7, 4, 2, 1, 1, 2, 4, 7]
const _hammingCalculateParityHighNibble = [0, 9, 10, 3, 11, 2, 1, 8, 12, 5, 6, 15, 7, 14, 13, 4]

export default class ModemLegacy {
    hilo: 0 | 1 = 0
    data: number[]
    rawData: List<Animation>
    constructor(animations: Map<string, Animation>) {
        this.setData(animations)
    }
    _generateSync(): number[] {
        this.hilo ^= 1
        return sync[this.hilo]
    }
    generateSyncSignal(number: number = 1): number[] {
        return _.flatten(_.range(number).map(() => this._generateSync()))
    }

    _textFrameHeader(animation: Animation): number[] {
        return [(0x01 << 4) | (animation.text.length >> 8), animation.text.length & 0xff]
    }

    _textHeader(animation: Animation): number[] {
        if (animation.speed == null || animation.delay == null || animation.direction == null) {
            throw new Error('Missing Speed, Delay or Direction')
        }
        return [(animation.speed << 4) | (animation.delay * 2), (animation.direction << 4) | 0x00]
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
        if (animation.speed == null || animation.delay == null) {
            throw new Error('Missing Speed or Delay')
        }
        return [animation.speed, animation.delay]
    }

    setData(animations: Map<string, Animation>) {
        const data = _.flatten(
            animations
                .toList()
                .map((animation) => {
                    let d = [PATTERNCODE, PATTERNCODE]
                    console.log(animation)
                    if (animation.type === 'text') {
                        if (!animation.text) {
                            console.warn('Animation has no text')
                            return d
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
        this.data = [STARTCODE, STARTCODE, ...data, ENDCODE, ENDCODE]
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

        let sound = this.generateSyncSignal(1000)
        let count = 0
        const t = {}

        this.data.forEach((byte) => {
            sound = sound.concat(this.modemCode(byte))
            t[byte] = this.modemCode(byte)
            count += 1
            if (count === 9) {
                sound = sound.concat(this.generateSyncSignal(4))
                count = 0
            }
        })
        sound = sound.concat(this.generateSyncSignal(4))

        //  the next lines are a workaround because
        //    return Float32Array.from(sound);
        //  did not work on iOS ...
        let dummy = new Float32Array(sound.length)
        dummy.set(sound)
        return dummy
    }
}
