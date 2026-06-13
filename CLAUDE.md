# Standing conventions — pulse (frontend)

## Commits
- **Path-scoped only**: `git add <file> [<file> ...]` — never `git add -A`, never `git add .`
- **No trailers**: no `Co-Authored-By`, no `Signed-off-by`, no any trailer line, ever
- **Every commit is pushed** immediately after it is created

## Build gate
Run `npm run build` and confirm `✓ built` before committing any `.jsx`/`.js` change.

## App.jsx
Additive-only at unique anchors — never reorder, never bulk-replace.  New symbols are inserted at a clearly identified line; existing symbols are deleted only during a planned surgery phase with a build gate on both sides.

## Reports
Paste raw command output verbatim — no summaries, no "as shown above", no paraphrasing.  If output is long, paste the relevant tail; never replace it with prose.

## Module extraction (UX1b)
- Primitives/helpers/constants → `src/ui.jsx` (named exports)
- Shared session logic → `src/api.js` (named exports: `API_URL`, `SESSION_KEY`, `loadSession`, `saveSession`, `clearSession`)
- Component satellites → own files or inline per the 150-line rule
- Byte-identical copies only — no logic or style changes during extraction phases
- Phase 3 App.jsx imports: `import Detail, { AccountForm } from "./Detail"`, `import { PlaybookStepView, TASK_TYPE_CFG, generateAutoTasks } from "./ui"`, `import { API_URL, loadSession, saveSession, clearSession } from "./api"`
- Do NOT delete `PlaybookStepView`, `TASK_TYPE_CFG`, `generateAutoTasks` from App.jsx until the ui.jsx export is live (already done as of Phase 2 cleanup)
