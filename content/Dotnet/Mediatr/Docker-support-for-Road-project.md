---
showOnIndexPage: true
date: 2025-04-25
title: Add docker support to C# project
image: Docker.png
description: Add docker support to Road project
tags:
  - Dotnet
  - Docker
  - Dockerfile
---

## Add Docker Support

![[Docker-Support.png]]

![[Add-Docker-Support.png]]

## Dockerfile

~~~dockerfile
# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080


# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Debug
WORKDIR /src
COPY ["Directory.Build.props", "."]
COPY ["Directory.Build.targets", "."]
COPY ["Road.API/Road.API.csproj", "Road.API/"]
COPY ["Road.BusinessLayer/Road.BusinessLayer.csproj", "Road.BusinessLayer/"]
RUN dotnet restore "./Road.API/Road.API.csproj"
COPY . .
WORKDIR "/src/Road.API"
RUN dotnet build "./Road.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Debug
RUN dotnet publish "./Road.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Road.API.dll"]
~~~

This Dockerfile uses a multi-stage build approach to create an optimized Docker image for your .NET 9 API application.

### Stage 1: Base Image
~~~dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
~~~

•	Uses the official .NET 9 ASP.NET runtime image as the base
•	Sets the user to the environment variable $APP_UID for security
•	Sets the working directory to /app
•	Exposes port 8080 for HTTP traffic

### Stage 2: Build Stage
~~~dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Debug
WORKDIR /src
COPY ["Directory.Build.props", "."]
COPY ["Directory.Build.targets", "."]
COPY ["Road.API/Road.API.csproj", "Road.API/"]
COPY ["Road.BusinessLayer/Road.BusinessLayer.csproj", "Road.BusinessLayer/"]
RUN dotnet restore "./Road.API/Road.API.csproj"
COPY . .
WORKDIR "/src/Road.API"
RUN dotnet build "./Road.API.csproj" -c $BUILD_CONFIGURATION -o /app/build
~~~

•	Uses the full .NET 9 SDK image for building
•	Defines a build argument with Debug as default
•	Creates and sets working directory to /src
•	Copies project files first (for better layer caching)
•	Restores NuGet packages
•	Copies all source code
•	Builds the project to /app/build

### Stage 3: Publish Stage
~~~dockerfile
FROM build AS publish
ARG BUILD_CONFIGURATION=Debug
RUN dotnet publish "./Road.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false
~~~

•	Based on the build stage
•	Publishes the application to create deployment-ready files
•	The /p:UseAppHost=false flag prevents generating a native executable

### Stage 4: Final Stage
~~~dockerfile
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Road.API.dll"]
~~~

•	Returns to the smaller runtime image
•	Copies only the published files from the publish stage
•	Sets the entry point to run the API with the dotnet command

This multi-stage approach ensures the final image is as small as possible by including only the runtime and the published application, without all the SDK and build tools needed during development.

## Start Docker project from Visual Studio

![[Start-Docker-Project1.png]]

![[Start-Docker-Project2.png]]


## Build Docker images from command line

### Goto directory  C:\Users\fleishor\MyDevelopment\DotNet\Mediatr

### Build docker image

~~~powershell
PS C:\Users\fleishor\MyDevelopment\DotNet\Mediatr> docker build -t roadapi:dev -f .\Road.Api\Dockerfile .
[+] Building 0.2s (21/21) FINISHED                                                                 docker:desktop-linux
 => [internal] load build definition from Dockerfile                                                               0.0s
 => => transferring dockerfile: 1.38kB                                                                             0.0s
 => [internal] load metadata for mcr.microsoft.com/dotnet/sdk:9.0                                                  0.1s
 => [internal] load metadata for mcr.microsoft.com/dotnet/aspnet:9.0                                               0.1s
 => [internal] load .dockerignore                                                                                  0.0s
 => => transferring context: 464B                                                                                  0.0s
 => [build  1/10] FROM mcr.microsoft.com/dotnet/sdk:9.0@sha256:bb42ae2c058609d1746baf24fe6864ecab0686711dfca1f4b7  0.0s
 => [internal] load build context                                                                                  0.0s
 => => transferring context: 8.12kB                                                                                0.0s
 => [base 1/2] FROM mcr.microsoft.com/dotnet/aspnet:9.0@sha256:1af4114db9ba87542a3f23dbb5cd9072cad7fcc8505f6e9131  0.0s
 => => resolve mcr.microsoft.com/dotnet/aspnet:9.0@sha256:1af4114db9ba87542a3f23dbb5cd9072cad7fcc8505f6e9131d1feb  0.0s
 => CACHED [base 2/2] WORKDIR /app                                                                                 0.0s
 => CACHED [final 1/2] WORKDIR /app                                                                                0.0s
 => CACHED [build  2/10] WORKDIR /src                                                                              0.0s
 => CACHED [build  3/10] COPY [Directory.Build.props, .]                                                           0.0s
 => CACHED [build  4/10] COPY [Directory.Build.targets, .]                                                         0.0s
 => CACHED [build  5/10] COPY [Road.API/Road.API.csproj, Road.API/]                                                0.0s
 => CACHED [build  6/10] COPY [Road.BusinessLayer/Road.BusinessLayer.csproj, Road.BusinessLayer/]                  0.0s
 => CACHED [build  7/10] RUN dotnet restore "./Road.API/Road.API.csproj"                                           0.0s
 => CACHED [build  8/10] COPY . .                                                                                  0.0s
 => CACHED [build  9/10] WORKDIR /src/Road.API                                                                     0.0s
 => CACHED [build 10/10] RUN dotnet build "./Road.API.csproj" -c Debug -o /app/build                               0.0s
 => CACHED [publish 1/1] RUN dotnet publish "./Road.API.csproj" -c Debug -o /app/publish /p:UseAppHost=false       0.0s
 => CACHED [final 2/2] COPY --from=publish /app/publish .                                                          0.0s
 => exporting to image                                                                                             0.0s
 => => exporting layers                                                                                            0.0s
 => => writing image sha256:2b14717d21dc6d3a594f75e83423e158b16c1879fb9ff0c60b907c1b175f6bb8                       0.0s
 => => naming to docker.io/library/roadapi:dev                                                                     0.0s

PS C:\Users\fleishor\MyDevelopment\DotNet\Mediatr>
~~~

### Show docker image

~~~powershell
PS C:\Users\fleishor\MyDevelopment\DotNet\Mediatr> docker images
REPOSITORY                                                 TAG            IMAGE ID       CREATED          SIZE
roadapi                                                    dev            2b14717d21dc   9 minutes ago    230MB
~~~

### Run docker container

~~~powershell
PS C:\Users\fleishor\MyDevelopment\DotNet\Mediatr> docker run -p 8080:8080 roadapi
[18:08:50 WRN] Storing keys in a directory '/home/app/.aspnet/DataProtection-Keys' that may not be persisted outside of the container. Protected data will be unavailable when container is destroyed. For more information go to https://aka.ms/aspnet/dataprotectionwarning
[18:08:50 WRN] No XML encryptor configured. Key {d38f0510-9f76-40bf-ab51-63ffe50c8b3a} may be persisted to storage in unencrypted form.
[18:08:50 WRN] The WebRootPath was not found: /app/wwwroot. Static files may be unavailable.
[18:08:50 INF] Now listening on: http://[::]:8080
[18:08:50 INF] Application started. Press Ctrl+C to shut down.
[18:08:50 INF] Hosting environment: Production
[18:08:50 INF] Content root path: /app
~~~

