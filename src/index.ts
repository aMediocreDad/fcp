import { SvelteComponent } from "svelte";
import Palette from "./Palette.svelte";

declare global {
	interface LenientGlobalVariableTypes {
		game: never;
	}
	interface Theme {
		name: string;
		color: string;
		descriptionColor: string;
		backgroundColor: string;
		activeResultBackgroundColor: string;
		activeResultDescriptionColor: string;
		activeResultTitleColor: string;
		scale: string;
	}
	interface CONFIG {
		fcp: {
			commandFns: {
				[key: string]: (arg: unknown | never) => void | never;
			};
			commands: Record<string, any>[];
			keybinding: {
				key: string;
				modifiers: string[];
			};
			themes: { [key: string]: Theme };
			instance: SvelteComponent | null;
		};
	}
}

const t = (string: string) => game.i18n.localize(string);

const fetchAndConcatenateConfig = async () => {
	// Get the manifests from either the system-, module-, or world.json files
	const commandManifests = ["system", "modules", "world"]
		.map((e) => {
			const concManifestStrings = (e: any, m: any) => {
				return m.flags?.fcp?.commands?.map((c: string) => `/${e}/${m.name}/${c.replace(/^\//, "")}`) || [];
			};

			const manifests: string[] = [];
			if (e === "modules")
				game[e].forEach((m) => {
					manifests.push(...concManifestStrings(e, m));
				});
			else manifests.push(...concManifestStrings(e, game[e as "system" | "world"]));

			return manifests;
		})
		.flat();

	// Fetch the commands from manifests
	const config = await Promise.all(
		commandManifests.map(async (manifest) => {
			const { commands } = (await foundry.utils
				.fetchJsonWithTimeout(manifest)
				.catch((e) => console.error(e))) as {
				commands: Record<string, any>[];
			};
			return commands.map((command) => {
				if (command.exec.match(/^(?:function\s?\([^\)]*\))|(?:\([^\)]*\)\s?=>)/))
					command.exec = (0, eval)(command.exec);
				else command.exec = CONFIG.fcp.commandFns[command.exec];
				if (command.getMatchString) command.getMatchString = (0, eval)(command.getMatchString);
				return command;
			});
		})
	);
	return config.flat();
};

Hooks.once("init", async () => {
	CONFIG.fcp = {
		commandFns: {},
		commands: await fetchAndConcatenateConfig(),
		keybinding: {
			key: "KeyK",
			modifiers: ["Control"],
		},
		themes: {
			default: {
				name: t("FCP.Settings.Theme.DefaultTheme"),
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

	// Call hook for programmatic edits
	await Hooks.call("fcpInit", CONFIG.fcp);

	game.keybindings.register("fcp", "toggleCommandPalette", {
		name: t("FCP.Settings.ToggleKey.Name"),
		hint: t("FCP.Settings.ToggleKey.Description"),
		editable: [
			{
				key: CONFIG.fcp.keybinding.key,
				modifiers: CONFIG.fcp.keybinding.modifiers,
			},
		],
		onDown: () => {
			if (!CONFIG.fcp.instance) return;
			CONFIG.fcp.instance.toggle();
		},
		onUp: () => {},
		restricted: false,
		precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
	});
});

Hooks.once("ready", async () => {
	const choices = Object.entries(CONFIG.fcp.themes).reduce((obj, [key, theme]) => {
		obj[key] = (theme as Theme).name;
		return obj;
	}, {} as Record<string, string>);

	game.settings.register("fcp", "theme", {
		name: t("FCP.Settings.Theme.Name"),
		hint: t("FCP.Settings.Theme.Description"),
		scope: "client",
		config: true,
		type: String,
		choices,
		default: "default",
	});

	const placeholder = t("FCP.CommandPalette.Placeholder");
	const currentThemeKey = game.settings.get("fcp", "theme") as string;
	const currentTheme = CONFIG.fcp.themes[currentThemeKey] || CONFIG.fcp.themes.default;
	const commands = CONFIG.fcp.commands || [];

	CONFIG.fcp.instance = new Palette({
		target: document.body,
		props: {
			commands,
			currentTheme,
			placeholder,
		},
	});
});
