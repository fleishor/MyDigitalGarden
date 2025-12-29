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
<div class='note'>   <div class='image'>     <img src='/Images/Image.png'></img>   </div>   <div class='text'>      <div class='date'>2025-12-01      </div>      <a href='SmartHome/Docker/Voltcraft2MQTT.md'>      <div class='title'>Voltcraft2MQTT      </div>      </a>      <div class='description'>Send sensor values from Voltcraft SEM6000 to Home Assistant via MQTT      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-17      </div>      <a href='Dotnet/RoadProject/Seq-for-Road-Project.md'>      <div class='title'>Add Seq for Road Project      </div>      </a>      <div class='description'>Write log entries also Seq      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Serilog.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-17      </div>      <a href='Dotnet/RoadProject/Serilog-for-Road-Project.md'>      <div class='title'>Add Serilog to Road-Project      </div>      </a>      <div class='description'>Add Serilog to Road project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-01      </div>      <a href='Docker/Docker-Compose-Glossar.md'>      <div class='title'>Docker-Compose - Glossar      </div>      </a>      <div class='description'>Eine Übersicht über Docker-Compose      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2025-10-01      </div>      <a href='Docker/Docker-Glossar.md'>      <div class='title'>Docker - Glossar      </div>      </a>      <div class='description'>Eine Übersicht über Docker und die wichtigsten Begriffe bzw. Namens-Fallen      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/SSLCertificate.png'></img>   </div>   <div class='text'>      <div class='date'>2025-09-25      </div>      <a href='SmartHome/Docker/SelfSignedCertificate.md'>      <div class='title'>Self-Signed Certificate      </div>      </a>      <div class='description'>Erzeugt für den Host docker.fritz.box ein Self-Signed Certificate mit RootCA FleisHor.CA      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/MediatR.png'></img>   </div>   <div class='text'>      <div class='date'>2025-09-09      </div>      <a href='Dotnet/RoadProject/CQRS-with-MediatR-Road-Project.md'>      <div class='title'>CQRS with MediatR      </div>      </a>      <div class='description'>A simple example for Mediatr. Currently only the query part is implemented, the command part is similar. Caching, Logging and Validation is done in MediatR-Behaviors. The client API is generated with Kiota.      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Docker.png'></img>   </div>   <div class='text'>      <div class='date'>2025-04-25      </div>      <a href='Dotnet/RoadProject/Docker-support-for-Road-project.md'>      <div class='title'>Add docker support to C# project      </div>      </a>      <div class='description'>Add docker support to Road project      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2025-03-28      </div>      <a href='Dotnet/Keycloak/Node-Express.md'>      <div class='title'>Node.js Express adapter      </div>      </a>      <div class='description'>Authenticate with Node to Keycloak      </div>   </div></div><div class='note'>   <div class='image'>     <img src='/Images/Keycloak.png'></img>   </div>   <div class='text'>      <div class='date'>2025-03-17      </div>      <a href='Dotnet/Keycloak/Keycloak-Glossar.md'>      <div class='title'>Keycloak - Glossar      </div>      </a>      <div class='description'>null      </div>   </div></div>
%% run end %%


