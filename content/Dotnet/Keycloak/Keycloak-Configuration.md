---
showOnIndexPage: true
date: 2025-04-14
title: Configuration
image: Image.png
description: 
tags:
  - Keycloak
---

## Install Keycloak with Docker

[[Keycloak-with-Docker]]

## Create New Realm fleishor

![[Create-New-Realm-fleishor.png]]

## Adjust Realm Settings

![[Adjust-Realm-Settings-01.png]]

Because "Unmanaged Attributes" is disabled, all additional user properties must be added in "User profile", otherwise the property will not be added to Id-Token (even when requested via scope)

![[Adjust-Realm-Settings-02.png]]

![[Adjust-Realm-Settings-03.png]]

## Add Additional User Property

![[Add-Additional-User-Property-01.png]]

![[Add-Additional-User-Property-02.png]]

## Create New Client BaseDataApp

![[Create-New-client-BaseDataApp.png]]

![[BaseDataApp-Configuration-01.png]]

Very important is here the "Redirect URI", it must fit to the redirect_uri sent from the client application

![[BaseDataApp-Configuration-02.png]]

![[BaseDataApp-Configuration-03.png]]

![[BaseDataApp-Configuration-04.png]]

![[BaseDataApp-Credentials.png]]

![[BaseDataApp-Roles.png]]

## Create New Realm Role

![[Create-New-Realm-role.png]]

## Create New User fleishor

![[Create-New-User-fleishor-01.png]]

![[Create-New-User-fleishor-02.png]]

![[Create-New-User-fleishor-03.png]]

## Assign Role BaseDataAppManager to User fleishor

![[Assign-Role-BaseDataAppManager-to-User.png]]

## Export Keycloak Configuration as JSON

![[Export-Keycloak-Configuration-as-JSON.png]]
