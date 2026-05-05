## Entities

V1 entities:

1. Project
2. Prompt
3. ContentItem
4. AISession
5. Task
6. KnowledgeNote
7. Setting
8. Deployment (V1.5)

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

## Setting

```txt
id
key
value
is_secret
created_at
updated_at
```

## Deployment (V1.5 Service Registry)

```txt
id
project_id
environment
service_name
service_type
docker_compose_project
docker_service_name
container_name
internal_host
internal_port
internal_url
public_domain
public_url
cloudflare_tunnel_name
cloudflare_route_hostname
cloudflare_access_enabled
health_check_url
status
notes
created_at
updated_at
```

Environments:

```txt
local
staging
production
```

Service types:

```txt
frontend
backend
database
worker
tunnel
other
```

Deployment status:

```txt
planned
active
broken
retired
```

## Relationships

```txt
Project has many Prompts
Project has many ContentItems
Project has many AISessions
Project has many Tasks
Project has many KnowledgeNotes
Project has many Deployments
```
