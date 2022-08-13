<script>
	import CommandPalette from "@actus/svelte/dist/";

	export let placeholder;
	export let currentTheme;
	export let commands;
	export let toggleKey = "p";

	let dragging = false;
	let x = 0;
	let y = 0;

	$: theme = {
		"--color": currentTheme.color,
		"--result-description-color": currentTheme.descriptionColor,
		"--background-color": currentTheme.backgroundColor,
		"--active-result-background-color": currentTheme.activeResultBackgroundColor,
		"--active-result-description-color": currentTheme.activeResultDescriptionColor,
		"--active-result-title-color": currentTheme.activeResultTitleColor,
		"--scale": currentTheme.scale,
	};
	$: console.log(placeholder);
</script>

<svelte:window
	on:mousemove={(event) => {
		if (dragging) {
			x += event.movementX;
			y += event.movementY;
		}
	}}
	on:mouseup={() => {
		dragging = false;
	}}
/>

<nav
	class="draggable"
	on:mousedown|preventDefault|stopPropagation={() => {
		dragging = true;
	}}
>
	<CommandPalette {commands} {placeholder} {theme} {toggleKey} />
</nav>

<style>
	nav {
		position: fixed;
		top: 30%;
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
	}

	nav :global(.command-section input:focus) {
		box-shadow: unset;
	}
</style>
