import createAudioContext from 'ios-safe-audio-context'
import { fill } from 'lodash'
import Modem from './modem'
import ModemLegacy from './modemLegacy'
import type { Animation } from 'Reducer'
import { Map } from 'immutable';
const { DEFAULT_SAMPLE_RATE, getPlaybackDurationMs, getTransferProgress } = require('./transferProgress')

var transferActive = 0
var audioCtx: AudioContext = createAudioContext(DEFAULT_SAMPLE_RATE)

type TransferCallbacks = {
    onProgress?: ((progress: number) => unknown),
    onComplete?: (() => unknown),
    onError?: ((error: Error) => unknown)
};

export default function transfer(animations: Map<string, Animation>, callbacks: TransferCallbacks = {}): boolean {
    if (transferActive === 1) {
        console.log('did not start transfer because already running!')
        if (callbacks.onError) {
            callbacks.onError(new Error('Transfer already running'))
        }
        return false
    }

    transferActive = 1

    try {
        // get data signals for the legacy firmware
        let modem = new ModemLegacy(animations)
        let data = modem.generateAudio()

        // get data signals for the v2 firmware
        let modem2 = new Modem(animations)
        let data2 = modem2.generateAudio()

        playTone(Float32Concat(data2, data), callbacks)
        return true
    } catch (error) {
        transferActive = 0
        if (callbacks.onError && error instanceof Error) {
            callbacks.onError(error)
        }
        console.error(error)
        return false
    }
}

window.playTone = function (array?: Float32Array) {
    playTone(array)
}

function playTone(array: Float32Array | undefined = window.lastArray, callbacks: TransferCallbacks = {}) {
    array = array || window.lastArray
    window.lastArray = array

    var totalDurationMs = getPlaybackDurationMs(array.length, DEFAULT_SAMPLE_RATE)
    var startedAt = Date.now()
    var completed = false
    var progressTimer

    var buffer = audioCtx.createBuffer(1, array.length, DEFAULT_SAMPLE_RATE)
    buffer.getChannelData(0).set(array)

    var source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.connect(audioCtx.destination)

    const completeTransfer = () => {
        if (completed) {
            return
        }

        completed = true
        clearInterval(progressTimer)
        transferActive = 0

        if (callbacks.onProgress) {
            callbacks.onProgress(100)
        }

        if (callbacks.onComplete) {
            callbacks.onComplete()
        }
    }

    if (callbacks.onProgress) {
        callbacks.onProgress(0)
    }

    source.onended = completeTransfer
    source.start(0)

    progressTimer = setInterval(() => {
        if (callbacks.onProgress) {
            callbacks.onProgress(getTransferProgress(Date.now() - startedAt, totalDurationMs))
        }
    }, 100)

    // iOS sometimes misses onended, so finish by elapsed playback time as well.
    setTimeout(completeTransfer, totalDurationMs + 100)
}

window.startTest = function (interval) {
    window.stopTest?.()
    interval = interval || 3500
    window.intervalHandler = setInterval(function () {
        playTone()
    }, interval)
}

window.stopTest = function () {
    clearInterval(window.intervalHandler)
}

function Float32Concat(first, second) {
    var result = new Float32Array(first.length + second.length)
    result.set(first)
    result.set(second, first.length)

    return result
}

//starting looped silence (tone with values "0") in the background
//this improves the reliability of data transmission on some hardware platforms (stabilizing sound gain ?!)
startSilence()
function startSilence() {
    let audioSilence: AudioContext = createAudioContext(DEFAULT_SAMPLE_RATE)
    let emptyArray = fill(new Array(DEFAULT_SAMPLE_RATE), 0)
    let buffer = audioSilence.createBuffer(1, emptyArray.length, DEFAULT_SAMPLE_RATE)
    buffer.getChannelData(0).set(emptyArray)
    let source = audioSilence.createBufferSource()
    source.connect(audioSilence.destination)
    source.buffer = buffer
    source.loop = true
    source.start(0)
}
