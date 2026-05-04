# DATA_MODEL.md

## Entities

V1 entities:

1. Project
2. Prompt
3. ContentItem
4. AISession
5. Task
6. KnowledgeNote
7. Setting

## Project

```txt
id
name
slug
description
goal
status
category
priority
tech_stack
public_url
github_url
local_path
created_at
updated_at
```

Status:

```txt
idea
active
paused
shipped
archived
```

Category:

```txt
portfolio
homelab
product
career
content
client
learning
business
```

Priority:

```txt
low
medium
high
critical
```

## Prompt

```txt
id
title
slug
category
body
variables
recommended_tool
recommended_model
project_id
tags
rating
created_at
updated_at
```

Category:

```txt
coding
architecture
content
resume
seo
research
image
homelab
interview
business
```

Tool:

```txt
codex
claude
aider
groq
chatgpt
openwebui
custom
```

## ContentItem

```txt
id
title
platform
content_type
status
hook
body
cta
hashtags
project_id
scheduled_date
published_at
published_url
tags
created_at
updated_at
```

Platform:

```txt
linkedin
x
blog
youtube
instagram
reddit
newsletter
website
```

Status:

```txt
idea
draft
review
ready
scheduled
published
repurpose
archived
```

## AISession

```txt
id
title
tool
model
input_prompt
output_text
summary
project_id
source_module
tags
rating
created_at
updated_at
```

Source module:

```txt
manual
project_context_generator
content_lab
prompt_improver
notes_to_tasks
```

## Task

```txt
id
title
description
status
priority
project_id
due_date
completed_at
created_at
updated_at
```

Status:

```txt
todo
in_progress
blocked
done
cancelled
```

## KnowledgeNote

```txt
id
title
content
source_type
project_id
tags
created_at
updated_at
```

Source type:

```txt
manual
markdown
chat
research
meeting
codebase
homelab
interview
```

## Setting

```txt
id
key
value
is_secret
created_at
updated_at
```

Setting keys:

```txt
ai.litellm_base_url
ai.default_model
ai.temperature
ai.max_tokens
app.theme
backup.path
```

## Relationships

```txt
Project has many Prompts
Project has many ContentItems
Project has many AISessions
Project has many Tasks
Project has many KnowledgeNotes
```
