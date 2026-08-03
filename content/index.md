---
title: MyDigitalGarden
---

%% run start
~~~ts
function renderOneNote(page)
{
    let noteHtml = "";
    noteHtml = noteHtml + "<div class='note'>";
    noteHtml = noteHtml + "   <div class='image'>";
    if (page.image)
    {
        noteHtml = noteHtml + "     <img src='/Images/" + page.image + "'></img>"
    }
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "   <div class='text'>";
    noteHtml = noteHtml + "      <div class='date'>";
    noteHtml = noteHtml + page.date.toISODate();
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "      <a href='" + page.file.link.path + "'>";
    noteHtml = noteHtml + "      <div class='title'>";
    noteHtml = noteHtml + page.title;
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "      </a>";
    noteHtml = noteHtml + "      <div class='description'>";
    if (page.description)
    {
        noteHtml = noteHtml + page.description;
    }
    noteHtml = noteHtml + "      </div>";
    noteHtml = noteHtml + "   </div>";
    noteHtml = noteHtml + "</div>";
    
    return noteHtml;
}

let html = "";
console.log(dv.pages());
let pages = dv.pages().
               where(page => !page.private && !page.draft && page.showOnIndexPage == true)
               .sort(page => page.date, "desc")
               .map(page => (
	               {
		               title: page.title, 
		               image: page.image, 
		               date: page.date, 
	                   description: page.description,
	                   file: page.file
	               }))
               .limit(10);
pages.forEach((page) => {
    html = html + renderOneNote(page);
})
return html;
~~~ 
%%
<div class='note'>   <div class='image'>     <img src='/Images/MariaDB.png'></img>   </div>   <div class='text'>      <div class='date'>2026-06-02      </div>      <a href='MariaDB/Kommandozeile.md'>      <div class='title'>MariaDB Kommandozeile      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Softwarearchitecture.png'></img>   </div>   <div class='text'>      <div class='date'>2026-04-17      </div>      <a href='Softwarearchitecture/What-is-cloud-native-development.md'>      <div class='title'>What is cloud-native development?      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2026-04-15      </div>      <a href='Docker/Secrets.md'>      <div class='title'>Secrets      </div>      </a>      <div class='description'>Das Projekt "Secrets" ist ein Proof of Concept (PoC), das demonstriert, wie Docker Secrets und Configs in einer containerisierten Umgebung verwaltet und genutzt werden.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/MariaDB.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-15      </div>      <a href='MariaDB/SQL-Statements.md'>      <div class='title'>SQL-Statements      </div>      </a>      <div class='description'>Liste mit interessanten SQL statements      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Kubernetes.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-10      </div>      <a href='Kubernetes/05-Kubernetes-Cluster-with-kind.md'>      <div class='title'>Kubernetes Cluster with kind      </div>      </a>      <div class='description'>Create a Kubernetes cluster with kind      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Mqtt.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-01      </div>      <a href='SmartHome/Docker/Voltcraft2MQTT.md'>      <div class='title'>Voltcraft2MQTT      </div>      </a>      <div class='description'>Send sensor values from Voltcraft SEM6000 to Home Assistant via MQTT      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Typescript.png'></img>   </div>   <div class='text'>      <div class='date'>2025-11-08      </div>      <a href='Typescript/Create new modern TypeScript project.md'>      <div class='title'>Create a new modern TypeScript project      </div>      </a>      <div class='description'>Create a new modern TypeScript project      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-17      </div>      <a href='Dotnet/RoadProject/Seq-for-Road-Project.md'>      <div class='title'>Add Seq for Road Project      </div>      </a>      <div class='description'>Write log entries also Seq      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-17      </div>      <a href='Dotnet/RoadProject/Serilog-for-Road-Project.md'>      <div class='title'>Add Serilog to Road-Project      </div>      </a>      <div class='description'>Add Serilog to Road project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-01      </div>      <a href='Docker/Compose-Glossar.md'>      <div class='title'>Compose - Glossar      </div>      </a>      <div class='description'>Eine Übersicht über Docker-Compose      </div>   </div></div>
%% run end %%


