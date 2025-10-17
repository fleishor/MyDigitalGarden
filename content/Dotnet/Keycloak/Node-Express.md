---
showOnIndexPage: true
date: 2025-03-28
title: Node.js Express adapter
image: Keycloak.png
description: Authenticate with Node to Keycloak
tags:
  - Keycloak
  - NodeJS
---

## References

- [Keycloak Node.js adapter](https://www.keycloak.org/securing-apps/nodejs-adapter)
- [An Introduction to OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2)
- [Apps Developer Blog - Keycloak](https://www.appsdeveloperblog.com/category/keycloak/)
- [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/index.html)
- [JWT standard](https://www.iana.org/assignments/jwt/jwt.xhtml)
- [Keycloak](https://www.youtube.com/playlist?list=PLeLcvrwLe187DykEKXg-9Urd1Z6MQT61d)

## Program

~~~typescript
// src/index.ts
import express from "express";
import { Request, Response } from "express";
import session from "express-session";
import { jwtDecode } from "jwt-decode";
import { MemoryStore } from "express-session";
import KeycloakConnect from "keycloak-connect";

declare module "express-session" {
   interface SessionData {
      "keycloak-token": any;
   }
 }

KeycloakConnect.prototype.redirectToLogin = function(req: any) {
   const apiReqMatcher = /\/api\//i;
   return !apiReqMatcher.test(req.originalUrl || req.url);
   };

const app = express();
const port = 3001;
const memoryStore = new MemoryStore();
const keycloak = new KeycloakConnect({ 
      store: memoryStore, 
      scope : ""
   }, "./keycloak.json");


// Session-Management konfigurieren
app.use(
   session({
      secret: "ExpressSessionSecret",
      resave: false,
      saveUninitialized: true,
      store: memoryStore,
   })
);

// Keycloak-Middleware hinzufügen
app.use(keycloak.middleware());

// Home
app.get("/", (req, res) => {
   res.redirect("/showSessionInfo");
});

// Anzeigen von Session-Informationen
app.get("/showSessionInfo",(req, res) => {
   var response = generateUrlLinks();
   response += generateSessionInfoHtml(req);
   res.send(response);
});

// Login-Endpunkt
app.get("/login", keycloak.protect(), (req, res) => {
   const iss = req.query.iss;
   if (iss) {
      var response = generateUrlLinks();
      response += generateSessionInfoHtml(req);
      res.send(response);
   }
});
 
// Logout-Endpunkt
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to logout.");
    }
    var response = generateUrlLinks();
    response += generateSessionInfoHtml(req);
    res.send(response);
 });
});

// Gesicherte Route mit Bearer-Token-Authentifizierung
app.get("/api/rolebased/secure", keycloak.protect("BaseDataAppManager"), (req, res) => {
   res.send("This is a path is protected by Keycloak.");
});

