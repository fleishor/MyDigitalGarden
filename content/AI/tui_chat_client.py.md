---
showOnIndexPage: true
draft: true
date: 2026-10-21
title: TUI chat client
image: AI.png
description: Einfacher TUI chat client demonstrating function calls and MCP
tags:
  - AI
---
## TUI Chat Client

- Der Chat Client sendet den Gesprächsverlauf an die OpenAI Responses API und bekommt eine Antwort zurück

### `get_answer()` 

- verarbeitet asynchron eine Chat-Nachricht und zeigt die Antwort der OpenAI Responses API im Chatfenster an
- Ablauf

1. Hole Instanzen von Chat-Output, Status-Line, Prompt-Input
2. Sie kopiert `self.history` in `request_input`. Somit wird der bisherige Verlauf der Kommunikation (Prompts und die zugehörigen Antworten) erneut zum LLM übertragen. Das LLM selbst ist zustandlos und weis von der bisherigen Kommunikation nichts. Kurzum mit jeder Kommunikation wird der Request größer und mehr Tokens werden verbraucht.
3. Sie ruft `self.client.responses.create` mit dem konfigurierten Modell (`MODEL`), den Systemanweisungen (`SYSTEM_PROMPT`) und dem bisherigen Verlauf auf. `store=False` verhindert die serverseitige Speicherung; `reasoning` ist auf `none` gesetzt. Es werden keine Tools übergeben.
4. Die Textantwort wird aus `response.output_text` gelesen und von Leerzeichen am Anfang und Ende bereinigt. Ist sie leer, wird ein Ersatztext angezeigt.
5. Die Antwort wird an `self.history` angehängt. Überschreitet der Verlauf `MAX_HISTORY_MESSAGES`, werden jeweils die ersten zwei Nachrichten entfernt, damit vollständige Benutzer-/Assistenten-Paare erhalten bleiben.
6. Die Antwort wird als Rich-Markdown im Chat angezeigt. Falls die API Nutzungsdaten geliefert hat, zeigt die Methode zusätzlich Eingabe-, Cache-, Ausgabe-, Reasoning- und Gesamttokens an.

### TUI Chat Client mit function calling

- Der Chat Client sendet den Gesprächsverlauf an die OpenAI Responses API und stellt ihr das Tool `read_file` über `TOOLS` zur Verfügung.
- Die API kann entweder direkt eine Antwort liefern oder einen Function Call anfordern. 
- Im zweiten Fall führt der Client das Tool lokal aus, sendet das Ergebnis zurück an die API und fragt erneut an. 
- Dieser Ablauf wiederholt sich, bis eine Antwort ohne weitere Function Calls vorliegt.

### `get_answer()` 

- verarbeitet asynchron eine Chat-Nachricht und zeigt die Antwort der OpenAI Responses API im Chatfenster an
- Ablauf

1. Holt die Widgets für Chat, Status und Eingabe.
2. Erstellt `request_input` als Kopie von `self.history`. Die Kopie wird für die mehrstufige API-Unterhaltung verwendet, ohne den Verlauf vorzeitig zu verändern.
3. Ruft `self.client.responses.create` mit Modell, Systemanweisungen, `request_input`, `TOOLS`, `store=False` und deaktiviertem Reasoning auf.
4. Übergibt die Antwort an `_handle_function_calls`.
   - `True`: Mindestens ein Function Call wurde verarbeitet. Die Schleife stellt den aktualisierten Request-Inhalt erneut an die API.
   - `False`: Es gab keinen Function Call. Die Schleife endet und die finale Textantwort wird verarbeitet.
5. Liest `response.output_text`, entfernt führende und folgende Leerzeichen und verwendet einen Ersatztext, falls die Antwort leer ist.
6. Fügt die Assistentenantwort zu `self.history` hinzu. Bei mehr als `MAX_HISTORY_MESSAGES` Einträgen werden jeweils die ersten zwei Nachrichten entfernt; damit bleibt der Verlauf auf vollständige Benutzer-/Assistenten-Paare ausgerichtet.
7. Zeigt die Antwort als Rich-Markdown an. Sind Nutzungsdaten vorhanden, zeigt die Methode zusätzlich Tokenzahlen einschließlich Cache- und Reasoning-Tokens an.


## Inspect MCP server
npx -y @modelcontextprotocol/inspector

