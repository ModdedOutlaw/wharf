import { Chains, Session, SessionKit } from "@wharfkit/session";
import { WebRenderer } from "@wharfkit/web-renderer";
import { writable, type Writable } from "svelte/store";
import { WalletPluginCloudWallet } from "@wharfkit/wallet-plugin-cloudwallet";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { TransactPluginResourceProvider } from "@wharfkit/transact-plugin-resource-provider";
import { APIClient, Transaction, UInt64Type, UInt64 } from "@wharfkit/antelope";
import { Contract } from "./contract";
import { ContractKit } from "@wharfkit/contract";
import { AccountKit } from "@wharfkit/account";
import Account from "@wharfkit/contract";

//import abi from "./eosio-abi.json" // ABI for the eosio.token contract

interface ResponseData {
  account: string;
  assets: string;
}

interface CollectionData {
  success: boolean;
  data: {
    contract: string;
    collection_name: string;
    name: string;
    img: string;
    author: string;
    allow_notify: boolean;
    authorized_accounts: string[];
    notify_accounts: string[];
    market_fee: number;
    nestedData: {
      img: string;
      url: string;
      name: string;
      description: string;
    };
    created_at_time: string;
    created_at_block: string;
  };
  query_time: number;
}

interface UpliftiumHiData {
  account: string;
  templates: {
    template_id: string;
    assets: string;
  }[];
}

//const accountKit = new AccountKit(Chains.WAX);

const client = new APIClient({
  url: "https://api.waxsweden.org/",
});

const client2 = new APIClient({
  url: "https://wax.api.atomicassets.io/",
});

const clientWaxLight = new APIClient({
  url: "https://wax.light-api.net/",
});
const wcw = new WalletPluginCloudWallet();
const anchor = new WalletPluginAnchor();
// The blockchain(s) this application is deployed on

const chains = [Chains.WAX];

const contract = new Contract({ client: client });

// Create a new session kit instance
export const sessionKit = new SessionKit({
  appName: "wallet-login-example",
  chains,
  ui: new WebRenderer(),
  walletPlugins: [wcw, anchor],
});

// Storage for the current user session
export let session: Writable<Session | undefined> = writable();
export let upliftium_image: Writable<Session | string> = writable();
export let upliftium_hi_data: Writable<Session | UpliftiumHiData> = writable();
export let assetsStore = writable([]);
export let tokensStore = writable([]);

export async function transfer(name: string, quantity: string) {
  let sessionValue: Session | undefined;
  session.subscribe((value) => (sessionValue = value));
  console.log(sessionValue.permissionLevel);
  const transactionArguments = {
    action: {
      account: "tokenizednft",
      name: "transfer",
      authorization: [sessionValue.permissionLevel],
      data: {
        from: sessionValue.permissionLevel.actor.toString(),
        to: name,
        quantity: quantity,
        memo: "LIFTIUM Transfer",
      },
    },
  };
  if (sessionValue) {
    let response = await sessionValue.transact(transactionArguments);
    console.log(response.response);
    console.log("STATUS = " + response.response.processed.receipt.status);
    console.log("TX_id = " + response.response.transaction_id);
  } else {
    console.error("No session available");
  }
}

export async function transferNFT(name: string, assetID: UInt64Type) {
  let sessionValue: Session | undefined;
  session.subscribe((value) => (sessionValue = value));
  console.log(sessionValue.permissionLevel);
  const transactionArguments = {
    action: {
      account: "atomicassets",
      name: "transfer",
      authorization: [sessionValue.permissionLevel],
      data: {
        from: sessionValue.permissionLevel.actor.toString(),
        to: name,
        asset_ids: assetID,
        memo: "Upliftium NFT transfer",
      },
    },
  };
  if (sessionValue) {
    let response = await sessionValue.transact(transactionArguments);
    console.log(response.response);
    console.log("STATUS = " + response.response.processed.receipt.status);
    console.log("TX_id = " + response.response.transaction_id);
  } else {
    console.error("No session available");
  }
}

// A function that performs the login and sets the session variable

export async function login() {
  const response = await sessionKit.login();
  console.log(response);
  if (response.session) {
    session.set(response.session);
  }
  window.location.reload();
}
// A function that performs the logout and clears the session variable
export async function logout() {
  await sessionKit.logout();
  session.set(undefined);
  upliftium_image.set(undefined);
  localStorage.clear();
}
// A function that performs the restore and sets the session variable
export async function restore() {
  session.set(await sessionKit.restore());
  const img = localStorage.getItem("upliftium_img");
  upliftium_image.set(img);
}

export async function get_collection(name: string) {
  const upliftium_collection_response = await client2.call({
    path: "/atomicassets/v1/accounts/" + name + "/upliftium.hi",
  });

  const owner_collection_response = await client2.call({
    path:
      "/atomicassets/v1/assets/?collection_name=upliftium.hi&owner=" +
      name +
      "&page=1&limit=1000&order=desc&sort=asset_id",
  });
  //wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=upliftium.hi&owner=modded.gm&page=1&limit=500&order=desc&sort=asset_id

  //const responseData = upliftium_collection_response as { data: ResponseData[] };

  console.log(upliftium_collection_response);

  console.log(owner_collection_response);

  const collectionData = upliftium_collection_response as {
    data: UpliftiumHiData;
  };

  console.log(collectionData.data.templates);
  // Assuming response is your response object array
  const assetIds = owner_collection_response.data.map((item) => item.asset_id);
  console.log(assetIds);
  assetsStore.set(assetIds); // update the store with the first 20 assets
}

export async function get_info(name: string) {
  const response = await client2.call({
    path: "/atomicassets/v1/accounts" + "?owner=" + name,
  });

  const upliftium_collection_response = await client2.call({
    path: "/atomicassets/v1/collections/upliftium.hi",
  });

  const responseData = response as { data: ResponseData[] };

  console.log(
    "ACCOUNT " +
      responseData.data[0].account +
      " HAS " +
      responseData.data[0].assets +
      " ASSETS!"
  );

  const collectionData = upliftium_collection_response as {
    data: CollectionData;
  };
  console.log(collectionData.data.data.img);
  upliftium_image.set(collectionData.data.data.img);
  localStorage.setItem("upliftium_img", collectionData.data.data.img);
}

//'https://wax.blokcrafters.io/v2/state/get_tokens?account=modded.gm'
//api/topholders/CHAIN/CONTRACT/TOKEN/NUM
export async function get_tokens(name: string) {
  const response = await clientWaxLight.call({
    path: "/api/balances/wax/" + name,
  });

  const response2 = await clientWaxLight.call({
    path: "/api/topholders/wax/tokenizednft/LIFTIUM/10",
  });

  const responseData = response as { data: ResponseData[] };

  console.log(responseData.balances);
  console.log(response2);
  tokensStore.set(responseData.balances);
}
