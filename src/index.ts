import Palette from "./Palette.svelte";
import { defineActions } from "svelte-command-palette";

export interface Theme {
	name: string;
	color: string;
	descriptionColor: string;
	backgroundColor: string;
	activeResultBackgroundColor: string;
	activeResultDescriptionColor: string;
	activeResultTitleColor: string;
	scale: string;
}

const t = (string) => game.i18n.localize(string);

Hooks.once("init", () => {
	CONFIG.fcp = {
		commands: [
			{
				id: "open-settings",
				title: "Open Settings",
				description: "Opens the settings menu",
				exec: () => game.settings.sheet.render(true),
			},
			{
				id: "open-macros",
				title: "Open Macros",
				description: "Opens the macros menu",
				exec: () => ui.macros.renderPopout(true),
			},
		],
		themes: {
			default: {
				name: "Default",
				color: "rgba(212, 208, 199, 1.00)",
				descriptionColor: "rgba(212, 208, 199, 1.00)",
				backgroundColor: "rgba(36, 36, 36, 1.00)",
				activeResultBackgroundColor: "rgba(64, 64, 64, 1.00)",
				activeResultDescriptionColor: "rgba(255, 255, 255, 1.00)",
				activeResultTitleColor: "rgba(255, 255, 255, 1.00)",
				scale: "1.3",
			},
		},
		instance: null,
	};
});

Hooks.once("setup", () => {
	const choices = Object.entries(CONFIG.fcp.themes).reduce((obj, [key, theme]: [string, Theme]) => {
		obj[key] = theme.name;
		return obj;
	}, {});

	game.settings.register("fcp", "theme", {
		name: t("FCP.Settings.Theme.Name"),
		hint: t("FCP.Settings.Theme.Description"),
		scope: "client",
		config: true,
		type: String,
		choices,
		default: "Default",
	});
	game.settings.register("fcp", "toggleKey", {
		name: t("FCP.Settings.ToggleKey.Name"),
		hint: t("FCP.Settings.ToggleKey.Description"),
		scope: "client",
		config: true,
		type: String,
		default: "p",
	});
});

Hooks.once("ready", () => {
	const commands = CONFIG?.fcp.commands;
	const toggleKey = game.settings.get("fcp", "toggleKey");
	const placeholder = t("FCP.CommandPalette.Placeholder");
	const currentThemeKey = game.settings.get("fcp", "theme");
	const currentTheme = CONFIG.fcp.themes[currentThemeKey];

	CONFIG.fcp.instance = new Palette({
		target: document.body,
		props: {
			commands,
			currentTheme,
			toggleKey,
			placeholder,
		},
	});
});
