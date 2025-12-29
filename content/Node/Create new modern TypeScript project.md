---
showOnIndexPage: true
draft: true
date: 2025-11-08
title: Create a new modern TypeScript project
image: Node.png
description: Create a new modern TypeScript project
tags:
  - NodeJS
  - Typescript
---

## References

- [Node.js 2025 Guide: How to Set Up Express.js with TypeScript, ESLint, and Prettier](https://medium.com/@gabrieldrouin/node-js-2025-guide-how-to-setup-express-js-with-typescript-eslint-and-prettier-b342cd21c30d)

## npm init

~~~
npm init -y
~~~

Your directory should now contain a boilerplate`package.json` file. You must add or replace the `"type": "module"` field to specify that this project uses ES Modules.

~~~json
{
  "name": "PlainTypeScript",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "module"
}
~~~

## Install TypeScript

~~~
npm install -D typescript
~~~

## Install Express.js

~~~
npm install express
~~~

## Install Node and Express types

~~~
npm install -D @types/node @types/express @tsconfig/node24
~~~

## Create tsconfig.json

~~~
npx tsc --init
~~~

~~~json
{
  "extends": "@tsconfig/node24/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["**/*.ts"],
  "exclude": ["dist"]
}
~~~

## Simple Server

~~~typescript
import express from "express";  
const app = express();  
const port = "3000";  
  
app.get("/", (req, res) => {  
  res.send("Hello World!");  
  console.log("Response sent");  
});  
  
app.listen(port, () => {  
  console.log(`Example app listening on port ${port}`);  
});
~~~

## Compile TypeScript index.ts

~~~
npx tsc
~~~

## Install TypeScript runner tsx

~~~
npm install -D tsx
~~~

## Standard scripts in package.json

~~~json
"scripts": {
    "dev": "tsx --watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc",
    "type-check": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint --fix .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "echo \"Error: no test specified\" && exit 1",
  },
~~~

## Install Prettier

~~~
npm install -D prettier
~~~

~~~
echo '{}' > .prettierrc
~~~

~~~
echo 'dist' > .prettierignore
~~~

## Install ESLint

~~~
npm install -D eslint typescript-eslint @eslint/js eslint-plugin-perfectionist
~~~

We can configure the `eslint.config.js` file.

~~~javascript
// @ts-check  
  
import eslint from "@eslint/js";  
import tseslint from "typescript-eslint";  
import perfectionist from "eslint-plugin-perfectionist";  
  
export default tseslint.config(  
  {  
    ignores: ["**/*.js"],  
  },  
  eslint.configs.recommended,  
  tseslint.configs.strictTypeChecked,  
  tseslint.configs.stylisticTypeChecked,  
  {  
    languageOptions: {  
      parserOptions: {  
        projectService: true,  
        tsconfigRootDir: import.meta.dirname,  
      },  
    },  
  },  
  perfectionist.configs["recommended-natural"],  
);
~~~

## Use subpath imports

Add an “import” option in our `package.json` file.

~~~json
  "imports": {  
    "#*": "./src/*"  
  }
~~~

Allowing us to use the ‘#’ prefix for our import statements like so.

~~~typescript
// index.ts  
import express from "express";  
import { middleware } from "#middlewares/middlewares.js";  
  
const app = express();  
const port = "3000";  
  
app.get("/", middleware);  
  
app.listen(port, () => {  
  console.log(`Example app listening on port ${port}`);  
});
~~~

## Use environment variables

Create a `.env` file in our project root.

~~~
echo PORT=3000 > .env
~~~

~~~typescript
// index.ts  
import express from "express";  
import { middleware } from "#middlewares/middlewares.js";  
  
const app = express();  
const port = process.env.PORT ?? "9001";  
  
app.get("/", middleware);  
  
app.listen(port, () => {  
  console.log(`Example app listening on port ${port}`);  
});
~~~

We then specify in our `package.json` scripts to use the environment variables.

~~~json
"scripts": {  
    "dev": "tsx --watch --env-file .env src/index.ts",  
    "start": "node --env-file .env dist/index.js",  
  },
~~~

We can also specify different scripts for different environments.

~~~json
"scripts": {  
   "dev": "tsx --watch --env-file .env.development src/index.ts",  
   "dev:staging": "tsx --watch --env-file .env.staging src/index.ts",   
   "dev:prod": "tsx --watch --env-file .env.production src/index.ts",  
},
~~~

## .gitignore

~~~
# Environment variables  
.env  
.env.*  
!.env.example  
  
# Dependencies  
/node_modules  
  
# TypeScript build output  
/dist  
  
# OS generated files  
.DS_Store  
  
# Test coverage  
/coverage
~~~
