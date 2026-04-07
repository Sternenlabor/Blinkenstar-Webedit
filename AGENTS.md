# AGENTS.md

## Project Overview
- This repository is the `webedit-react` web editor for Blinkenstar.
- The frontend is a React + Redux + Flow application bundled with webpack.
- Frontend source lives in `src/`, with the main UI split across `src/Components/`, `src/Actions/`, `src/Reducer/`, and `src/Services/`.
- The REST backend for local/dev deployment lives in `src/api/` and `src/api/includes/`.
- Browser assets are built into `public/`.

## Key Files
- `src/index.js`
- `src/Components/App.jsx`
- `src/Components/Webedit.jsx`
- `src/Components/RightMenu.jsx`
- `src/Reducer/index.js`
- `src/Services/flash.js`
- `src/Services/modem.js`
- `src/i18n.js`
- `src/i18n/en.json`
- `src/i18n/de.json`
- `src/api/includes/config.php`
- `webpack.config.js`
- `README.md`

## Build, Run, Test
- Install dependencies: `npm install` or `yarn`
- Frontend dev server: `npm run dev`
- Alternative frontend dev server: `npm start`
- Local PHP API server: `npm run backend`
- Run frontend and backend together: `npm run dev:all`
- Frontend URL: `http://127.0.0.1:8080`
- Local API URL: `http://localhost:8000`
- Production build: `npm run build`
- Full repo check: `npm test`

## Coding Style & Naming Conventions
- Follow `.prettierrc.json`: 4-space indent, single quotes, no semicolons, no trailing commas, `printWidth` 140.
- Keep the existing folder split: UI in `src/Components`, state changes in `src/Actions` and `src/Reducer`, audio/data-transfer logic in `src/Services`, translations in `src/i18n`.
- Preserve the repo's import alias style such as `Components/...`, `Services/...`, `Actions/...`, and `Reducer`.
- Keep Flow annotations in Flow-checked files and update types when behavior changes. New Flow-checked source files should start with `/* @flow */`.
- Match the repo's current file naming: React components use `.jsx`; non-component modules generally use `.js`.
- Keep files reasonably small. If a component or service grows hard to follow, split it before adding more behavior.
- Add concise inline comments only where behavior, protocol details, or cross-file coupling would otherwise be unclear.
- Avoid unrelated refactors while working in timing-sensitive transfer/audio code or backend API code.
- When adding or changing user-facing text, update both `src/i18n/en.json` and `src/i18n/de.json`.

## Testing Guidelines
- Do not add a new root-level test runner. Prefer the existing repo scripts.
- After each code change, run the smallest useful verification first, then the relevant repo script(s) such as `npm run build` or `npm test`.
- For new features, fixes, or behavior changes, add or update focused tests where practical.
- This repo does not currently have a dedicated `tests/` directory, so small targeted tests may live close to the code they cover.
- For UI changes, do a quick browser sanity check in addition to scripted verification when possible.

## Commit & Pull Request Guidelines
- Use concise commit messages with a prefix such as `fix:`, `feat:`, `docs:`, or another clear label.
- Do not bump `package.json` version for every change by default; only do so for release-oriented work or when explicitly requested.
- Keep change summaries focused on affected frontend/API areas and include what was verified.
- Include screenshots or short visual notes for visible UI changes.

## Security & Configuration Tips
- Keep secrets and production credentials out of Git.
- `src/api/includes/config.php` contains local/default database and origin settings; adjust those per environment instead of committing production values.
- Keep frontend `API_URL` usage and backend CORS/origin settings aligned when changing local or deployed environments.
- Review authentication and session behavior carefully when touching files under `src/api/`.

## Skills
A skill is a set of local instructions stored in a `SKILL.md` file and made available by the active Codex environment.

### Relevant Skills
- `brainstorming`: Use before designing or adding new behavior.
- `test-driven-development`: Use for bug fixes and behavior changes.
- `systematic-debugging`: Use when debugging failures or unexpected behavior.
- `verification-before-completion`: Use before claiming work is complete.
- `requesting-code-review`: Use for larger or riskier changes before merge.

### Skill Trigger Rules
- If the user names a skill, or the request clearly matches one, use it for that turn.
- If multiple skills apply, use the minimal set and state the order briefly.
- If a skill cannot be loaded, note that briefly and continue with the best fallback.

### Skill Usage Rules
- Read only enough of a skill to execute the task correctly.
- Resolve skill-relative paths from the skill directory first.
- Prefer any referenced scripts, templates, or assets over re-implementing large blocks manually.
- Keep context focused and avoid pulling in unrelated references unless blocked.
