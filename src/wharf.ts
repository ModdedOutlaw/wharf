import {Chains, Session, SessionKit} from '@wharfkit/session'
import {WebRenderer} from '@wharfkit/web-renderer'
import {writable, type Writable} from 'svelte/store'
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet'
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"


import { APIClient } from "@wharfkit/antelope"
import { Contract } from "@wharfkit/contract"
import { AccountKit } from "@wharfkit/account"
import Account  from "@wharfkit/contract"


const accountKit = new AccountKit(Chains.WAX)

const accountArgs = {
    data: {
      account_name: "modded.gm",
      // All account data should be passed here.
    },
    client: new APIClient({ url: "https://api.waxsweden.org/" }),
  }

const p_account = new Account(accountArgs)


console.log(p_account)

const client = new APIClient({
  url: "https://api.waxsweden.org/",
})

const client2 = new APIClient({
    url: "https://wax.api.atomicassets.io/",
  })

const wcw = new WalletPluginCloudWallet()
const anchor = new WalletPluginAnchor()
// The blockchain(s) this application is deployed on

const chains = [Chains.WAX]

// Create a new session kit instance
export const sessionKit = new SessionKit(
    {
        appName: 'wallet-login-example',
        chains,
        ui: new WebRenderer(),
        walletPlugins: [wcw,anchor],
      
    }
)

// Storage for the current user session
export let session: Writable<Session | undefined> = writable()
export let upliftium_info: Writable<Session | undefined> = writable(null);


// A function that performs the login and sets the session variable

export async function login() {
    
    const response = await sessionKit.login()
    console.log(response);
    if (response.session) {
        session.set(response.session)
    }
    window.location.reload();
}
// A function that performs the logout and clears the session variable
export async function logout() {
    await sessionKit.logout()
    session.set(undefined)
    upliftium_info.set(undefined)
}
// A function that performs the restore and sets the session variable
export async function restore() {
    session.set(await sessionKit.restore())
   // upliftium_info.set(await sessionKit.restore())
}

export async function get_info(name: string) {
    //const name = await client.v1.chain.get_account("modded.gm".toString())
    // https://wax.api.atomicassets.io/atomicassets/v1/accounts?owner=modded.gm
    //https://wax.api.atomicassets.io/atomicassets/v1/collections/upliftium.hi

    const account = await accountKit.load("modded.gm")

    const response = await client2.call({
        path: "/atomicassets/v1/accounts"+ "?owner=" +name,
    
      })

      const upliftium_collection_info = await client2.call({
        path: "/atomicassets/v1/collections/upliftium.hi",
    
      })
 
    console.log(name)
    const balance = await account.balance()

    console.log(balance.toJSON())
    console.log("ACCOUNT " + response.data[0].account+" HAS "+response.data[0].assets+" ASSETS!")
    console.log("Upliftium Image Id: "+upliftium_collection_info.data.img)
    upliftium_info.set(upliftium_collection_info.data.img);
    console.log("CHECK =" + upliftium_info);
    console.log(response)
    
   }
    
