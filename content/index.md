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
<div class='note'>   <div class='image'>     <img src='/Images/MariaDB.png'></img>   </div>   <div class='text'>      <div class='date'>2026-11-25      </div>      <a href='MariaDB/Optimizer.md'>      <div class='title'>Optimizer      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/AI.png'></img>   </div>   <div class='text'>      <div class='date'>2026-11-09      </div>      <a href='AI/tui_chat_client.md'>      <div class='title'>TUI chat client      </div>      </a>      <div class='description'>Einfacher TUI chat client demonstrating function calls and MCP      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Grafana.png'></img>   </div>   <div class='text'>      <div class='date'>2026-08-07      </div>      <a href='Softwarearchitecture/Grafana Tools.md'>      <div class='title'>Grafana Tools and Toolstacks      </div>      </a>      <div class='description'>Eine kurze Übersicht über alle Grafana Tools bzw. die Grafana Toolstacks      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/ArgoCD.png'></img>   </div>   <div class='text'>      <div class='date'>2026-07-21      </div>      <a href='Kubernetes/ArgoCD.md'>      <div class='title'>Continuous Delivery mit ArgoCD      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/MariaDB.png'></img>   </div>   <div class='text'>      <div class='date'>2026-06-02      </div>      <a href='MariaDB/Kommandozeile.md'>      <div class='title'>MariaDB Kommandozeile      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Softwarearchitecture.png'></img>   </div>   <div class='text'>      <div class='date'>2026-04-17      </div>      <a href='Softwarearchitecture/What-is-cloud-native-development.md'>      <div class='title'>What is cloud-native development?      </div>      </a>      <div class='description'>      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2026-04-15      </div>      <a href='Docker/Secrets.md'>      <div class='title'>Secrets      </div>      </a>      <div class='description'>Das Projekt "Secrets" ist ein Proof of Concept (PoC), das demonstriert, wie Docker Secrets und Configs in einer containerisierten Umgebung verwaltet und genutzt werden.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/MariaDB.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-15      </div>      <a href='MariaDB/SQL-Statements.md'>      <div class='title'>SQL-Statements      </div>      </a>      <div class='description'>Liste mit interessanten SQL statements      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Kubernetes.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-10      </div>      <a href='Kubernetes/05-Kubernetes-Cluster-with-kind.md'>      <div class='title'>Kubernetes Cluster with kind      </div>      </a>      <div class='description'>Create a Kubernetes cluster with kind      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Mqtt.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-01      </div>      <a href='SmartHome/Docker/Voltcraft2MQTT.md'>      <div class='title'>Voltcraft2MQTT      </div>      </a>      <div class='description'>Send sensor values from Voltcraft SEM6000 to Home Assistant via MQTT      </div>   </div></div>
%% run end %%


