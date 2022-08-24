# poglis
A minimal and customizable webhook catcher written in TypeScript.
<br>
WARNING: THIS SOFTWARE IS UNTESTED (will write tests soon, I promise) AND IN SUPER EARLY ALPHA (I BASICALLY WANTED TO HAVE SOMETHING COOL ON MY GITHUB), USE IT AT YOUR OWN RISK.
SECOND WARNING: I WROTE THIS THING VERY QUICKLY, WILL OPTIMIZE LATER 
# installation (for now)
```
  $ git clone https://github.com/emilianomaccaferri/poglis
  $ yarn install
```
# usage
## requirements
  - `node v16.16.0` or higher
  - `TypeScript 4.7.3` or higher
  - this software is currently designed only for *nix OSes and it won't work on Windows 
## starting poglis
```
 $ tsc
 $ node build/main.js
```

You can tweak stuff in the `.env` file (basically you can only change the port on which poglis will listen and its workers).<br>
Example `.env` file:
```
PORT=5600
WORKERS=4
```
## hooks
You can configure endpoints in the `hooks` directory. Essentially, a hook is composed of:
  - a folder
  - a config file (`config.yml`)
  - one or more jobs
  - zero or more middlewares

To register a hook you need to create a folder into the `hooks` directory. A hook's configuration resides in its `config.yml` file.<br>
For example, if you want to create the hook for the `/hello` endpoint you just need to create the `hello` folder in the `hooks` directory and the create a `config.yml` file inside of it.
### hooks: `config.yml`
The configuration file for a hook is very simple, here's an example:
```
# hooks/hello/config.yml
name: 'hello hook'
method: 'post'
task: 
  - script.sh
```
The configuration has five fields:
  - `name`: defines the hook's name (optional, defaults to the hook's endpoint);
  - `route`: defines the hook's endpoint, aka the path it can be accessed at (optional, defaults to the hook's folder name);
  - `method`: defines the hook's method (required, it can be `get` or `post`);
  - `task`: defines the hook's pipeline. This option has to be a list of shell scripts listed in the hook's directory. Scripts are executed sequentially and in order of appearance inside the config (for now) (required);
  - `middlewares`: defines the hook's middlewares executed BEFORE the task itself. Middlewares are [Koa middlewares](https://koajs.com/) and are listed in the `src/middlewares` directory. Middlewares are defined without their extension (optional).<br>
Scripts will run in a temporary and separated folder so they won't pollute the project directory.<br><br>
### example usage
Let's create a `POST /hello-world` hook defined in the `hooks/hello` directory.
```
$ mkdir -p hooks/hello
$ touch hooks/hello/config.yml
```
The `config.yml` file for this hook will be:
```
name: 'hello world hook' # optional
method: 'post'
route: '/hello-world' # optional, overwrites default (hello)
task:
  - test.sh
  - build.sh
 middlewares:
  - before
```
The folder structure will be:
```
.
├── hooks
│   └── hello
│       ├── build.sh
│       ├── config.yml
│       └── test.sh
├── src
│   └── middleware
│       └── before.ts
```
The middleware is a simple Koa middleware...
```
// src/middleware/before.ts
import { Context, Next } from "koa"

export default async(ctx: Context, next: Next) => {

    console.log("hello!!!")
    return next();

}
```
... which will be executed before every route which explicits it.
## "advanced" features
Every script has access to a custom set of enviromental variables:
  - every property in the body is exposed to the script and accessible via `$body_varname`
  - every property in the query is also exposed and is accessible via `$query_varname`
  - every property in the request state (Koa's [state](https://koajs.com/)) and is accessible via `$state_varname`
  
If, for example, your hook (i.e. a POST request) receives a property named `fagiolo` inside the request body, you can access it in your scripts via `$body_fagiolo`. The same applies for query parameters and state properties, of course.
