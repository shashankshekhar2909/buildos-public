# AIDER.md

## Role

Use Aider for small focused edits only.

Use Aider + Groq for:

- UI polish
- Carbon component fixes
- Spacing fixes
- Small CRUD endpoint fixes
- Form validation improvements
- Copy changes
- Refactors of individual files

Do not use Aider + Groq to design the full product architecture.

## Good Tasks

```txt
Fix the Carbon DataTable on the Projects page and make columns responsive.
```

```txt
Update the Prompt Library page to add category and tool filters.
```

```txt
Refactor the dashboard metric cards into a reusable component.
```

```txt
Fix FastAPI validation for ContentItem create/update.
```

## Bad Tasks

```txt
Build the entire BuildOS app from scratch.
```

```txt
Create frontend, backend, AI features, and deployment together.
```

## Important

The UI must stay aligned with `ai-tools-dir`.

Aider should not replace the Carbon style with another UI system.
