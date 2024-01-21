<script>
	import Form from '@/Form.svelte';

	let dialog = $state();
	let restart = $state(false);

	const close = () => {
		restart = true;
		// restart Form = re-init Form
		setTimeout(() => (restart = false), 0);
		dialog.close();
	};
</script>

<button onclick={() => dialog.showModal()}>Open example</button>

<dialog bind:this={dialog}>
	{#if !restart}<Form {close} />{/if}
</dialog>

<style>
	* {
		box-sizing: border-box;
	}
	button {
		max-width: 12em;
		padding: 0.2em 2em;
		cursor: pointer;
		border: 1px solid black;
	}
	.right {
		float: right;
	}
</style>
