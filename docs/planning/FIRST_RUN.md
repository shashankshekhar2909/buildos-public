# FIRST_RUN.md

## Step 1: Put These Files In BuildOS Folder

Copy all files into:

```txt
buildos/
```

Make sure your existing UI reference folder is available near the repo or inside the workspace:

```txt
ai-tools-dir
```

Recommended layout:

```txt
workspace/
  ai-tools-dir/
  buildos/
```

or:

```txt
buildos/
  ai-tools-dir/
```

Codex must be able to inspect `ai-tools-dir`.

## Step 2: Start Codex

From the workspace or buildos folder:

```bash
codex
```

## Step 3: Use Phase 1 Prompt

Open `PROMPTS_FOR_AGENTS.md`.

Use:

```txt
Prompt 1: Codex Phase 1 Frontend
```

## Step 4: Do Not Start Backend Immediately

First check UI.

Make sure:

- It uses Carbon
- It matches ai-tools-dir
- Navigation works
- Dashboard is useful
- Pages are not empty generic shells

## Step 5: Review With Claude

After Phase 1, paste the repo summary or screenshots into Claude/ChatGPT and review the UI.

Then move to Phase 2 backend.
