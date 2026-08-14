---
name: graphify
description: Use for questions about the codebase, architecture, file relationships, data flow, and project content. Prefer an existing graphify-out/graph.json when present; otherwise use the official Graphify CLI to build a local knowledge graph.
---

# Graphify

Project-scoped integration for the official Graphify tool from `Graphify-Labs/graphify`.

Graphify turns source code, documentation, SQL/config files and supported media into a persistent knowledge graph. Code analysis is local and deterministic using AST/tree-sitter. The graph can be queried to understand architecture, dependencies, paths and relationships without repeatedly scanning the whole repository.

## Prerequisite

The skill does not bundle the Python CLI. Install the official package in the environment running Codex:

```bash
uv tool install graphifyy
# alternative: pipx install graphifyy
```

The official PyPI package is `graphifyy` (double y); the command is `graphify`.

## Primary workflow

When asked about this repository's architecture or relationships:

1. Check for `graphify-out/graph.json` in the project root.
2. If it exists, query the existing graph before manually reading many source files.
3. If it does not exist and the user wants a graph, build it with `graphify .`.
4. Use focused graph commands for follow-up questions.

Useful commands:

```bash
graphify .
graphify . --update
graphify . --mode deep
graphify query "How does product search work?"
graphify path "HomePremium" "fetchCatalog"
graphify explain "HomePremium"
graphify . --wiki
graphify . --mcp
```

Graphify normally writes:

```text
graphify-out/
├── graph.html
├── GRAPH_REPORT.md
└── graph.json
```

`graph.html` is an interactive graph, `GRAPH_REPORT.md` summarizes important concepts and relationships, and `graph.json` is the persistent queryable graph.

## Guidance for this project

Use Graphify especially before broad refactors, CSS/component cleanup, architecture changes, catalog/search changes, or when a request spans many files. Prefer graph queries to blind repository-wide reading when a current graph exists.

Do not treat inferred edges as facts without checking their confidence/provenance. Graphify distinguishes explicit/extracted relationships from inferred relationships.

Do not modify application behavior merely to satisfy Graphify. The tool is for understanding and navigating the project; normal build, lint and test validation still applies after code changes.

## Official source

Repository: `Graphify-Labs/graphify`
Official project install command for Codex when the CLI is available:

```bash
graphify install --project --platform codex
```