app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`);
});

function generateSessionInfoHtml(req: Request) {
   var response = "";
   response += "<h1>Session info</h1>";
   response += "<pre>";
   response += JSON.stringify(req.session, null, 4);
   response += "</pre>";

   var keycloakTokenStr = req.session["keycloak-token"];
   if (keycloakTokenStr) {
      response += "<h1>Keycloak</h1>";

      var keycloakToken = JSON.parse(keycloakTokenStr);
      response += "<pre>";
      response += JSON.stringify(keycloakToken, null, 4);
      response += "</pre>";

      var idToken = keycloakToken["id_token"];
      var idTokenDecoded = jwtDecode(idToken);

      var accessToken = keycloakToken["access_token"];
      var accessTokenDecoded = jwtDecode(accessToken);
      
      response += "<h1>Times</h1>";
      var idTokenExpire = idTokenDecoded.exp 
                              ? new Date(idTokenDecoded.exp * 1000).toISOString() 
                              : "undefined";
      var idTokenIssuedAt = idTokenDecoded.iat 
                              ? new Date(idTokenDecoded.iat * 1000).toISOString() 
                              : "undefined";
      response += "<pre>";
      response += "ID Token issued at: " + idTokenIssuedAt + "\n";
      response += "ID Token expires at: " + idTokenExpire + "\n";
      response += "</pre>";

      response += "<h1>Id token</h1>";
      response += "<pre>";
      response += JSON.stringify(idTokenDecoded, null, 4);
      response += "</pre>";

      response += "<h1>Access token</h1>";
      response += "<pre>";
      response += JSON.stringify(accessTokenDecoded, null, 4);
      response += "</pre>";
   }
   return response;
}

function generateUrlLinks() {
   var response = "";
   response += "<h1>URLs</h1>";
   response += "<pre>";
   response += "<a href='/'>Home</a>\n";
   response += "<a href='/showSessionInfo'>Show Session Info</a>\n"; 
   response += "<a href='/login'>Login</a>\n";
   response += "<a href='/logout'>Logout</a>\n";
   response += "<a href='/api/rolebased/secure'>Role-based Secured API</a>\n";
   response += "</pre>";

   return response;
}

~~~

## Keycloak configuration

~~~json
{
  "realm": "fleishor",
  "auth-server-url": "http://docker.fritz.box:8081/auth/",
  "ssl-required": "none",
  "resource": "BaseDataApp",
  "credentials": {
    "secret": "MvYCXMtWwYoM5yxnX4kCmc7UroTCepTe"
  },
  "confidential-port": 0
}
~~~

## Authentication flow

The authentication flow describes how a user is authenticated through the application and how Keycloak manages authentication and authorization. The following steps outline the process in detail:

Overview of the Authentication Flow

1. **User Request to the Application**: The user sends a request to the application, e.g., by accessing the login page (/login).

2. **Redirect to Keycloak Login Page**: The Keycloak middleware detects that the user is not authenticated and redirects them to the Keycloak login page.

3. **User Authentication in Keycloak**: The user enters their credentials (username and password) on the Keycloak login page.

4. **Redirect Back to the Application**: After successful authentication, Keycloak redirects the user back to the application and provides an authorization code.

5. **Token Exchange**: The Keycloak middleware exchanges the authorization code for an ID token and an access token.

6. **Store Tokens**: The tokens are stored in the Express session to authenticate the user for future requests.

7. **Access Protected Resources**: The user can now access protected routes secured by roles or permissions.

Detailed Steps

~~~mermaid
sequenceDiagram
    autonumber
    Browser(NodeApp) ->> NodeApp(Express): http://localhost:3001/login
    NodeApp(Middleware) ->> Browser(NodeApp): Redirect to Keycloak login
    Browser(NodeApp) ->> Keycloak: Show Keycloak login dialog
    Browser(Keycloak) ->> Keycloak: Authenticate with User and Password
    Keycloak ->> Browser(NodeApp): Redirect to NodeApp/login?auth_callback=1&code=***
    Browser(NodeApp) ->> NodeApp(Middleware): Get http://localhost:3001/login?auth_callback=1&code=***

    rect rgb(192, 192, 192) 
        NodeApp(Middleware) ->> KeyCloak: IdToken and AccessToken for code
        KeyCloak ->> NodeApp(Middleware): Set IdToken and AccessToken
        NodeApp(Middleware) ->> NodeApp(Express): Save IdToken and AccessToken<br/>in Express session
    end

    NodeApp(Middleware) ->> Browser(NodeApp): Redirect to http://localhost:3001/login?iss=http://docker.fritz.box:8081/auth/realms/fleishor
    Browser(NodeApp) ->> NodeApp(Express): http://localhost:3001/login?iss=http://docker.fritz.box:8081/auth/realms/fleishor
~~~

Expanded Description of the Steps

1. Request to the Application:
   - The user accesses the login page of the application (/login).
   - The Keycloak middleware checks if the user is authenticated.
1. Redirect to Keycloak Login Page:
   - If the user is not authenticated, they are redirected to the Keycloak login page.
   - The redirect includes parameters such as client_id, redirect_uri, state, and response_type.
1. User Authentication:
   - The user enters their credentials.
   - Keycloak verifies the credentials and authenticates the user.
1. Redirect Back to the Application:
   - After successful authentication, Keycloak redirects the user back to the application.
   - The redirect includes an authorization code (code) used for token exchange.
1. Token Exchange:
   - The Keycloak middleware exchanges the authorization code for an ID token and an access token.
   - These tokens contain information about the user and their permissions.
1. Store Tokens:
   - The tokens are stored in the Express session.
   - This allows the application to authenticate the user for future requests.
1. Access Protected Resources:
   - The user can now access protected routes secured by roles or permissions.
   - The Keycloak middleware validates the tokens for each request.

Additional Notes

- Role-Based Authorization:
   - The Keycloak middleware can protect routes based on user roles.
   - Example: keycloak.protect("BaseDataAppManager") protects a route and only allows users with the BaseDataAppManager role to access it.

- Token Validation:
   - The middleware validates the tokens for each request.
   - Expired tokens can be renewed using a refresh token.

- Error Handling:
   - If a user is not authenticated or lacks the required permissions, an appropriate error message is returned (e.g., HTTP 401 or 403).

### Open application login page

Because there are no tokens in express session, the Keycloak middleware redirects to Keycloak login page; see http code 302 and location
![[01-Application-login.png]]

Location property

~~~
http://docker.fritz.box:8081/auth/realms/fleishor/protocol/openid-connect/auth
   ?client_id=BaseDataApp
   &state=dfcbea09-9427-4bdd-8d44-b71154c9536d
   &redirect_uri=http://localhost:3001/login?auth_callback=1
   &scope=openid
   &response_type=code
~~~

|     |     |
| --- | --- |
| url | Taken from Keycloak configuration properties auth-server-url and realm |
| client_id | taken from Keycloak configuration property resource|
| state | guid |
| redirect_uri | After successful authentication to which uri should be redirected, must be also configured in Keycloak|
| scope | openid is the default scope, additional scopes can be added |
| response_type | Code-based authentication should be used |

### The browser is redirected to login page from Keycloak

![[02-Redirect-to-Keycloak.png]]
![[Keycloak-login-page.png]]

### Sign-In in Keycloak

After Sign-In the username and password are sent to Keycloak (post body); In case the authentication was successful the response is a redirect to the application

![[Keyclaok-login-page2.png]]
![[03-Authentication-in-Keycloak.png]]

Location property:

~~~
http://localhost:3001/login
   ?auth_callback=1
   &state=dfcbea09-9427-4bdd-8d44-b71154c9536d
   &session_state=b3f08049-35c4-4aab-9bb8-89d48dccad95
   &iss=http://docker.fritz.box:8081/auth/realms/fleishor
   &code=b9a5cb19-b3e0-4319-9574-905f4ebec9a6.b3f08049-35c4-4aab-9bb8-89d48dccad95.f9aaeed0-047b-4e82-9f6f-da374668e089
~~~

|     |     |
| --- | --- |
| url | The redirect_uri from Keycloak and from the redirect above |
| auth_callback | login is called from Keycloak redirect, which causes that this request will be catched by Keycloak middleware in Express |
| state | guid from the original login request  |
| session_state |  |
| iss | URI that verified the authentication  |
| code | The requested code which will later be replaced by Keycloak middleware with Id-Token/Access-Token, so the Browser only see this code, but not the tokens |

### Redirect again to application login page

The browser is now redirect to the login page of the application, due to auth_callback=1 the Keycloak intercepts this request and asks internally Keycloak for an Id-Token and Access-Token using the code.
![[04-Redirect-to-Keycloak-Middleware.png]]

### Keycloak middleware requests Id-Token/Access-Token

After Keycloak could "replace" the code with an Id-Token and Access-Token the browser is again redirected to the application login page, but his time with the parameter iss.
![[05-Redirect-to-Application-login.png]]

Location property

~~~
/login?iss=http://docker.fritz.box:8081/auth/realms/fleishor
~~~

|     |     |
| --- | --- |
| iss | Issuer, which authenticated the user |

## Protect a route with role-based authentication

With `keycloak.protect()` a route can be protected:

~~~typescript
// Gesicherte Route mit Bearer-Token-Authentifizierung
app.get("/api/rolebased/secure", keycloak.protect("BaseDataAppManager"), (req, res) => {
   res.send("This is a path is protected by Keycloak.");
});
~~~

In the Access-Token we have a list of granted roles for each client:

~~~json
"resource_access": {
        "BaseDataApp": {
            "roles": [
                "BaseDataAppManager"
            ]
        }
    }
~~~

By default the Keycloak middleware redirects every authentication to the Keycloak login page. For WebAPI calls this is bad, there for this behavior can be overwritten:

~~~typescript
KeycloakConnect.prototype.redirectToLogin = function(req: any) {
   const apiReqMatcher = /\/api\//i;
   return !apiReqMatcher.test(req.originalUrl || req.url);
   };
~~~

## Keycloak data in express session

### Session Info

~~~json
{
    "cookie": {
        "originalMaxAge": null,
        "expires": null,
        "httpOnly": true,
        "path": "/"
    },
    "auth_redirect_uri": "http://localhost:3001/login?auth_callback=1",
    "keycloak-token": "{\"access_token\":\"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMTVE0b2VGbm9OendlaEFqaWxoek9vOTVxcnJzcU5mQ2w3YmtRZzBvbDk4In0.eyJleHAiOjE3NDQyMTYwNjYsImlhdCI6MTc0NDIxNTc2NiwiYXV0aF90aW1lIjoxNzQ0MjE1NzY2LCJqdGkiOiIzOTFmNmI0Ny0xNzE3LTRiYmUtODc1Yi0xNTcwZDRlNjgwOTYiLCJpc3MiOiJodHRwOi8vZG9ja2VyLmZyaXR6LmJveDo4MDgxL2F1dGgvcmVhbG1zL2ZsZWlzaG9yIiwic3ViIjoiYTIwMTUzZWQtYWFmZi00NzE0LWJmNmQtOGRjZTQ5NzIwM2M2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQmFzZURhdGFBcHAiLCJzaWQiOiJlOTEyNWZkNS05ZDJmLTQxZGQtYjc5Zi01Yjk5NzcxMGIwYzUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUmVhbG1NYW5hZ2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiQmFzZURhdGFBcHAiOnsicm9sZXMiOlsiQmFzZURhdGFBcHBNYW5hZ2VyIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCByb2xlcyIsIm5hbWUiOiJIb3JzdCAgRmxlaXNjaGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZmxlaXNob3IiLCJnaXZlbl9uYW1lIjoiSG9yc3QgIiwiZmFtaWx5X25hbWUiOiJGbGVpc2NoZXIifQ.M7IGYTq8yR3_uRecEZ47SypqXI6F9KQjDkXvl8XY7JMIQTJX0rLJVaE-KeHJ-ff7XpdFAIVGu2SncuwC-KnUtxD7hJYo7uae0EmcHzknA57D9uxOCjSwqdMNCaDBiY7GuULXVwy3UW7epETcm6zo0h34vO6cG3zoG7xUYaH51C_xzTW9dcmG_4xBjdfhsdQM15tk29I-mX_4_P8z0XdUkwTJ0Cb94k1tQvnm4BzJB3UCexNfV_EgWSVz5-tlRUi9Rogn16mDJ1lPC1kesaE7BhZRa1sUkYUurDQ4YkQuNa3hARMLkjnT2QfTqklDwSJaRtQF6uLX6tHv4_926lixHg\",\"expires_in\":300,\"refresh_expires_in\":1800,\"refresh_token\":\"eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0NWJhMjFjMS0xZDFiLTQ3OGMtOGQ2Zi1iMzNmMzBkMGY1MzEifQ.eyJleHAiOjE3NDQyMTc1NjYsImlhdCI6MTc0NDIxNTc2NiwianRpIjoiNjhkYjJiNDYtMjM5YS00MWEwLTg5NGItOTJhYjRjYWQ5ZWI0IiwiaXNzIjoiaHR0cDovL2RvY2tlci5mcml0ei5ib3g6ODA4MS9hdXRoL3JlYWxtcy9mbGVpc2hvciIsImF1ZCI6Imh0dHA6Ly9kb2NrZXIuZnJpdHouYm94OjgwODEvYXV0aC9yZWFsbXMvZmxlaXNob3IiLCJzdWIiOiJhMjAxNTNlZC1hYWZmLTQ3MTQtYmY2ZC04ZGNlNDk3MjAzYzYiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoiQmFzZURhdGFBcHAiLCJzaWQiOiJlOTEyNWZkNS05ZDJmLTQxZGQtYjc5Zi01Yjk5NzcxMGIwYzUiLCJzY29wZSI6Im9wZW5pZCBhY3IgcHJvZmlsZSB3ZWItb3JpZ2lucyBlbWFpbCByb2xlcyBiYXNpYyJ9.V7xwM1G7z43Uz7HUyZHwnvtF9TeRegXhJNNxLX3-fhWZM_7j4RfnZcxixKWsMPyya2Bwhas9U3NsELbXsPFMgw\",\"token_type\":\"Bearer\",\"id_token\":\"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMTVE0b2VGbm9OendlaEFqaWxoek9vOTVxcnJzcU5mQ2w3YmtRZzBvbDk4In0.eyJleHAiOjE3NDQyMTYwNjYsImlhdCI6MTc0NDIxNTc2NiwiYXV0aF90aW1lIjoxNzQ0MjE1NzY2LCJqdGkiOiI4MzQwYzViNS02ZWMzLTQ2ZTYtODZhOS0yOTYxNTI1MWIzY2YiLCJpc3MiOiJodHRwOi8vZG9ja2VyLmZyaXR6LmJveDo4MDgxL2F1dGgvcmVhbG1zL2ZsZWlzaG9yIiwiYXVkIjoiQmFzZURhdGFBcHAiLCJzdWIiOiJhMjAxNTNlZC1hYWZmLTQ3MTQtYmY2ZC04ZGNlNDk3MjAzYzYiLCJ0eXAiOiJJRCIsImF6cCI6IkJhc2VEYXRhQXBwIiwic2lkIjoiZTkxMjVmZDUtOWQyZi00MWRkLWI3OWYtNWI5OTc3MTBiMGM1IiwiYXRfaGFzaCI6InpqYWhkM1RPOVM5MWdhcUZYVzIxdlEiLCJhY3IiOiIxIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJSZWFsbU1hbmFnZXIiXX0sIm5hbWUiOiJIb3JzdCAgRmxlaXNjaGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZmxlaXNob3IiLCJnaXZlbl9uYW1lIjoiSG9yc3QgIiwiZmFtaWx5X25hbWUiOiJGbGVpc2NoZXIiLCJlbWFpbCI6ImhvcnN0LmZsZWlzY2hlckB3ZWIuZGUifQ.rXiGXGi1CIX5izYs8VCPLX5QK01Bh28MGjyhv0_Fnpbms2K-JAIpSfeVGnY7kBOt_N6NPdDwt8mEducCqVZGftdsm5h-9GJAr1KzLYc-_Zw_sYaokmmknBgCkuPJQ_WoLuRTMO7wPlcqJhaX9WhJ7cvU_jklOOSybu2IqbrnWvK4b3PjHE-ATu7ddOOg_5gFkmCNGLMJJiP-tKeFvthW2d0r4oA699gKfsnJ_h6_o6LDyCrIAFwq8BD3PxpwoQ0i4xpCYRBRJJpOEjr8Kuaat7fIMZ_LPMF8w6tERkrQvt0UUSKJlbJFE8X-zkJGIPsI6MyiKCNmEqUziVKUHLPvFw\",\"not-before-policy\":1742214942,\"session_state\":\"e9125fd5-9d2f-41dd-b79f-5b997710b0c5\",\"scope\":\"openid profile email roles\"}"
}
~~~

### Keycloak

~~~json
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMTVE0b2VGbm9OendlaEFqaWxoek9vOTVxcnJzcU5mQ2w3YmtRZzBvbDk4In0.eyJleHAiOjE3NDQyMTYwNjYsImlhdCI6MTc0NDIxNTc2NiwiYXV0aF90aW1lIjoxNzQ0MjE1NzY2LCJqdGkiOiIzOTFmNmI0Ny0xNzE3LTRiYmUtODc1Yi0xNTcwZDRlNjgwOTYiLCJpc3MiOiJodHRwOi8vZG9ja2VyLmZyaXR6LmJveDo4MDgxL2F1dGgvcmVhbG1zL2ZsZWlzaG9yIiwic3ViIjoiYTIwMTUzZWQtYWFmZi00NzE0LWJmNmQtOGRjZTQ5NzIwM2M2IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiQmFzZURhdGFBcHAiLCJzaWQiOiJlOTEyNWZkNS05ZDJmLTQxZGQtYjc5Zi01Yjk5NzcxMGIwYzUiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsiUmVhbG1NYW5hZ2VyIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiQmFzZURhdGFBcHAiOnsicm9sZXMiOlsiQmFzZURhdGFBcHBNYW5hZ2VyIl19fSwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCByb2xlcyIsIm5hbWUiOiJIb3JzdCAgRmxlaXNjaGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZmxlaXNob3IiLCJnaXZlbl9uYW1lIjoiSG9yc3QgIiwiZmFtaWx5X25hbWUiOiJGbGVpc2NoZXIifQ.M7IGYTq8yR3_uRecEZ47SypqXI6F9KQjDkXvl8XY7JMIQTJX0rLJVaE-KeHJ-ff7XpdFAIVGu2SncuwC-KnUtxD7hJYo7uae0EmcHzknA57D9uxOCjSwqdMNCaDBiY7GuULXVwy3UW7epETcm6zo0h34vO6cG3zoG7xUYaH51C_xzTW9dcmG_4xBjdfhsdQM15tk29I-mX_4_P8z0XdUkwTJ0Cb94k1tQvnm4BzJB3UCexNfV_EgWSVz5-tlRUi9Rogn16mDJ1lPC1kesaE7BhZRa1sUkYUurDQ4YkQuNa3hARMLkjnT2QfTqklDwSJaRtQF6uLX6tHv4_926lixHg",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "refresh_token": "eyJhbGciOiJIUzUxMiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0NWJhMjFjMS0xZDFiLTQ3OGMtOGQ2Zi1iMzNmMzBkMGY1MzEifQ.eyJleHAiOjE3NDQyMTc1NjYsImlhdCI6MTc0NDIxNTc2NiwianRpIjoiNjhkYjJiNDYtMjM5YS00MWEwLTg5NGItOTJhYjRjYWQ5ZWI0IiwiaXNzIjoiaHR0cDovL2RvY2tlci5mcml0ei5ib3g6ODA4MS9hdXRoL3JlYWxtcy9mbGVpc2hvciIsImF1ZCI6Imh0dHA6Ly9kb2NrZXIuZnJpdHouYm94OjgwODEvYXV0aC9yZWFsbXMvZmxlaXNob3IiLCJzdWIiOiJhMjAxNTNlZC1hYWZmLTQ3MTQtYmY2ZC04ZGNlNDk3MjAzYzYiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoiQmFzZURhdGFBcHAiLCJzaWQiOiJlOTEyNWZkNS05ZDJmLTQxZGQtYjc5Zi01Yjk5NzcxMGIwYzUiLCJzY29wZSI6Im9wZW5pZCBhY3IgcHJvZmlsZSB3ZWItb3JpZ2lucyBlbWFpbCByb2xlcyBiYXNpYyJ9.V7xwM1G7z43Uz7HUyZHwnvtF9TeRegXhJNNxLX3-fhWZM_7j4RfnZcxixKWsMPyya2Bwhas9U3NsELbXsPFMgw",
    "token_type": "Bearer",
    "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJMTVE0b2VGbm9OendlaEFqaWxoek9vOTVxcnJzcU5mQ2w3YmtRZzBvbDk4In0.eyJleHAiOjE3NDQyMTYwNjYsImlhdCI6MTc0NDIxNTc2NiwiYXV0aF90aW1lIjoxNzQ0MjE1NzY2LCJqdGkiOiI4MzQwYzViNS02ZWMzLTQ2ZTYtODZhOS0yOTYxNTI1MWIzY2YiLCJpc3MiOiJodHRwOi8vZG9ja2VyLmZyaXR6LmJveDo4MDgxL2F1dGgvcmVhbG1zL2ZsZWlzaG9yIiwiYXVkIjoiQmFzZURhdGFBcHAiLCJzdWIiOiJhMjAxNTNlZC1hYWZmLTQ3MTQtYmY2ZC04ZGNlNDk3MjAzYzYiLCJ0eXAiOiJJRCIsImF6cCI6IkJhc2VEYXRhQXBwIiwic2lkIjoiZTkxMjVmZDUtOWQyZi00MWRkLWI3OWYtNWI5OTc3MTBiMGM1IiwiYXRfaGFzaCI6InpqYWhkM1RPOVM5MWdhcUZYVzIxdlEiLCJhY3IiOiIxIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJSZWFsbU1hbmFnZXIiXX0sIm5hbWUiOiJIb3JzdCAgRmxlaXNjaGVyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiZmxlaXNob3IiLCJnaXZlbl9uYW1lIjoiSG9yc3QgIiwiZmFtaWx5X25hbWUiOiJGbGVpc2NoZXIiLCJlbWFpbCI6ImhvcnN0LmZsZWlzY2hlckB3ZWIuZGUifQ.rXiGXGi1CIX5izYs8VCPLX5QK01Bh28MGjyhv0_Fnpbms2K-JAIpSfeVGnY7kBOt_N6NPdDwt8mEducCqVZGftdsm5h-9GJAr1KzLYc-_Zw_sYaokmmknBgCkuPJQ_WoLuRTMO7wPlcqJhaX9WhJ7cvU_jklOOSybu2IqbrnWvK4b3PjHE-ATu7ddOOg_5gFkmCNGLMJJiP-tKeFvthW2d0r4oA699gKfsnJ_h6_o6LDyCrIAFwq8BD3PxpwoQ0i4xpCYRBRJJpOEjr8Kuaat7fIMZ_LPMF8w6tERkrQvt0UUSKJlbJFE8X-zkJGIPsI6MyiKCNmEqUziVKUHLPvFw",
    "not-before-policy": 1742214942,
    "session_state": "e9125fd5-9d2f-41dd-b79f-5b997710b0c5",
    "scope": "openid profile email roles"
}
~~~

### Id Token

~~~json
{
    "exp": 1744216066,
    "iat": 1744215766,
    "auth_time": 1744215766,
    "jti": "8340c5b5-6ec3-46e6-86a9-29615251b3cf",
    "iss": "http://docker.fritz.box:8081/auth/realms/fleishor",
    "aud": "BaseDataApp",
    "sub": "a20153ed-aaff-4714-bf6d-8dce497203c6",
    "typ": "ID",
    "azp": "BaseDataApp",
    "sid": "e9125fd5-9d2f-41dd-b79f-5b997710b0c5",
    "at_hash": "zjahd3TO9S91gaqFXW21vQ",
    "acr": "1",
    "email_verified": true,
    "realm_access": {
        "roles": [
            "RealmManager"
        ]
    },
    "name": "Horst  Fleischer",
    "preferred_username": "fleishor",
    "given_name": "Horst ",
    "family_name": "Fleischer",
    "email": "horst.fleischer@web.de"
}
~~~

### Access Token

~~~json
{
    "exp": 1744216066,
    "iat": 1744215766,
    "auth_time": 1744215766,
    "jti": "391f6b47-1717-4bbe-875b-1570d4e68096",
    "iss": "http://docker.fritz.box:8081/auth/realms/fleishor",
    "sub": "a20153ed-aaff-4714-bf6d-8dce497203c6",
    "typ": "Bearer",
    "azp": "BaseDataApp",
    "sid": "e9125fd5-9d2f-41dd-b79f-5b997710b0c5",
    "acr": "1",
    "allowed-origins": [
        "http://localhost:3001"
    ],
    "realm_access": {
        "roles": [
            "RealmManager"
        ]
    },
    "resource_access": {
        "BaseDataApp": {
            "roles": [
                "BaseDataAppManager"
            ]
        }
    },
    "scope": "openid profile email roles",
    "name": "Horst  Fleischer",
    "preferred_username": "fleishor",
    "given_name": "Horst ",
    "family_name": "Fleischer"
}
~~~
