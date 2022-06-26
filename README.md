# WshDotEnv

DotEnv-like module for WSH (Windows Script Host) that reads/writes environment values in a .env file.

## tuckn/WshModeJs basic applications structure

[WshBasicApps](https://github.com/tuckn/WshBasicPackage)  
&emsp;&emsp;├─ [WshCommander](https://github.com/tuckn/WshCommander) (./dist/module.js)  
&emsp;&emsp;├─ [WshConfigStore](https://github.com/tuckn/WshConfigStore) (./dist/module.js)  
&emsp;&emsp;├─ WshDotEnv - This repository (./dist/module.js)  
&emsp;&emsp;├─ [WshLogger](https://github.com/tuckn/WshLogger) (./dist/module.js)  
&emsp;&emsp;└─ [WshModeJs](https://github.com/tuckn/WshModeJs) (./dist/bundle.js)  

WshBasicApps can use all the above modules.

## Operating environment

Works on JScript in Windows.

## Installation

(1) Create a directory of your WSH project.

```console
D:\> mkdir MyWshProject
D:\> cd MyWshProject
```

(2) Download this ZIP and unzip or Use the following `git` command.

```console
> git clone https://github.com/tuckn/WshDotEnv.git ./WshModules/WshDotEnv
or
> git submodule add https://github.com/tuckn/WshDotEnv.git ./WshModules/WshDotEnv
```

(3) Create your JScript (.js) file. For Example,

```console
D:\MyWshProject\
├─ MyScript.js <- Your JScript code will be written in this.
└─ WshModules\
    └─ WshDotEnv\
        └─ dist\
          └─ bundle.js
```

I recommend JScript (.js) file encoding to be UTF-8 [BOM, CRLF].

(4) Create your WSF packaging scripts file (.wsf).

```console
D:\MyWshProject\
├─ Run.wsf <- WSH entry file
├─ MyScript.js
└─ WshModules\
    └─ WshDotEnv\
        └─ dist\
          └─ bundle.js
```

And you should include _.../dist/bundle.js_ into the WSF file.
For Example, The content of the above _Run.wsf_ is

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshDotEnv/dist/bundle.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

I recommend this WSH file (.wsf) encoding to be UTF-8 [BOM, CRLF].

Awesome! This WSH configuration allows you to use the following functions in JScript (_.\\MyScript.js_).

## Usage

Now the above _.\\MyScript.js_ (JScript) can handle .env file.
If the contents of .env file are following...

```sh
# Lines beginning with # are threated as comments,
EMPTY=
JSON={ foo: "bar" }
WHITE_SPACE=  some value
SINGLE_QUOTE='  some value '
DOUBLE_QUOTE="  Some Value "
MULTILINE="new
line"
DIR_7ZIP=C:\Program Files\7-Zip
PATH_CONFIG=.\.config\office-smb-resources.json
```

```js
var dotenv = Wsh.DotEnv;
dotenv.config(); // Default: Reads the current directory .env file

console.dir(process.env);
// Outputs: {
//   ALLUSERSPROFILE: "C:\ProgramData",
//   APPDATA: "C:\Users\UserName\AppData\Roaming",
//   CommonProgramFiles: "C:\Program Files\Common Files",
//   CommonProgramFiles(x86): "C:\Program Files (x86)\Common Files",
//   CommonProgramW6432: "C:\Program Files\Common Files",
//   ..
//   ...
//   EMPTY: "",
//   JSON: { foo: "bar" },
//   WHITE_SPACE: "some value",
//   SINGLE_QUOTE: "  some value ",
//   DOUBLE_QUOTE: "  Some Value ",
//   MULTILINE: "new
// line",
//   DIR_7ZIP: "C:\Program Files\7-Zip",
//   PATH_CONFIG: ".\.config\office-smb-resources.json" }
```

### To Change Env-Path

```js
var dotenv = Wsh.DotEnv;

// Ex 1. Default: Reads the current directory .env file
dotenv.config();
// Ex 2. Reads the WSH script directory .env file
dotenv.config({ path: 'portable' });
// Ex 3. Reads the user's directory (%USERPROFILE%) .env file. e.g. C:\Users\<Name>\.env
dotenv.config({ path: 'userProfile' });
// Ex 4. Reads the custom file
dotenv.config({ path: 'D:\\temp\\myValue.txt' });
// Can use the date literal
dotenv.config({ path: 'D:\\#{yyyy}\\#{MM}\\#{dd}.env', parsesDate: true });
// Will convert the path to 'D:\\2020\\08\\10.env'
```

### Together with another WshModeJs Apps

If you want to use it together with other WshModeJs Apps, install as following

```console
> git clone https://github.com/tuckn/WshModeJs.git ./WshModules/WshModeJs
> git clone https://github.com/tuckn/WshCommander.git ./WshModules/WshCommander
> git clone https://github.com/tuckn/WshDotEnv.git ./WshModules/WshDotEnv
or
> git submodule add https://github.com/tuckn/WshModeJs.git ./WshModules/WshModeJs
> git submodule add https://github.com/tuckn/WshCommander.git ./WshModules/WshCommander
> git submodule add https://github.com/tuckn/WshDotEnv.git ./WshModules/WshDotEnv
```

The definition in the WSF packaging scripts file (.wsf) is as follows.

```xml
<package>
  <job id = "run">
    <script language="JScript" src="./WshModules/WshModeJs/dist/bundle.js"></script>
    <script language="JScript" src="./WshModules/WshCommander/dist/module.js"></script>
    <script language="JScript" src="./WshModules/WshDotEnv/dist/module.js"></script>
    <script language="JScript" src="./MyScript.js"></script>
  </job>
</package>
```

Please note the difference between `.../dist/bundle.js` and `.../dist/module.js`.

I recommend using [WshBasicApps](https://github.com/tuckn/WshBasicPackage).
That includes all modules.

### Dependency Modules

You can also use the following helper functions in your JScript (_.\\MyScript.js_).

- [tuckn/WshPolyfill](https://github.com/tuckn/WshPolyfill)
- [tuckn/WshUtil](https://github.com/tuckn/WshUtil)
- [tuckn/WshPath](https://github.com/tuckn/WshPath)
- [tuckn/WshOS](https://github.com/tuckn/WshOS)
- [tuckn/WshFileSystem](https://github.com/tuckn/WshFileSystem)
- [tuckn/WshProcess](https://github.com/tuckn/WshProcess)
- [tuckn/WshChildProcess](https://github.com/tuckn/WshChildProcess)
- [tuckn/WshNet](https://github.com/tuckn/WshNet)
- [tuckn/WshModeJs](https://github.com/tuckn/WshModeJs)

## Documentation

See all specifications [here](https://docs.tuckn.net/WshDotEnv) and also below.

- [WshPolyfill](https://docs.tuckn.net/WshPolyfill)
- [WshUtil](https://docs.tuckn.net/WshUtil)
- [WshPath](https://docs.tuckn.net/WshPath)
- [WshOS](https://docs.tuckn.net/WshOS)
- [WshFileSystem](https://docs.tuckn.net/WshFileSystem)
- [WshProcess](https://docs.tuckn.net/WshProcess)
- [WshChildProcess](https://docs.tuckn.net/WshChildProcess)
- [WshNet](https://docs.tuckn.net/WshNet)
- [WshModeJs](https://docs.tuckn.net/WshModeJs)

## License

MIT

Copyright (c) 2020 [Tuckn](https://github.com/tuckn)
