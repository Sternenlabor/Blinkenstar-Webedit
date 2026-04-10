const DEFAULT_SAMPLE_RATE = 48000

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

function getPlaybackDurationMs(sampleCount, sampleRate = DEFAULT_SAMPLE_RATE) {
    if (sampleRate <= 0) {
        return 0
    }

    return (sampleCount / sampleRate) * 1000
}

function getTransferProgress(elapsedMs, totalDurationMs) {
    if (totalDurationMs <= 0) {
        return 100
    }

    return clamp((elapsedMs / totalDurationMs) * 100, 0, 100)
}

module.exports = {
    DEFAULT_SAMPLE_RATE,
    getPlaybackDurationMs,
    getTransferProgress
}
