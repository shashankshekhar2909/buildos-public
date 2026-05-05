# AI_WORKFLOWS.md

## AI Feature Priority

The first AI feature must be:

```txt
Project Context Generator
```

This is the highest ROI feature because Shashank uses Codex, Claude, Aider, and Groq heavily.

## Why This Comes First

It helps generate structured files for any project:

```txt
AGENTS.md
CLAUDE.md
CODEX.md
PLAN.md
ARCHITECTURE.md
UI_SPEC.md
API_SPEC.md
DATA_MODEL.md
```

That means every project can become easier for AI coding tools to understand.

## Provider

Use LiteLLM later.

Config:

```env
LITELLM_BASE_URL=http://localhost:4000/v1
LITELLM_API_KEY=change-me
DEFAULT_AI_MODEL=groq/llama-3.3-70b-versatile
```

## Project Context Generator Flow

```txt
User selects a project
  ↓
Clicks Generate Context Files
  ↓
Chooses target agent: Codex / Claude / Aider
  ↓
Selects files to generate
  ↓
Backend builds prompt from project data
  ↓
Backend calls LiteLLM
  ↓
Generated markdown files return
  ↓
User reviews
  ↓
User copies/exports/saves AI session
```

## Prompt Rules

Generated files should be:

- Practical
- Implementation-ready
- Specific to the project
- Cleanly structured
- Free of secrets
- Compatible with AI coding agents
- Not generic

## Other AI Features Later

### Generate Content Draft

Inputs:

```txt
topic
platform
tone
goal
project_id
```

Outputs:

```txt
hook
body
cta
hashtags
```

### Improve Prompt

Inputs:

```txt
rough_prompt
target_tool
goal
constraints
```

Outputs:

```txt
improved_prompt
variables
checklist
```

### Notes To Tasks

Inputs:

```txt
notes
project_id
```

Outputs:

```txt
tasks with priority and status
```
