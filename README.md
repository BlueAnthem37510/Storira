[English](README.md) 

---

# Storira

This project aims to recreate the story reader of Revue Starlight Re:Live for archival purposes.

## License

See here for the Cubism Web Samples license which this project uses as its base. [license](LICENSE.md) 

## Directory structure

```
.
├─ .vscode          # Project settings directory for Visual Studio Code
├─ Core             # Directory containing Live2D Cubism Core
├─ Framework        # Directory containing source code such as rendering and animation functions
└─ Samples
   ├─ Resources     # Directory containing resources such as model files and images
   └─ TypeScript    # Directory containing TypeScript sample projects
```


## Live2D Cubism Core for Web

A library for loading the model.

This repository does not manage Cubism Core.
Download the Cubism SDK for Web from [here](https://www.live2d.com/download/cubism-sdk/download-web/) and copy the files in the Core directory.


## Development environment construction

1. Install [Node.js] and [Visual Studio Code]
1. Open **the top directory of this SDK** in Visual Studio Code and install the recommended extensions
    * In addition to pop-up notifications, you can check the others by typing `@recommended` from the Extensions tab

### Operation check of sample demo

Enter `>Tasks: Run Task` in the command palette (*View > Command Palette...*) to display the task list.

1. Select `npm: install - Samples/TypeScript/Demo` from the task list to download the dependent packages
1. Select `npm: build - Samples/TypeScript/Demo` from the task list to build the sample demo
1. Select `npm: serve - Samples/TypeScript/Demo` from the task list to start the simple server for operation check
1. Enter `http://localhost:5000/Samples/TypeScript/Demo/` in the URL field of your browser to access it
1. Enter `>Tasks: Terminate Task` from the command palette and select `npm: serve` to terminate the simple server

For other tasks, see [README.md](Samples/TypeScript/README.md) of the sample project.

NOTE: Settings for debugging are described in `.vscode/tasks.json`.

### Project debugging

Open **the top directory of this SDK** in Visual Studio Code and enter the *F5* key to start Debugger for Chrome.

You can place breakpoints in Visual Studio Code to debug in conjunction with the Chrome browser.

NOTE: Settings for debugging are described in `.vscode/launch.json`.


## SDK manual

[Cubism SDK Manual](https://docs.live2d.com/cubism-sdk-manual/top/)


## Changelog

Samples : [CHANGELOG.md](CHANGELOG.md)

Framework : [CHANGELOG.md](Framework/CHANGELOG.md)

Core : [CHANGELOG.md](Core/CHANGELOG.md)


## Development environment

### Node.js

* 21.7.1
* 20.11.1


## Operation environment

| Platform | Browser | Version |
| --- | --- | --- |
| Android | Google Chrome | 122.0.6261.106 |
| Android | Microsoft Edge | 122.0.2365.86 |
| Android | Mozilla Firefox | 123.1.0 |
| iOS / iPadOS | Google Chrome | 122.0.6261.89 |
| iOS / iPadOS | Microsoft Edge | 122.0.2365.86 |
| iOS / iPadOS | Mozilla Firefox | 123.4 |
| iOS / iPadOS | Safari | 17.4 |
| macOS | Google Chrome | 122.0.6261.129 |
| macOS | Microsoft Edge | 122.0.2365.80 |
| macOS | Mozilla Firefox | 123.0.1 |
| macOS | Safari | 17.4 |
| Windows | Google Chrome | 122.0.6261.129 |
| Windows | Microsoft Edge | 122.0.2365.80 |
| Windows | Mozilla Firefox | 123.0.1 |

Note: You can start the server for operation check by running the `serve` script of `./Samples/TypeScript/Demo/package.json`.


## Contributing

There are many ways to contribute to the project: logging bugs, submitting pull requests on this GitHub, and reporting issues, missing assets, and making suggestions.

### Forking And Pull Requests

Any help is much appreciated!

