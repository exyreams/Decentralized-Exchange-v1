// import Web3 from "web3";
// import ERC20Abi from "./ERC20Abi.json"
// import DecentralizedExchange from "./DecentralizedExchange.json";

// // web3modal imports
// import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum"
// import { configureChains, createClient, WagmiConfig } from "wagmi"
// import { useAccount, useContract, useSigner } from "wagmi"
// import { arbitrum, mainnet, polygon } from "wagmi/chains"
// import { Web3Button } from "@web3modal/react"
// import { Web3Modal } from "@web3modal/react"


// const getWeb3 = async () => {
//     if (window.ethereum) {
//         try {
//             // Wait for the user to click the "Connect" button before requesting account access
//             await window.ethereum.enable();
//             return new Web3(window.ethereum);
//         } catch (error) {
//             throw new Error(error);
//         }
//     }
//     throw new Error("Install Metamask");
// };

// const getContracts = async (web3) => {
//     const networkId = await web3.eth.net.getId();
//     const deployedNetwork = DecentralizedExchange.networks[networkId];
//     const decentralizedexchange = new web3.eth.Contract(
//         DecentralizedExchange.abi,
//         deployedNetwork && deployedNetwork.address,
//     );
//     const tokens = await decentralizedexchange.methods.getTokens().call();
//     const tokenContracts = tokens.reduce((acc, token) => ({
//         ...acc,
//         [web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(
//             ERC20Abi,
//             token.tokenAddress
//         )
//     }), {});
//     return { decentralizedexchange, ...tokenContracts };
// };

// export { getWeb3, getContracts };






// import {
//     EthereumClient,
//     w3mConnectors,
//     w3mProvider,
//   } from "@web3modal/ethereum";
//   import { Web3Button, Web3Modal, Web3NetworkSwitch } from "@web3modal/react";
//   import { configureChains, createClient, WagmiConfig } from "wagmi";
//   import {
//     arbitrum,
//     avalanche,
//     bsc,
//     fantom,
//     gnosis,
//     mainnet,
//     optimism,
//     polygon,
//   } from "wagmi/chains";





