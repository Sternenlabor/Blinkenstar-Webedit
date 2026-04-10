# React Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the React component internals across `src/Components/` while preserving the existing UX, keeping Flow, and restoring end-to-end repo verification.

**Architecture:** Keep route structure and Redux state shape intact, then refactor from the edges inward: first restore local verification, then split orchestration from rendering in the app shell, menu, editors, and gallery/admin areas. Prefer small helpers and colocated components over introducing a new top-level architecture.

**Tech Stack:** React 19, React Router 7, Redux 5, React Redux 9, Flow, MUI 7, webpack 5

---

## File Map

### Verification and config

- Modify: `package.json`
- Modify: `.eslintrc.js`
- Modify: `.flowconfig`
- Modify: `yarn.lock`

### App shell and menu

- Modify: `src/index.js`
- Modify: `src/Components/App.jsx`
- Modify: `src/Components/Menu.jsx`
- Modify: `src/Components/AnimationInMenu.jsx`
- Create: `src/Components/app/routeState.js`
- Create: `src/Components/app/useSharedAnimationImport.js`
- Create: `src/Components/menu/menuLibrary.js`

### Shared editor UI

- Create: `src/Components/editor/EditorPanel.jsx`
- Create: `src/Components/editor/EditorSliderRow.jsx`
- Create: `src/Components/editor/EditorActionRow.jsx`
- Modify: `src/Components/TextEditor.jsx`
- Modify: `src/Components/PixelEditor.jsx`

### Pixel editor internals

- Create: `src/Components/pixelEditor/frameState.js`
- Create: `src/Components/pixelEditor/usePixelEditorDrawing.js`
- Create: `src/Components/pixelEditor/PixelEditorCanvas.jsx`
- Create: `src/Components/pixelEditor/PixelEditorFrameControls.jsx`

### Toolbar and auth

- Modify: `src/Components/RightMenu.jsx`
- Modify: `src/Components/AuthDialog.jsx`
- Create: `src/Components/rightMenu/TransferDialog.jsx`
- Create: `src/Components/rightMenu/useTransferDialog.js`

### Gallery and admin

- Modify: `src/Components/PublicGallery.jsx`
- Modify: `src/Components/AdminGallery.jsx`
- Modify: `src/Components/Gallery.jsx`
- Modify: `src/Components/GalleryItem.jsx`
- Replace: `src/Components/AdminGalleryItem.jsx`
- Create: `src/Components/gallery/GalleryGrid.jsx`
- Create: `src/Components/gallery/GalleryCardContent.jsx`

### Shared low-level behavior

- Modify: `src/Components/AnimationPreview.jsx`
- Modify: `src/Components/Frame.jsx`

## Tasks

### Task 1: Restore Verification Baseline

**Files:**
- Modify: `package.json`
- Modify: `.eslintrc.js`
- Modify: `.flowconfig`
- Modify: `yarn.lock`

- [ ] Add the missing lint tooling required by the existing repo script.
- [ ] Replace the external ESLint preset with a local config that can parse Flow and JSX in this codebase.
- [ ] Remove or update unsupported Flow config options until `flow` can start successfully on the current installed version.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `npx flow status`.

### Task 2: Thin the App Shell

**Files:**
- Modify: `src/index.js`
- Modify: `src/Components/App.jsx`
- Create: `src/Components/app/routeState.js`
- Create: `src/Components/app/useSharedAnimationImport.js`

- [ ] Extract route-state derivation from `App.jsx` into a small helper.
- [ ] Extract shared-animation import handling from `App.jsx` into a dedicated hook/helper.
- [ ] Keep the route structure and theme provider unchanged while shrinking the main layout component.
- [ ] Remove stale or unused imports introduced by the current structure.
- [ ] Run `npm run build`.

### Task 3: Modernize Menu Orchestration

**Files:**
- Modify: `src/Components/Menu.jsx`
- Modify: `src/Components/AnimationInMenu.jsx`
- Create: `src/Components/menu/menuLibrary.js`

