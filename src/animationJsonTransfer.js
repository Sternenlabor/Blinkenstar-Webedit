const { normalizeAnimation } = require('./animationNormalization')

function assertAnimationPayload(animation) {
    if (
        !animation ||
        typeof animation !== 'object' ||
        Array.isArray(animation) ||
        (animation.type !== 'text' && animation.type !== 'pixel') ||
        !animation.animation ||
        typeof animation.animation !== 'object'
    ) {
        throw new Error('Uploaded file is not a valid Blinkenstar animation')
    }
}

function serializeAnimationToJson(animation) {
    return JSON.stringify(animation, null, 4)
}

function createImportedAnimation(animation, createId, importedAt = Math.floor(Date.now() / 1000)) {
    assertAnimationPayload(animation)

    const originalId = typeof animation.originalId === 'string' && animation.originalId ? animation.originalId : animation.id
    const imported = {
        ...animation,
        id: createId(),
        creationDate: importedAt,
        author: undefined,
        reviewedAt: undefined,
        modifiedAt: undefined
    }

    if (originalId) {
        imported.originalId = originalId
    }

    return normalizeAnimation(imported)
}

function parseAnimationJson(json, createId, importedAt = Math.floor(Date.now() / 1000)) {
    return createImportedAnimation(JSON.parse(json), createId, importedAt)
}

function buildAnimationJsonFileName(animation) {
    const rawLabel = `${(animation && (animation.name || animation.text || animation.id)) || 'animation'}`
    const safeLabel = rawLabel
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]+/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)

    return `${safeLabel || 'animation'}.json`
}

module.exports = {
    buildAnimationJsonFileName,
    createImportedAnimation,
    parseAnimationJson,
    serializeAnimationToJson
}
