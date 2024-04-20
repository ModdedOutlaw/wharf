<script lang="ts">
  import { onMount } from "svelte";
  import {
    login,
    logout,
    restore,
    session,
    get_info,
    transfer,
    transferNFT,
    get_collection,
    get_tokens,

  } from "./wharf";
  import { assetsStore, tokensStore } from "./wharf";

  onMount(restore);
  let amount = "1"; // default value for the dropdown
  let amountInMillions = 1; // default value
  let receiver = ""; // default value for the text input
  let account = "";

  let assets = [];
  let selectedAssetIds = [];
  let balances = []; // default value

  let currentPage = 1;
  const itemsPerPage = 10;
  
  onMount(() => {
    const unsubscribe = assetsStore.subscribe((value) => {
      assets = value;
    });

    return unsubscribe; // unsubscribe when the component is destroyed
  });

  onMount(() => {
    const unsubscribe = tokensStore.subscribe((value) => {
      balances = value;
    });

    return unsubscribe; // unsubscribe when the component is destroyed
  });
  

  $: paginatedAssets = assets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  function toggleSelection(assetId) {
    if (selectedAssetIds.includes(assetId)) {
      selectedAssetIds = selectedAssetIds.filter((id) => id !== assetId);
    } else {
      selectedAssetIds = [...selectedAssetIds, assetId];
    }
    console.log(selectedAssetIds);
  }
</script>

<main>
  <h1>WAX</h1>
  <p>Using Wharfkit !</p>
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
  
    <button on:click={() => get_tokens($session.actor.toString())}
		>Get Token Info ({$session.actor})</button
	  >
	  <table>
		<thead>
		  <tr>
			<th>Token</th>
			<th>Balance</th>
			<!-- Add more columns if needed -->
		  </tr>
		</thead>
		<tbody>
		  {#each balances as balance (balance.currency)}
			<tr>
			  <td>{balance.currency}</td>
			  <td>{balance.amount}</td>
			  <!-- Add more cells if needed -->
			</tr>
		  {/each}
		</tbody>
	  </table>
    <label>
      Amount:
      <select bind:value={amount}>
        <option value="0.0001 LIFTIUM">0.0001 LIFTIUM</option>
        <option value="0.0002 LIFTIUM">0.0002 LIFTIUM</option>
        <option value="0.0003 LIFTIUM">0.0003 LIFTIUM</option>
        <!-- add more options as needed -->
      </select>
    </label>

    <label>
      Receiver of LIFTIUM:
      <input type="text" bind:value={receiver} />
    </label>

    <button on:click={() => transfer(receiver, amount)}>Transfer LIFTIUM</button>
	<div>
		<label>
			Amount (in millions of LIFTIUM):
			<input type="number" min="1" step="1" bind:value={amountInMillions} />
			<button on:click={() => transfer(receiver, (amountInMillions * 1000000).toFixed(4).toString() + " LIFTIUM")}>Transfer LIFTIUM</button>
		  </label>
	</div>
    <div>
		<label>
			Receiver of NFT(s):
			<input type="text" bind:value={account} />
		  </label>
		  <button on:click={() => transferNFT(account, selectedAssetIds)}
			>TransferNFT ({$session.actor})</button
		  >
		  <button on:click={() => get_collection($session.actor.toString())}
			>Get 1 MIO asset IDS)</button
		  >
      <button on:click={() => (currentPage = Math.max(1, currentPage - 1))}
        >Previous</button
      >
      <button
        on:click={() =>
          (currentPage = Math.min(
            Math.ceil(assets.length / itemsPerPage),
            currentPage + 1
          ))}>Next</button
      >
      {#each paginatedAssets as assetId (assetId)}
        <button
          class:selected={selectedAssetIds.includes(assetId)}
          on:click={() => toggleSelection(assetId)}>{assetId}</button
        >{/each}
    </div>
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
  .selected {
    background-color: #007bff; /* change to your preferred color */
    color: white;
  }
</style>
