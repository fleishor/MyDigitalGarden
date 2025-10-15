---
showOnIndexPage: true
date: 2025-09-09
title: Add Serilog to Road-Project
image: Serilog.png
description: Add Serilog to Road project; the logs are written as plain text to console and as ([Compact Log Event Format (CLEF)](https://clef-json.org/)) to a file. Additionally we can set a correlation id in the http header.
tags:
  - Dotnet
---

## References

- [GitHub](https://github.com/fleishor/MyDevelopment/tree/master/DotNet/Mediatr)
- [HTTP logging in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/http-logging/?view=aspnetcore-8.0)
- [Compact Log Event Format (CLEF)](https://clef-json.org/)
- [Serilog](https://serilog.net/)
- [Serilog Enrichers](https://github.com/serilog/serilog/wiki/Enrichment)
- [Serilog ClientInfo Enricher](https://github.com/serilog-contrib/serilog-enrichers-clientinfo)

## Nuget packages

~~~xml
  <ItemGroup>
    ...
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.2" />
    <PackageReference Include="Serilog.Enrichers.ClientInfo" Version="2.1.1" />
    <PackageReference Include="Serilog.HttpClient" Version="3.0.0" />
    ...
  </ItemGroup>
~~~

## Program.cs

~~~csharp
public static void Main(string[] args)
{
   var builder = WebApplication.CreateBuilder(args);

   // Add Serilog and use configuration from appsettings.json
   builder.Host.UseSerilog((context, config) =>
   {
      config.ReadFrom.Configuration(context.Configuration);
   });

   // Required by ClientInfo enricher
   builder.Services.AddHttpContextAccessor();
   
   ...
   
   builder.Services.AddSwaggerGen(config =>
   {
      // Add CorrelationId to SwaggerUI
      config.OperationFilter<AddHeaderParameters>();
   });

   ...
   
   // Log also ASP.Net request to Serilog
   app.UseSerilogRequestLogging();

   ...

}
~~~

## Configuration

~~~json
{
  "Serilog": {
    "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft.AspNetCore": "Information",
        "Microsoft.AspNetCore.HttpLogging.HttpLoggingMiddleware": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "./logs/Road.API_.json",
          "rollingInterval": "Day",
          "formatter": "Serilog.Formatting.Compact.CompactJsonFormatter, Serilog.Formatting.Compact"
        }
      }

    ],
    "Enrich": [
      "FromLogContext",
      {
        "Name": "WithCorrelationId",
        "Args": {
          "headerName": "x-correlation-id",
          "addValueIfHeaderAbsence": true
        }
      }
    ],
    "Properties": {
      "Application": "Road.API"
    }
  },
  "AllowedHosts": "*"
}
~~~

Interesting is the Override, here we can set different levels for each logger.

## Logging Scope

With BeginScope, the property RoadId will be added to all log messages within this scope.

~~~csharp
public async Task<RoadWarningsQueryResult> GetRoadWarnings(string roadId, CancellationToken cancellationToken)
{
   using var loggerScope = logger.BeginScope("Get road warnings for highway {RoadId}", roadId);

   var roadWarningsQuery = new RoadWarningsQuery(roadId.ToUpper(), SlidingExpirationInMinutes: 1);
   var result = await mediator.Send(roadWarningsQuery, cancellationToken);

   return result;
}
~~~

## CorrelationId

The CorrelationId can be set from external (HTTP Header) and will be added to all log messages.

## HTTP request logging mit Serilog

UseSerilogRequestLogging() is a middleware extension method that adds HTTP request logging to your ASP.NET Core application using Serilog.

~~~csharp
public static void Main(string[] args)
{

   ...

   app.UseStaticFiles();

   ... 

   // Log also ASP.Net request to Serilog
   app.UseSerilogRequestLogging();

   ...
}
~~~

At the end of the HTTP request there will be a summary added; especially with StatusCode and Elapsed time.

~~~json
{
   "@t": "2025-10-15T08:35:24.0569978Z",
   "@mt": "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms",
   "@r": ["648.7973"],
   "@tr": "1760cb61ef0261b07c40fc1a36cb51db",
   "@sp": "559cfd0ce1b11592",
   "RequestMethod": "GET",
   "RequestPath": "/Road/GetRoadWarnings/A93",
   "StatusCode": 200,
   "Elapsed": 648.7973,
   "SourceContext": "Serilog.AspNetCore.RequestLoggingMiddleware",
   "RequestId": "0HNGBOMVNBPSJ:00000003",
   "ConnectionId": "0HNGBOMVNBPSJ",
   "CorrelationId": "FleisHor#1",
   "Application": "Road.API"
}
~~~

## HTTP request logging mit Microsoft

AddHttpLogging() is a built-in ASP.NET Core service that enables detailed logging of HTTP requests and responses. Unlike UseSerilogRequestLogging(), this is a Microsoft-native solution that is part of the ASP.NET Core framework.

~~~csharp
public static void Main(string[] args)
{

    ...

    // Add HttpLogging, but may cause performance issues
    builder.Services.AddHttpLogging(options =>
    {
       options.LoggingFields = HttpLoggingFields.RequestPropertiesAndHeaders | HttpLoggingFields.ResponsePropertiesAndHeaders;
       options.RequestHeaders.Add("x-correlation-id");
       options.CombineLogs = false;
    });

    ...

    app.UseStaticFiles();

	// Enable Microsoft Http request logging
    app.UseHttpLogging();

   ... 
}
~~~

With HTTPLogging it's quite easy also to log RequestBody and ResponseBody.

~~~csharp
options.LoggingFields = HttpLoggingFields.RequestPropertiesAndHeaders
						| HttpLoggingFields.ResponsePropertiesAndHeaders
						| HttpLoggingFields.RequestBody
						| HttpLoggingFields.ResponseBody;
~~~

## HTTPClient logging

LogRequestResponse() is an extension method from the Serilog.HttpClient package that enables detailed logging of HTTP client requests and responses.

~~~csharp
public static void Main(string[] args)
{
   
   ...
   
   // Add Serilog and use configuration from appsettings.json
   builder.Host.UseSerilog((context, config) =>
   {
      config.ReadFrom.Configuration(context.Configuration)
   
         // necessary for Serilog.LogRequestResponse
         .AddJsonDestructuringPolicies();
   });
   
   ...
   
   // Register the factory for the Autobahn client
   builder.Services
      .AddHttpClient<AutobahnClientFactory>(
         (_, client) =>
         {
            client.DefaultRequestHeaders.Add("Accept", "application/json");
         })
   
      // Attach the Kiota handlers to the http client, this is to enable all the Kiota features.
      .AttachKiotaHandlers()
      // HTTPClient logging
      .LogRequestResponse();
   
   ...

}
~~~

The following additional log line was created:

~~~json
{
   "@t": "2025-10-15T21:03:11.4111543Z",
   "@mt": "HTTP Client Request Completed {@Context}",
   "@tr": "bc811825c56a7100d90044566ee97cc6",
   "@sp": "8e54c55e19d34bf5",
   "Context": {
      "Request": {
         "Url": "https://verkehr.autobahn.de/o/autobahn/A93/services/warning",
         "Method": "GET",
         "Scheme": "https",
         "Host": "verkehr.autobahn.de",
         "Path": "/o/autobahn/A93/services/warning",
         "QueryString": "",
         "Query": {},
         "BodyString": "",
         "Body": null,
         "Headers": {
            "Accept": "application/json",
            "User-Agent": "kiota-dotnet/1.17.2",
            "traceparent": "00-bc811825c56a7100d90044566ee97cc6-8195faf94da653fd-00"
         },
         "$type": "HttpClientRequestContext"
      },
      "Response": {
         "StatusCode": 200,
         "IsSucceed": true,
         "ElapsedMilliseconds": 382.2133,
         "BodyString": "(Not Logged)",
         "Body": null,
         "Headers": {
            "Server": ["nginx/1.18.0", "(Ubuntu)"],
            "Date": "Wed, 15 Oct 2025 21:03:11 GMT",
            "Connection": "keep-alive",
            "X-Powered-By": "Express",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Expose-Headers": "Content-Range",
            "ETag": "W/\"e-Igz4+KfF6wmf5GZ/UtE8gyMOGr0\""
         },
         "$type": "HttpClientResponseContext"
      },
      "$type": "HttpClientContext"
   },
   "SourceContext": "Serilog.HttpClient.LoggingDelegatingHandler",
   "HttpMethod": "GET",
   "Uri": "https://verkehr.autobahn.de/o/autobahn/A93/services/warning",
   "RoadId": "A93",
   "ActionId": "c747f6dc-e585-495a-a278-9e6a395dcff1",
   "ActionName": "Road.API.Controllers.RoadController.GetRoadWarnings (Road.API)",
   "RequestId": "0HNGC5OPKHH9R:00000003",
   "RequestPath": "/Road/GetRoadWarnings/A93",
   "ConnectionId": "0HNGC5OPKHH9R",
   "Scope": ["Get road warnings for highway A93", "HTTP GET https://verkehr.autobahn.de/o/autobahn/A93/services/warning"],
   "CorrelationId": "FleisHor#1",
   "Application": "Road.API"
}
~~~