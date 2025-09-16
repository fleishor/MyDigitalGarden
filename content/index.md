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
    if (page.image)
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
<div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2025-03-28      </div>      <a href='Dotnet/Keycloak/Node-Express.md'>      <div class='title'>Keycloak Node.js adapter      </div>      </a>      <div class='description'>Authenticate with Node to Keycloak      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2025-03-17      </div>      <a href='Dotnet/Keycloak/Glossar.md'>      <div class='title'>Keycloak - Glossar      </div>      </a>      <div class='description'>null      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Softwarearchitecture.png'></img>   </div>   <div class='text'>      <div class='date'>2025-01-15      </div>      <a href='Softwarearchitecture/SOLID-Principles.md'>      <div class='title'>S.O.L.I.D Principles      </div>      </a>      <div class='description'>Die SOLID-Prinzipien sind fünf grundlegende Prinzipien des objektorientierten Designs, die darauf abzielen, Software verständlicher, flexibler und wartbarer zu machen.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Telegraf.png'></img>   </div>   <div class='text'>      <div class='date'>2024-11-24      </div>      <a href='SmartHome/Docker/Add-SNMP-to-Telegraf.md'>      <div class='title'>Send SNMP statistics via Telegraf to InfluxDB      </div>      </a>      <div class='description'>Take statistics from Netgear devices with SNMP and Telegraf and forward them to InfluxDB. The statistics are also written to different buckets      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Elastic8.png'></img>   </div>   <div class='text'>      <div class='date'>2024-11-13      </div>      <a href='Elastic8/Overview.md'>      <div class='title'>Elastic8 - Übersicht      </div>      </a>      <div class='description'>Eine Übersicht über Elastic8      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/LinuxCommandLine.png'></img>   </div>   <div class='text'>      <div class='date'>2024-11-08      </div>      <a href='Linux/iPerf3.md'>      <div class='title'>iPerf(3)      </div>      </a>      <div class='description'>Verwendung von iPerf3 und iPerf; Server/Client      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Authentication.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-24      </div>      <a href='Dotnet/Authentication/JWT-based Authentication.md'>      <div class='title'>JWT based authentication      </div>      </a>      <div class='description'>A short example for JWT-based authentication; for authorization we use policy-based.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-17      </div>      <a href='SmartHome/Docker/Installations/Keycloak-with-Docker.md'>      <div class='title'>Keycloak with Docker      </div>      </a>      <div class='description'>Installation steps for Keycloak with Docker      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Authentication.png'></img>   </div>   <div class='text'>      <div class='date'>2024-10-14      </div>      <a href='Dotnet/Authentication/Cookie-based Authentication.md'>      <div class='title'>Cookie based Authentication      </div>      </a>      <div class='description'>A short example for cookie-based authentication; for authorization we use role-based and policy-based.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2024-09-29      </div>      <a href='Dotnet/Mediatr/Serilog for CQRS with MediatR.md'>      <div class='title'>Add Serilog to "CQRS with MediatR"      </div>      </a>      <div class='description'>Add Serilog to "CQRS with MediatR" project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.      </div>   </div></div>
%% run end 
last update: 2025-04-17 13:18:04
%%


