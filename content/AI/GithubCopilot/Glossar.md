---
showOnIndexPage: true
draft: true
date: 2026-06-12
title: Glossar
image: GithubCopilot.png
description: Eine Übersicht über Github Copilot Begriffe
tags:
  - AI
  - GithubCopilot
---

## Dateien/Konventionen über denen Anweisungen und Kontext geladen werden kann

| Datei                                    | Zweck                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `AGENTS.md`                              | Zentrale Agent-Anweisungen für Copilot Coding Agent. Wird rekursiv im Verzeichnisbaum gesucht. |
| `.github/copilot-instructions.md`        | Repositoryweite Anweisungen für GitHub Copilot. Lange Zeit der Standard vor AGENTS.md.         |
| `.github/instructions/*.instructions.md` | Spezifische, regelbasierte Anweisungen für bestimmte Dateien, Sprachen oder Pfade.             |
| `.github/prompts/*.prompt.md`            | Wiederverwendbare Prompt-Vorlagen, die man explizit referenzieren kann.                        |

### `AGENTS.md`

Beispiel:

```
repo/
+-- AGENTS.md
+-- backend/
|   +-- AGENTS.md
+-- frontend/   
+-- AGENTS.md
```

Copilot verwendet die nächstgelegene `AGENTS.md` zur aktuellen Datei und **kombiniert** sie mit übergeordneten Anweisungen.

Typische Inhalte:

```
# Coding Standards

- Verwende TypeScript strict mode.
- Nutze Vitest statt Jest.
- Schreibe Kommentare auf Englisch.
```

### `.github/copilot-instructions.md`

Älteres, aber weiterhin unterstütztes Format:

```
.github/copilot-instructions.md
```

Beispiel:

```
Dieses Repository verwendet:
- Clean Architecture
- Dependency Injection
- Unit Tests für neue Features
```

Diese Anweisungen gelten normalerweise repositoryweit.

### `.github/instructions/*.instructions.md`

Für gezielte Regeln.

Beispiel:

```
.github/instructions/
+-- react.instructions.md
+-- terraform.instructions.md
+-- tests.instructions.md
```

Inhalt:

```markdown
---
applyTo: "**/*.tsx"
---
- Nutze ausschließlich React Hooks.
- Keine Class Components.
```

oder

```markdown
---
applyTo: "tests/**/*.ts"
---
- Nutze Vitest.
- Verwende AAA Pattern.
```


### `.github/prompts/*.prompt.md`

Prompt-Bibliothek.

Beispiel:

```
.github/prompts/
+-- review.prompt.md
+-- refactor.prompt.md
+-- architecture.prompt.md
```

Inhalt:

```markdown
# Refactor
Analysiere den Code und:
- entferne Duplikate
- verbessere Lesbarkeit
- ändere keine Funktionalität
```

Diese werden typischerweise manuell im Chat referenziert.
