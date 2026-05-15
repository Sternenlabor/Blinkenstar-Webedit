const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

function loadAnimationOrderModule() {
    const outDir = fs.mkdtempSync(path.join(__dirname, '.tmp-blinken-menu-order-'))
    const outFile = path.join(outDir, 'animationOrder.cjs')

    execFileSync('npx', ['babel', 'src/Components/menu/animationOrder.ts', '--out-file', outFile, '--presets', '@babel/preset-env,@babel/preset-typescript'], {
        cwd: __dirname
    })

    const moduleExports = require(outFile)
    fs.rmSync(outDir, { recursive: true, force: true })

    return moduleExports
}

test('sortAnimationsForMenu preserves existing order until explicit sortOrder values exist', () => {
    const { sortAnimationsForMenu } = loadAnimationOrderModule()
    const animations = [
        { id: 'ball', name: 'Ball' },
        { id: 'sinus', name: 'Sinus' },
        { id: 'andre', name: 'Andre' }
    ]

    assert.deepEqual(sortAnimationsForMenu(animations).map((animation) => animation.id), ['ball', 'sinus', 'andre'])
})

test('sortAnimationsForMenu uses sortOrder and keeps unsorted animations stable behind sorted ones', () => {
    const { sortAnimationsForMenu } = loadAnimationOrderModule()
    const animations = [
        { id: 'ball', name: 'Ball', sortOrder: 2 },
        { id: 'sinus', name: 'Sinus' },
        { id: 'andre', name: 'Andre', sortOrder: 0 },
        { id: 'smilie', name: 'Smilie' }
    ]

    assert.deepEqual(sortAnimationsForMenu(animations).map((animation) => animation.id), ['andre', 'ball', 'sinus', 'smilie'])
})

test('moveAnimation repositions an item without mutating the original list', () => {
    const { moveAnimation } = loadAnimationOrderModule()
    const animations = [{ id: 'ball' }, { id: 'sinus' }, { id: 'andre' }, { id: 'smilie' }]

    const moved = moveAnimation(animations, 1, 3)

    assert.deepEqual(moved.map((animation) => animation.id), ['ball', 'andre', 'smilie', 'sinus'])
    assert.deepEqual(animations.map((animation) => animation.id), ['ball', 'sinus', 'andre', 'smilie'])
})

test('applyAnimationSortOrder assigns sequential order values', () => {
    const { applyAnimationSortOrder } = loadAnimationOrderModule()
    const animations = [{ id: 'andre', sortOrder: 4 }, { id: 'ball', sortOrder: 9 }]

    assert.deepEqual(
        applyAnimationSortOrder(animations).map((animation) => [animation.id, animation.sortOrder]),
        [
            ['andre', 0],
            ['ball', 1]
        ]
    )
})
