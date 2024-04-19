
<script lang="ts">
    import {onMount} from 'svelte'
    import {login, logout, restore, session, get_info, upliftium_info} from './wharf'

    onMount(restore)

	export let name: string;
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>
<div>
	{#if $session}
		<button on:click={logout}>Logout ({$session.actor})</button>
	{:else}
		<button on:click={login}>Login</button>
	{/if}
</div>
<div>
	{#if $session}
		<button on:click={() => get_info($session.actor.toString())}>Get Info ({$session.actor})</button>
	{:else}
		<div></div>
	{/if}
</div>
<div>
	{#if $upliftium_info}
	<img src={'https://atomichub-ipfs.com/ipfs/' + $upliftium_info} alt="description" />

	{:else}
		<div></div>
	{/if}
	
</div>
<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>