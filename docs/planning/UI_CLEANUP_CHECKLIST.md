# UI Cleanup Checklist

Status legend: [x] done · [ ] todo · [!] needs verify
Owner: Codex/Claude can resume from any unchecked item without re-reading the diff.

## Foundations
- [x] Rewrite `frontend/styles/globals.scss` with Carbon tokens, breakpoint mixins, utility classes
  (.app-content, .page-header*, .section, .section-heading, .dashboard-grid, .metric-tile*,
  .action-tile*, .tile-clickable, .knowledge-card*, .detail-tile, .tag-row, .empty-state*,
  .column--stack, .settings-input)

## Shell
- [x] `components/shell/app-shell.tsx` → Carbon `Theme` + `Header` + `HeaderName` + `SideNav` + `<main className="app-content cds--content">`
- [x] `components/shell/sidebar-nav.tsx` → `SideNavLink` with `@carbon/icons-react` icons; active rule on usePathname

## Shared components
- [x] `components/shared/page-header.tsx` → optional `breadcrumbs` prop; classes only; `Button size="sm"`
- [x] `components/shared/entity-table.tsx` → adds `title` / `description` / `toolbar` props; `TableContainer` + conditional `TableToolbar`
- [x] `components/shared/search-toolbar.tsx` → returns `TableToolbarContent` with `TableToolbarSearch` + Selects (no outer wrapper)
- [x] `components/shared/empty-state.tsx` → optional `icon` prop; `Tile.empty-state`; `Button kind="ghost" size="sm"`
- [x] `components/shared/tags.tsx` → updated colour map (in_progress=teal, blocked=warm-gray, done=gray); `size="sm"`

## Dashboard tiles
- [x] `components/dashboard/metric-tile.tsx` → `.metric-tile` classes, no inline styles
- [x] `components/dashboard/action-tile.tsx` → `.action-tile` classes, no inline styles

## Pages
- [x] `app/page.tsx` → `<section>` + `.section-heading`, six metrics (labels: Projects/Open Tasks/Drafts/Prompts/Sessions/Notes), 4 system tiles ("Running"), 3 quick actions at lg=4, Current Tasks via `EntityTable` (no Tile wrapper)
- [x] `app/projects/page.tsx` → extract `rows`, drop `Tile`, `SearchToolbar` via `toolbar` prop
- [x] `app/projects/[slug]/page.tsx` → breadcrumbs, `.detail-tile` + `.tag-row`, `StructuredList` in tab panels, dropped duplicate "Generate Context Files" button
- [x] `app/prompts/page.tsx` → extract rows, drop Tile, toolbar pattern
- [x] `app/content/page.tsx` → same pattern
- [x] `app/ai-sessions/page.tsx` → same pattern
- [x] `app/tasks/page.tsx` → same pattern
- [x] `app/knowledge/page.tsx` → `.knowledge-card` classes, `TableToolbar` wrapping `SearchToolbar`, removed unconditional `EmptyState`
- [x] `app/settings/page.tsx` → `.settings-input` + `.section-heading`, no inline styles

## Verification
- [x] `npm run build` — passes
- [x] `npm run lint` — passes

## Known deviations (intentional)
- `HeaderName` uses plain `href="/"` (Carbon's typed children/`as` rejects polymorphic Link); navigation works the same.
- `SideNavLink` uses an `as any` cast to accept `as={Link}` + `href` together. Runtime is correct.
- `KnowledgeNote` type has no `category` field, so the project-detail Knowledge tab `StructuredList` shows `project ?? "General"` in the second cell.

## Out of scope (do NOT touch)
- `lib/mock-data.ts`, `lib/types.ts`, `lib/api.ts`, `next.config.ts`, `Dockerfile`, `package.json`
- Any backend / FastAPI / auth / AI calls
- Replacing Carbon or adding shadcn / new design system
- Route changes

## Resume instructions
If a future agent picks this up:
1. Re-read this checklist top-to-bottom; only act on unchecked items.
2. Re-run `cd frontend && npm run build && npm run lint` before declaring done.
3. Update boxes here as you go (`[ ]` → `[x]`).
