import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import DecentralizedExchange from "./contracts/DecentralizedExchange.json";
import ERC20Abi from "./ERC20Abi.json";

const getWeb3 = () =>
    new Promise(async (resolve, reject) => {
      let provider;
      try {
        provider = await detectEthereumProvider();
      } catch (error) {
        reject(error);
      }
      if (provider && provider !== 'undefined' && provider !== null) {
        await provider.request({ method: "eth_requestAccounts" });
        try {
          const web3 = new Web3(provider);
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      reject("Install Metamask");
    });

const getContracts = async web3 => {
  const networkId = "5777";
  const deployedNetwork = DecentralizedExchange.networks[networkId];
  const decentralizedexchange = new web3.eth.Contract(
      DecentralizedExchange.abi,
      deployedNetwork && deployedNetwork.address,
  );
  let tokens;
  try {
    tokens = await decentralizedexchange.methods.getTokens().call();
  } catch (error) {
    console.error("Error getting tokens:", error);
    tokens = [];
  }
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
