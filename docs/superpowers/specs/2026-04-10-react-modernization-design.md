# React Component Modernization Design

Date: 2026-04-10
Repository: `/Users/afiedler/Documents/privat/SL/Blinkenstar-Webedit`

## Summary

This design defines a broad internal modernization pass for the React frontend in `src/Components/` without changing the visible user experience, route structure, Redux state shape, or Flow-based toolchain.

The goal is to make the component tree easier to reason about on the current React 19, Redux 5, React Router 7, and MUI 7 stack by reducing oversized files, separating orchestration from rendering, normalizing side-effect ownership, and repairing structurally broken components discovered during the sweep.

## Goals

- Modernize component internals and patterns to fit the current React stack already present in the repository.
- Preserve the current UX, routes, and user-facing behavior unless a structural repair is required to restore intended behavior.
- Keep Flow in place and maintain compatibility with the existing Babel, ESLint, and Flow setup.
- Split oversized components into smaller hooks, helpers, or presentational subcomponents when that improves maintainability.
- Reduce duplicated logic across editor, menu, and gallery areas.
- Make effect-heavy code more explicit, predictable, and easier to verify.

## Non-Goals

- No Flow-to-TypeScript migration.
- No Redux store shape redesign.
- No route restructuring or navigation redesign.
- No visual redesign of the application.
- No new root-level test framework or new build tooling.
- No unrelated backend or API refactors beyond changes required by component modernization.

## Current Constraints

- The project is already on modern package versions, including React 19, React DOM 19, Redux 5, React Redux 9, React Router DOM 7, and MUI 7.
- Flow remains part of the active toolchain through `.flowconfig`, `.babelrc`, and `npm test`.
- Existing component code mixes rendering, derived state, asynchronous effects, and business rules in the same files.
- `PixelEditor.jsx` is the clearest oversized component and carries too many responsibilities in one module.
- `Menu.jsx` and `RightMenu.jsx` mix UI rendering with application orchestration.
- Gallery/admin components have duplicated and inconsistent responsibilities.
- `src/Components/AdminGalleryItem.jsx` is structurally wrong in the current repository and contains duplicated page logic instead of an item component.

## Desired End State

After the modernization pass:

- Route-shell components are thin and focused on composition.
- Editor components expose smaller, testable internal units for mutation logic and view state.
- Menu and toolbar components delegate synchronization and dialog behavior to focused hooks or helpers.
- Gallery and admin flows use real list/item boundaries without duplicated page-level logic.
- Shared display primitives such as previews, frames, and repeated control rows are reliable building blocks.
- Flow types remain intact, but component boundaries are clearer and less tightly coupled.

## Architecture and Component Boundaries

### 1. Application Shell

`src/Components/App.jsx` remains the route shell and MUI theme entry point.

Its responsibilities should be reduced to:

- providing the theme
- providing application chrome
- owning drawer open/close state
- deriving active route context for navigation
- delegating shared-animation import handling to a focused helper or hook

The file may keep a small amount of route-aware state, but route parsing, query-string import behavior, and layout concerns should no longer be interleaved in one large render body.

### 2. Editor Selection

`src/Components/Webedit.jsx` remains a thin editor switcher.

Its responsibility is limited to:

- selecting the current animation from Redux state and route params
- wiring `updateAnimation`
- choosing between text and pixel editors
- owning share-dialog state for the selected animation

It should not become a container for editor-specific mutation logic.

### 3. Pixel Editor

`src/Components/PixelEditor.jsx` is the main refactor target.

The current file combines:

- name and slider form updates
- playback toggle state
- frame navigation
- frame duplication and deletion
- point mutation logic
- mouse paint/erase mode handling
- direct rendering of editor controls and canvas

This should be split into smaller units with clear boundaries, for example:

- a hook or helper for frame mutation operations
- a hook for pointer and paint-mode behavior
- a small playback/view-state boundary
- shared control-row components for repeated slider and button sections
- a slimmer render component that composes these pieces

The target is not abstraction for its own sake. The target is moving stateful editing rules into focused, locally testable units and leaving the main component readable.

### 4. Text Editor

`src/Components/TextEditor.jsx` can remain mostly intact if its size stays reasonable, but it should adopt shared editor-control primitives where doing so removes duplication with the pixel editor.

The text editor should remain responsible for:

- text and name input normalization
- text animation parameter editing
- share action handoff
- preview rendering

It should not reintroduce bespoke versions of control rows already standardized for the pixel editor.

### 5. Left Navigation Menu

`src/Components/Menu.jsx` should become a smaller container over three distinct concerns:

- library bootstrap and synchronization logic
- navigation actions
- animation list rendering

Default-library injection, sync behavior, display filtering, and route navigation should not all live inline in one render-heavy file. Focused hooks or helpers should own the derived animation list and library initialization behavior.

### 6. Right Toolbar and Auth/Transfer Flows

`src/Components/RightMenu.jsx` should be reduced to action rendering plus dialog composition.

Transfer orchestration, progress state handling, and auth-dialog triggering should be separated so that:

- the main toolbar render path stays small
- transfer lifecycle rules are explicit
- dialog behavior is easier to reason about

