// /* eslint-disable react-hooks/exhaustive-deps */
// import React, {useEffect, useState} from "react";
// import Header from "./Header.js";
// import Footer from "./Footer.js";
// import Wallet from "./Wallet.js";
// import NewOrder from "./NewOrder.js";
// import AllOrders from "./AllOrders.js";
// import MyOrders from "./MyOrders.js";
// import AllTrades from "./AllTrades.js";
//
// const SIDE = {
//     BUY: 0,
//     SELL: 1
// };
//
// function App({web3, accounts, contracts}) {
//     const [tokens, setTokens] = useState([]);
//     const [user, setUser] = useState({
//         accounts: [],
//         balances: {
//             tokenDecentralizedExchange: 0,
//             tokenWallet: 0
//         },
//         selectedToken: undefined
//     });
//     const [orders, setOrders] = useState({
//         buy: [],
//         sell: []
//     });
//     const [trades, setTrades] = useState([]);
//     const [listener, setListener] = useState(undefined);
//
//     const getBalances = async (account, token) => {
//         const tokenDecentralizedExchange = await contracts.decentralizedexchange.methods
//             .traderBalances(account, web3.utils.fromAscii(token.ticker))
//             .call();
//         const tokenWallet = await contracts[token.ticker].methods
//             .balanceOf(account)
//             .call();
//         return {tokenDecentralizedExchange, tokenWallet};
//     }
//
//     const getOrders = async token => {
//         const orders = await Promise.all([
//             contracts.decentralizedexchange.methods
//                 .getOrders(web3.utils.fromAscii(token.ticker), SIDE.BUY)
//                 .call(),
//             contracts.decentralizedexchange.methods
//                 .getOrders(web3.utils.fromAscii(token.ticker), SIDE.SELL)
//                 .call(),
//         ]);
//         return {buy: orders[0], sell: orders[1]};
//     }
//
//     const listenToTrades = token => {
//         const tradeIds = new Set();
//         setTrades([]);
//         const listener = contracts.decentralizedexchange.events.NewTrade(
//             {
//                 filter: {ticker: web3.utils.fromAscii(token.ticker)},
//                 fromBlock: 0
//             })
//             .on("data", newTrade => {
//                 if (tradeIds.has(newTrade.returnValues.tradeId)) return;
//                 tradeIds.add(newTrade.returnValues.tradeId);
//                 setTrades(trades => ([...trades, newTrade.returnValues]));
//             });
//         setListener(listener);
//     }
//
//     const selectToken = token => {
//         setUser({...user, selectedToken: token});
//     }
//
//     const deposit = async amount => {
//         await contracts[user.selectedToken.ticker].methods
//             .approve(contracts.decentralizedexchange.options.address, amount)
//             .send({from: user.accounts[0]});
//         await contracts.decentralizedexchange.methods
//             .deposit(amount, web3.utils.fromAscii(user.selectedToken.ticker))
//             .send({from: user.accounts[0]});
//         const balances = await getBalances(
//             user.accounts[0],
//             user.selectedToken
//         );
//         setUser(user => ({...user, balances}));
//     }
//
//     const withdraw = async amount => {
//         await contracts.decentralizedexchange.methods
//             .withdraw(
//                 amount,
//                 web3.utils.fromAscii(user.selectedToken.ticker)
//             )
//             .send({from: user.accounts[0]});
//         const balances = await getBalances(
//             user.accounts[0],
//             user.selectedToken
//         );
//         setUser(user => ({...user, balances}));
//     }
//
//     const createMarketOrder = async (amount, side) => {
//         await contracts.decentralizedexchange.methods
//             .createMarketOrder(
//                 web3.utils.fromAscii(user.selectedToken.ticker),
//                 amount,
//                 side
//             )
//             .send({from: user.accounts[0]});
//         const orders = await getOrders(user.selectedToken);
//         setOrders(orders);
//     }
//
//     const createLimitOrder = async (amount, price, side) => {
//         await contracts.decentralizedexchange.methods
//             .createLimitOrder(
//                 web3.utils.fromAscii(user.selectedToken.ticker),
//                 amount,
//                 price,
//                 side
//             )
//             .send({from: user.accounts[0]});
//         const orders = await getOrders(user.selectedToken);
//         setOrders(orders);
//     }
//
//     useEffect(() => {
//         const init = async () => {
//             const rawTokens = await contracts.decentralizedexchange.methods.getTokens().call();
//             const tokens = rawTokens.map(token => ({
//                 ...token,
//                 ticker: web3.utils.hexToUtf8(token.ticker)
//             }));
//             const [balances, orders] = await Promise.all([
//                 getBalances(accounts[0], tokens[0]),
//                 getOrders(tokens[0]),
//             ]);
//             listenToTrades(tokens[0])
//             setTokens(tokens);
//             setUser({accounts, balances, selectedToken: tokens[0]});
//             setOrders(orders);
//         }
//         init();
//     }, []);
//
//     useEffect(() => {
//         const init = async () => {
//             const [balances, orders] = await Promise.all([
//                 getBalances(
//                     user.accounts[0],
//                     user.selectedToken
//                 ),
//                 getOrders(user.selectedToken),
//             ]);
//             listenToTrades(user.selectedToken);
//             setUser(user => ({...user, balances}));
//             setOrders(orders);
//         }
//         if (typeof user.selectedToken !== "undefined") {
//             init();
//         }
//     }, [user.selectedToken], () => {
//         listener.unsubscribe();
//     });
//
//     if (typeof user.selectedToken === "undefined") {
//         return <div>Loading...</div>;
//     }
//
//     return (
//         <div id="app">
//             <Header
//                 contracts={contracts}
//                 tokens={tokens}
//                 user={user}
//                 selectToken={selectToken}
//             />
//             <main className="container-fluid">
//                 <div className="row">
//                     <div className="col-sm-4 first-col">
//                         <Wallet
//                             user={user}
//                             deposit={deposit}
//                             withdraw={withdraw}
//                         />
//                         {user.selectedToken.ticker !== "FNX" ? (
//                             <NewOrder
//                                 createMarketOrder={createMarketOrder}
//                                 createLimitOrder={createLimitOrder}
//                             />
//                         ) : null}
//                     </div>
//                     {user.selectedToken.ticker !== "FNX" ? (
//                         <div className="col-sm-8">
//                             <AllTrades
//                                 trades={trades}
//                             />
//                             <AllOrders
//                                 orders={orders}
//                             />
//                             <MyOrders
//                                 orders={{
//                                     buy: orders.buy.filter(
//                                         order => order.trader.toLowerCase() === accounts[0].toLowerCase()
//                                     ),
//                                     sell: orders.sell.filter(
//                                         order => order.trader.toLowerCase() === accounts[0].toLowerCase()
//                                     )
//                                 }}
//                             />
//                         </div>
//                     ) : null}
//                 </div>
//             </main>
//             <Footer/>
//         </div>
//     );
// }
//
// export default App;




