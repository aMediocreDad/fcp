<p align="center">
  <a href="https://github.com/amediocredad/fcp/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/aMediocreDad/fcp?style=flat-square"/></a>
  <a href="https://github.com/amediocredad/fcp/releases/latest" target="_blank"><img alt="system version" src="https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Famediocredad%2Ffcp%2Fmain%2Fmodule.json&label=Version&query=$.version&colorB=blue&style=flat-square"/></a>
  <a href="https://foundryvtt.com" target="_blank">
    <img src="https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Famediocredad%2Ffcp%2Fmain%2Fmodule.json&label=Foundry&query=$.minimumCoreVersion&colorB=blue&style=flat-square" alt="foundry-compatibility-version"/></a>
  <a href="https://github.com/amediocredad/fcp/graphs/commit-activity" target="_blank"><img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/amediocredad/fcp?style=flat-square&color=purple&label=Last%20commit"></a>
 <a href="https://github.com/amediocredad/fcp/releases/latest/" target="_blank"><img alt="GitHub release (latest by SemVer including pre-releases)" src="https://img.shields.io/badge/dynamic/json?color=red&label=Downloads&query=$.assets.0.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Famediocredad%2Ffcp%2Freleases%2Flatest&style=flat-square"></a>
</p>

# Foundry Command Palette

A programmable command palette for the Foundry Virtual Tabletop.

![fcp_preview](https://user-images.githubusercontent.com/9851733/184683045-42831ef3-6d3b-4adc-bf6c-e6136c490ad4.gif)

## Installation

You can find Foundry Command Palette in the [Foundry VTT module listing](https://foundryvtt.com/packages/fcp).

### Installing manually:

To install manually, simply copy the below url and paste it into the module installation-window in Foundry VTT.

```bash
https://raw.githubusercontent.com/aMediocreDad/fcp/main/module.json
```

## Roadmap

While the project is in its early stages, there are some things that I'd like to do:

-   Support keybinding commands using the same API for defining commands. (These keybindings would then be remapable through foundry's native keybinding interface).
-   Support for user-defined commands (through an interface in settings).

This project was spawned from a completely different project I am working on which is a full text search for Foundry Journals. The idea was not to make a complex command line, rather a simple one. There will inevitably be questions of autocompleting search for subcommands or parameters. This will likely not be implemented, if you need something more akin to a search feature look rather to [Commander](https://foundryvtt.com/packages/commander) or [Quick Insert](https://foundryvtt.com/packages/quick-insert).

## Usage

Once installed, the module can by default be accessed by pressing `Cmd/Ctrl + K`. The hotkey combination can be remapped as you like in the settings sidebar, under `Configure Controls` (look for Foundry Command Palette in the menu).

Start typing to see available commands that match your input. Typing `e` or `p` generally shows a many of the available commands.

To activate a command either use the arrow keys to navigate to it, type out the name of the command so it is at the top of the list and hit the `enter`-key, or use your mouse to find and click the desired command.

Some commands require additional parameters to be specified. These are often described in the description of the command. A parameter is usually input as `-<parameter> <value>`. See the short gif above for an example.

### Settings

In the main settings you can find a list of available themes to choose between. These can be added programatically by either systems/modules or by you if you know a bit of programming (see the configuration section).

Additionally, as mentioned above the hotkey can be remapped in `Configure Controls`.

## Customization

The module can be customized by adding new commands, or new themes. Themes are defined upon initialization, whereas commands are defined using a JSON schema.

### Commands

Commands are easily added by using a schema. Simply create a new `json` file in your module or system and add the schema specifier using:

```json
{
	"$schema": "https://raw.githubusercontent.com/aMediocreDad/fcp/main/schema/commands.json"
	// ...
}
```

The schema should assist you in creating valid command configurations.

To add the commands in your new configuration file to the list of available commands, simply add it to your package manifest (`system.json`, `module.json`, or `world.json`), like so:

```json
{
	"flags": {
		"fcp": {
			// Use the relative path from the root of your package, with no `/` or `./` preceding it.
			"commands": ["path/to/fcp-config.json"]
		}
	}
}
```

See the `module.json` of this package for an example.

#### Declaring command functions separately

If command function depends on other context in your system/module/world, you can define the command separately, and add it to the `CONFIG.fcp.commandFns` object (see [Further Customization](#further-customization) for details on timing). The `key` would then be what you use as a value in the `exec`-property of your config file.

#### Command `exec` parameters

The commands themselves get some parameters when invoked by the command palette:

```ts
(cmd: Command, parsedInput: string[] | [string, Record<string, string>]) => void
```

Where `Command` is the whole command object itself defined in your command config file (See the [schema](https://github.com/aMediocreDad/fcp/blob/main/schema/commands.json) for details).

The parsed input is either an array with one string, or if using parameters; the first item in the array is the parsed input string, while the second is an object: `[parametername]: inputValue`.

### Theme

Themes can be added to the `CONFIG.fcp.themes` object. The timing is described below, but generally the `fcpInit` or `setup` hook is preferred.

```ts
interface CONFIG.fcp.themes {
	default: Theme;
	myTheme: Theme;
}
```

The `Theme` object is defined as follows:

```ts
interface Theme {
	name: string; // A localized name displayed in the settings menu
	color: string; // Primary text color (input and title)
	descriptionColor: string; // Color of the subheading or description text
	backgroundColor: string; // Primary background color
	activeResultBackgroundColor: string; // Highlight background color
	activeResultDescriptionColor: string; // Highlight description color
	activeResultTitleColor: string; // Highlight title color
	scale: string; // The size of the prompt
}
```

### Further customization

While no further customization is intended. It is possible to add or remove themes, or change other aspects of the module's configuration programmatically (like adding `command functions`).

To do this the `fcpInit`-hook is called during `init`. This hook is called with the `CONFIG.fcp` object to allow easy editing of the config object.

The rest of the module's setup happens during `ready`, so the `setup` hook should also be safe to use.