`src/Components/AuthDialog.jsx` should keep its current UX but tighten internal async handling and local state ownership. View switching, request submission, and error-state transitions should be explicit and not depend on broad inline blocks.

### 7. Gallery and Admin Area

The gallery/admin area should be normalized into real container and item boundaries:

- `src/Components/PublicGallery.jsx` remains the public gallery page container
- `src/Components/AdminGallery.jsx` remains the admin page container
- `src/Components/Gallery.jsx` remains a gallery list wrapper or becomes a clearer list component
- `src/Components/GalleryItem.jsx` remains a reusable card/item
- `src/Components/AdminGalleryItem.jsx` must be repaired into an actual admin item/card component

Page-level data loading, derived review lists, and action dispatching belong in the page containers. Card presentation and button wiring belong in the item components. Duplicated page logic in item files is explicitly out of bounds in the desired end state.

### 8. Low-Level Display Primitives

`src/Components/AnimationPreview.jsx` and `src/Components/Frame.jsx` should remain low-level primitives.

They should be hardened by:

- keeping prop contracts clear
- limiting implicit behavior
- ensuring effects and animation loops are predictable
- remaining reusable by editor and gallery code without hidden assumptions

## Data Flow and State Rules

Redux state shape remains unchanged.

The modernization pass should instead improve how components derive and consume state:

- repeated filtering, sorting, and route-derived selection logic should move into small pure helpers or local hooks
- render functions should rely on named derived values rather than long inline chains
- editor mutation code should be isolated from view composition where practical
- cross-component coupling should happen through explicit props and shared helpers rather than duplicated inline logic

This keeps the external behavior stable while improving readability and maintainability.

## Side Effects and Async Ownership

Effect-heavy code should be normalized around clear ownership.

The main effect areas are:

- shared-animation import handling in `App.jsx`
- library bootstrap and remote sync behavior in `Menu.jsx`
- public and admin gallery loading in gallery page components
- transfer lifecycle handling in `RightMenu.jsx`
- login, signup, and password-reset behavior in `AuthDialog.jsx`

For each of these, the refactor should:

- make dependencies explicit
- keep setup and cleanup localized
- avoid stale async state updates
- keep failure branches visible
- avoid mixing effect logic directly into large JSX-heavy blocks

## Structural Repairs Allowed in Scope

This modernization pass may fix repository issues that are clearly structural, even if they are not a direct consequence of a React 19 migration.

Examples include:

- repairing `src/Components/AdminGalleryItem.jsx` into the item component the filename implies
- removing dead imports and duplicated page-level logic in component files
- correcting component responsibilities where files currently violate their own names or intended boundaries

These fixes are in scope because they are required for a coherent component structure.

## Shared UI Building Blocks

Without changing the visible UX, the sweep should standardize repeated internal building blocks where useful, especially:

- slider rows
- editor action-button rows
- preview wrappers
- gallery action areas
- route-shell or menu support helpers

These shared pieces should stay modest. The repository does not need a new design system; it needs less duplication and cleaner internal composition.

## Error Handling Expectations

Visible UX should remain familiar, but internal behavior should become safer.

The modernization should aim for:

- explicit async error branches
- consistent dialog cleanup behavior
- fewer stale closures in callbacks and effects
- less reliance on component-wide refs where scoped helpers would be clearer
- predictable state resets for auth and transfer flows

## Verification Strategy

Verification stays inside the current repository workflow.

The implementation phase should use:

- the smallest useful verification while refactoring individual areas
- `npm run build` for bundle validation
- `npm run lint` for repository linting
- `flow` via the existing `npm test` script for type checking
- a quick browser sanity pass for the main flows:
  - app shell and navigation
  - text editor
  - pixel editor
  - public gallery
  - admin gallery when available
  - auth dialog
  - transfer dialog

No new test runner should be introduced as part of this modernization.

## Implementation Shape

The eventual implementation plan should break the sweep into contained phases so the refactor remains reviewable and verifiable.

A likely phase shape is:

1. stabilize app shell and route-level composition
2. modernize menu and toolbar orchestration
3. split and modernize editor internals, especially `PixelEditor.jsx`
4. normalize gallery and admin component boundaries
5. tighten shared primitives and run full verification

The exact task list belongs in the implementation plan, not this design document.

## Risks

- Broad refactors across multiple components can create subtle behavioral regressions even when the UI appears unchanged.
- Flow-safe refactors may require extra care when extracting hooks or helper modules.
- Gallery/admin behavior is especially vulnerable because page-level derivation and card rendering are currently entangled.
- Pixel editor behavior is sensitive because frame mutation and paint interactions are tightly coupled today.

## Mitigations

- Keep route structure, Redux shape, and visible UX stable.
- Prefer extractions that preserve call sites before changing logic.
- Verify each area in isolation before full-repo verification.
- Treat structural repairs as explicit, reviewable changes instead of silent incidental edits.

## Decision

Proceed with a structured modernization of `src/Components/` that preserves Flow and the current UX while allowing maintainability-driven splits into hooks, helpers, and smaller presentational pieces.