- [ ] Move menu-specific library bootstrap and display-list derivation into focused helpers.
- [ ] Keep navigation behavior unchanged while simplifying the menu render path.
- [ ] Modernize menu item rendering to align with current MUI usage and clearer props.
- [ ] Preserve placeholder-library behavior for unauthenticated users.
- [ ] Run `npm run build`.

### Task 4: Create Shared Editor Building Blocks

**Files:**
- Create: `src/Components/editor/EditorPanel.jsx`
- Create: `src/Components/editor/EditorSliderRow.jsx`
- Create: `src/Components/editor/EditorActionRow.jsx`
- Modify: `src/Components/TextEditor.jsx`

- [ ] Introduce shared editor layout and control-row components with Flow-friendly props.
- [ ] Refactor `TextEditor.jsx` to use the shared controls without changing behavior.
- [ ] Keep existing translation keys and field behavior intact.
- [ ] Run `npm run build`.

### Task 5: Split Pixel Editor Internals

**Files:**
- Modify: `src/Components/PixelEditor.jsx`
- Create: `src/Components/pixelEditor/frameState.js`
- Create: `src/Components/pixelEditor/usePixelEditorDrawing.js`
- Create: `src/Components/pixelEditor/PixelEditorCanvas.jsx`
- Create: `src/Components/pixelEditor/PixelEditorFrameControls.jsx`

- [ ] Extract frame navigation and mutation rules into pure helpers.
- [ ] Extract paint/erase pointer behavior into a dedicated hook.
- [ ] Split canvas and frame controls into smaller components.
- [ ] Replace component-wide imperative logic with clearer derived values and smaller callbacks where possible.
- [ ] Keep playback, frame counts, and edit behavior unchanged.
- [ ] Run `npm run build`.

### Task 6: Modernize Toolbar and Auth Dialog

**Files:**
- Modify: `src/Components/RightMenu.jsx`
- Modify: `src/Components/AuthDialog.jsx`
- Create: `src/Components/rightMenu/TransferDialog.jsx`
- Create: `src/Components/rightMenu/useTransferDialog.js`

- [ ] Extract transfer dialog state and lifecycle from `RightMenu.jsx`.
- [ ] Keep transfer progress behavior unchanged while making completion/error branches explicit.
- [ ] Simplify `AuthDialog.jsx` around clear submit handlers and dialog state resets.
- [ ] Preserve current login, signup, and reset flows.
- [ ] Run `npm run build`.

### Task 7: Normalize Gallery and Admin Boundaries

**Files:**
- Modify: `src/Components/PublicGallery.jsx`
- Modify: `src/Components/AdminGallery.jsx`
- Modify: `src/Components/Gallery.jsx`
- Modify: `src/Components/GalleryItem.jsx`
- Replace: `src/Components/AdminGalleryItem.jsx`
- Create: `src/Components/gallery/GalleryGrid.jsx`
- Create: `src/Components/gallery/GalleryCardContent.jsx`

- [ ] Move shared gallery layout concerns into small reusable components.
- [ ] Repair `AdminGalleryItem.jsx` into a real item component.
- [ ] Keep page-level data loading in page containers and keep item components presentational.
- [ ] Preserve copy, publish, unpublish, and archive behaviors.
- [ ] Run `npm run build`.

### Task 8: Harden Shared Primitives and Final Verification

**Files:**
- Modify: `src/Components/AnimationPreview.jsx`
- Modify: `src/Components/Frame.jsx`

- [ ] Tighten prop handling and effect behavior in low-level display primitives.
- [ ] Remove stale imports, duplicate patterns, and dead code discovered during the refactor.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint`.
- [ ] Run `npx flow status`.
- [ ] Run `npm test` if the earlier baseline fixes make the full script viable.

## Review Notes

- The repo currently starts from a partially broken verification state because ESLint is missing and the checked-in Flow config is incompatible with the installed Flow version.
- Fixing the verification baseline is part of implementation, not extra scope, because otherwise completion claims would be unverifiable.
- If Flow remains blocked by broader repository issues after the config refresh, report the exact remaining errors and continue only with user-visible refactor work already completed.
