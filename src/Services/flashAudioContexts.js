function createFlashAudioContexts(createAudioContext, sampleRate) {
    let transferAudioContext = null
    let silenceAudioContext = null

    return {
        getTransferAudioContext() {
            if (!transferAudioContext) {
                transferAudioContext = createAudioContext(sampleRate)
            }

            return transferAudioContext
        },
        getSilenceAudioContext() {
            if (!silenceAudioContext) {
                silenceAudioContext = createAudioContext(sampleRate)
            }

            return silenceAudioContext
        }
    }
}

module.exports = {
    createFlashAudioContexts
}