/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useState} from "react";
import Header from "./Header.js";
import Footer from "./Footer.js";
import Wallet from "./Wallet.js";
import NewOrder from "./NewOrder.js";
import AllOrders from "./AllOrders.js";
import MyOrders from "./MyOrders.js";
import AllTrades from "./AllTrades.js";

//rainbowKits,Wagmi
import "@rainbow-me/rainbowkit/styles.css";
import { connectorsForWallets, wallet, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import { ButtonComponents} from "./ButtonComponents";


const { chains, provider } = configureChains(
    [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum, chain.foundry, chain.goerli, chain.localhost, chain.polygonMumbai,  chain.hardhat, chain.rinkeby ],
    [alchemyProvider({ alchemyId: process.env.ALCHEMY_ID }), publicProvider()]
);

const connectors = connectorsForWallets([
    {
        groupName: "Recommended",
        wallets: [
            wallet.metaMask({chains}),
            wallet.rainbow({chains}),
            wallet.trust({chains}),
            wallet.coinbase({chains}),
        ],
    },
    {
        groupName: "More",
        wallets: [
            wallet.argent({chains}),
            wallet.steak({chains}),
            wallet.ledger({chains}),
            wallet.brave({ chains }),
            // wallet.imToken({ chains }),
        ],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider
});


const SIDE = {
    BUY: 0,
    SELL: 1
};

function App({web3, accounts, contracts}) {
    const [tokens, setTokens] = useState([]);
    const [user, setUser] = useState({
        accounts: [],
        balances: {
            tokenDecentralizedExchange: 0,
            tokenWallet: 0
        },
        selectedToken: undefined
    });
    const [orders, setOrders] = useState({
        buy: [],
        sell: []
    });
    const [trades, setTrades] = useState([]);
    const [listener, setListener] = useState(undefined);

    const getBalances = async (account, token) => {
        const tokenDecentralizedExchange = await contracts.decentralizedexchange.methods
            .traderBalances(account, web3.utils.fromAscii(token.ticker))
            .call();
        const tokenWallet = await contracts[token.ticker].methods
            .balanceOf(account)
            .call();
        return {tokenDecentralizedExchange, tokenWallet};
    }

    const getOrders = async token => {
        const orders = await Promise.all([
            contracts.decentralizedexchange.methods
                .getOrders(web3.utils.fromAscii(token.ticker), SIDE.BUY)
                .call(),
            contracts.decentralizedexchange.methods
                .getOrders(web3.utils.fromAscii(token.ticker), SIDE.SELL)
                .call(),
        ]);
        return {buy: orders[0], sell: orders[1]};
    }

    const listenToTrades = token => {
        const tradeIds = new Set();
        setTrades([]);
        const listener = contracts.decentralizedexchange.events.NewTrade(
            {
                filter: {ticker: web3.utils.fromAscii(token.ticker)},
                fromBlock: 0
            })
            .on("data", newTrade => {
                if (tradeIds.has(newTrade.returnValues.tradeId)) return;
                tradeIds.add(newTrade.returnValues.tradeId);
                setTrades(trades => ([...trades, newTrade.returnValues]));
            });
        setListener(listener);
    }

    const selectToken = token => {
        setUser({...user, selectedToken: token});
    }

    const deposit = async amount => {
        await contracts[user.selectedToken.ticker].methods
            .approve(contracts.decentralizedexchange.options.address, amount)
            .send({from: user.accounts[0]});
        await contracts.decentralizedexchange.methods
            .deposit(amount, web3.utils.fromAscii(user.selectedToken.ticker))
            .send({from: user.accounts[0]});
        const balances = await getBalances(
            user.accounts[0],
            user.selectedToken
        );
        setUser(user => ({...user, balances}));
    }

    const withdraw = async amount => {
        await contracts.decentralizedexchange.methods
            .withdraw(
                amount,
                web3.utils.fromAscii(user.selectedToken.ticker)
            )
            .send({from: user.accounts[0]});
        const balances = await getBalances(
            user.accounts[0],
            user.selectedToken
        );
        setUser(user => ({...user, balances}));
    }

    const createMarketOrder = async (amount, side) => {
        await contracts.decentralizedexchange.methods
            .createMarketOrder(
                web3.utils.fromAscii(user.selectedToken.ticker),
                amount,
                side
            )
            .send({from: user.accounts[0]});
        const orders = await getOrders(user.selectedToken);
        setOrders(orders);
    }

    const createLimitOrder = async (amount, price, side) => {
        await contracts.decentralizedexchange.methods
            .createLimitOrder(
                web3.utils.fromAscii(user.selectedToken.ticker),
                amount,
                price,
                side
            )
            .send({from: user.accounts[0]});
        const orders = await getOrders(user.selectedToken);
        setOrders(orders);
    }

    useEffect(() => {
        const init = async () => {
            const rawTokens = await contracts.decentralizedexchange.methods.getTokens().call();
            const tokens = rawTokens.map(token => ({
                ...token,
                ticker: web3.utils.hexToUtf8(token.ticker)
            }));
            const [balances, orders] = await Promise.all([
                getBalances(accounts[0], tokens[0]),
                getOrders(tokens[0]),
            ]);
            listenToTrades(tokens[0])
            setTokens(tokens);
            setUser({accounts, balances, selectedToken: tokens[0]});
            setOrders(orders);
        }
        init();
    }, []);

    useEffect(() => {
        const init = async () => {
            const [balances, orders] = await Promise.all([
                getBalances(
                    user.accounts[0],
                    user.selectedToken
                ),
                getOrders(user.selectedToken),
            ]);
            listenToTrades(user.selectedToken);
            setUser(user => ({...user, balances}));
            setOrders(orders);
        }
        if (typeof user.selectedToken !== "undefined") {
            init();
        }
    }, [user.selectedToken], () => {
        listener.unsubscribe();
    });

    if (typeof user.selectedToken === "undefined") {
        return <div>Loading...</div>;
    }

    return (
        <WagmiConfig client={wagmiClient}>
            <RainbowKitProvider chains={chains} coolMode
                                theme={darkTheme({
                                    // accentColor: '#4B0082',
                                    accentColor: '#1F75FE',
                                    accentColorForeground: 'white',
                                    borderRadius: 'large',
                                    fontStack: 'system',
                                    overlayBlur: 'small',
                                })} >
                <div id="app">
                    <Header
                        contracts={contracts}
                        tokens={tokens}
                        user={user}
                        selectToken={selectToken}
                    />
                    <main className="container-fluid">
                        <div className="row">
                            <div className="col-sm-4 first-col">
                                <Wallet
                                    user={user}
                                    deposit={deposit}
                                    withdraw={withdraw}
                                />
                                {user.selectedToken.ticker !== "FNX" ? (
                                    <NewOrder
                                        createMarketOrder={createMarketOrder}
                                        createLimitOrder={createLimitOrder}
                                    />
                                ) : null}
                            </div>
                            {user.selectedToken.ticker !== "FNX" ? (
                                <div className="col-sm-8">
                                    <AllTrades
                                        trades={trades}
                                    />
                                    <AllOrders
                                        orders={orders}
                                    />
                                    <MyOrders
                                        orders={{
                                            buy: orders.buy.filter(
                                                order => order.trader.toLowerCase() === accounts[0].toLowerCase()
                                            ),
                                            sell: orders.sell.filter(
                                                order => order.trader.toLowerCase() === accounts[0].toLowerCase()
                                            )
                                        }}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </main>
                    <Footer/>
                </div>
                <ButtonComponents/>
            </RainbowKitProvider>
        </WagmiConfig>
    );
}

export default App;
