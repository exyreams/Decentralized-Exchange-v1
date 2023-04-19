// import Web3 from "web3";
// import detectEthereumProvider from "@metamask/detect-provider";
// import DecentralizedExchange from "./contracts/DecentralizedExchange.json";
// import ERC20Abi from "./ERC20Abi.json";
// import {ContractResultDecodeError} from "wagmi";
//
// const getWeb3 = () =>
//     new Promise( async (resolve, reject) => {
//         let provider = await detectEthereumProvider();
//         if(provider) {
//             await provider.request({ method: 'eth_requestAccounts' });
//             try {
//                 const web3 = new Web3(window.ethereum);
//                 resolve(web3);
//             } catch(error) {
//                 reject(error);
//             }
//         }
//         reject('Install Metamask');
//     });
//
// const getContracts = async web3 => {
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
// }
//
// export { getWeb3, getContracts };
// export { getWeb3, getContracts };










import Web3 from "web3";
import DecentralizedExchange from "./contracts/DecentralizedExchange.json";
import ERC20Abi from "./ERC20Abi.json";

const getWeb3 = () =>
    new Promise( async (resolve, reject) => {
        try {
            const web3 = new Web3(window.ethereum);
            resolve(web3);
        } catch(error) {
            reject(error);
        }
    });

const getContracts = async web3 => {
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = DecentralizedExchange.networks[networkId];
    const decentralizedexchange = new web3.eth.Contract(
        DecentralizedExchange.abi,
        deployedNetwork && deployedNetwork.address,
    );
    const tokens = await decentralizedexchange.methods.getTokens().call();
    const tokenContracts = tokens.reduce((acc, token) => ({
        ...acc,
        [web3.utils.hexToUtf8(token.ticker)]: new web3.eth.Contract(
            ERC20Abi,
            token.tokenAddress
        )
    }), {});
    return { decentralizedexchange, ...tokenContracts };
}

export { getWeb3, getContracts };
