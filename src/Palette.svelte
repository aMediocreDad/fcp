<script>
	import CommandPalette from "./Command.svelte";

	export let placeholder;
	export let currentTheme;
	export let commands;
	export let toggleKey = "p";

	let dragging = false;
	let x = window.innerWidth / 2;
	let y = window.innerHeight / 3;

	$: theme = {
		"--color": currentTheme.color,
		"--result-description-color": currentTheme.descriptionColor,
		"--background-color": currentTheme.backgroundColor,
		"--active-result-background-color": currentTheme.activeResultBackgroundColor,
		"--active-result-description-color": currentTheme.activeResultDescriptionColor,
		"--active-result-title-color": currentTheme.activeResultTitleColor,
		"--scale": currentTheme.scale,
	};
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
	style="--x:{x}px; --y:{y}px;"
>
	<CommandPalette {commands} {placeholder} {theme} {toggleKey} />
</nav>

<style>
	nav {
		--x: 0;
		--y: 0;
		position: fixed;
		top: var(--y);
		left: var(--x);
		transform: translateX(-50%);
		z-index: 9999;
	}

	nav :global(.command-section input:focus) {
		box-shadow: unset;
	}
</style>
