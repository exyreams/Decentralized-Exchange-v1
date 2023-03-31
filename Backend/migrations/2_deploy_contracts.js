const Aug = artifacts.require("Aug.sol");
const Emp = artifacts.require("Emp.sol");
const Fnx = artifacts.require("Fnx.sol");
const Hlx = artifacts.require("Hlx.sol");
const Qtm = artifacts.require("Qtm.sol");
const Srs = artifacts.require("Srs.sol");
const Zrc = artifacts.require("Zrc.sol");
const DecentralizedExchange = artifacts.require("DecentralizedExchange.sol");

const SIDE = { BUY: 0, SELL: 1 };

const [AUG, EMP, FNX, HLX, QTM, SRS, ZRC] = ["AUG", "EMP", "FNX", "HLX", "QTM", "SRS", "ZRC"].map(ticker => web3.utils.fromAscii(ticker));

module.exports = async function (deployer, _network, accounts) {
  const [trader1, trader2, trader3, trader4, _] = accounts;
  await Promise.all(
    [Aug, Emp, Fnx, Hlx, Qtm, Srs, Zrc, DecentralizedExchange].map(contract => deployer.deploy(contract))
  );

  const [aug, emp, fnx, hlx, qtm, srs, zrc, decentralizedexchange] = await Promise.all(
    [Aug, Emp, Fnx, Hlx, Qtm, Srs, Zrc, DecentralizedExchange].map(contract => contract.deployed())
  );

  await Promise.all([
    decentralizedexchange.addToken(AUG, aug.address),
    decentralizedexchange.addToken(EMP, emp.address),
    decentralizedexchange.addToken(FNX, fnx.address),
    decentralizedexchange.addToken(HLX, hlx.address),
    decentralizedexchange.addToken(QTM, qtm.address),
    decentralizedexchange.addToken(SRS, srs.address),
    decentralizedexchange.addToken(ZRC, zrc.address),
  ]);

  const amount = web3.utils.toWei("1000");
  const seedTokenBalance = async (token, trader) => {
    await token.faucet(trader, amount)
    await token.approve(decentralizedexchange.address, amount, { from: trader });
    // const ticker = await token.name();
    const ticker = await token.symbol();
    await decentralizedexchange.deposit(amount, web3.utils.fromAscii(ticker), { from: trader });
  };

  for (let i = 0; i < [aug, emp, fnx, hlx, qtm, srs, zrc].length; i++) {
    const token = [aug, emp, fnx, hlx, qtm, srs, zrc][i];
    await seedTokenBalance(token, trader1);
    await seedTokenBalance(token, trader2);
    await seedTokenBalance(token, trader3);
    await seedTokenBalance(token, trader4);
  }

  const increaseTime = async (seconds) => {
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_increaseTime", params: [seconds], id: 0, }, () => { });
    await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", params: [], id: 0, }, () => { });
  }

  //create trades
  await decentralizedexchange.createLimitOrder(AUG, 1000, 10, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(AUG, 1000, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(AUG, 1200, 11, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(AUG, 1200, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(AUG, 1200, 15, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(AUG, 1200, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(AUG, 1500, 14, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(AUG, 1500, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(AUG, 1300, 12, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(AUG, 1300, SIDE.SELL, { from: trader2 });

  await decentralizedexchange.createLimitOrder(HLX, 1000, 2, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(HLX, 1000, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(HLX, 500, 4, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(HLX, 500, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(HLX, 800, 2, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(HLX, 800, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(HLX, 1200, 6, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(HLX, 1200, SIDE.SELL, { from: trader2 });

  await decentralizedexchange.createLimitOrder(QTM, 500, 7, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(QTM, 500, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(QTM, 700, 9, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(QTM, 700, SIDE.SELL, { from: trader2 });

  await decentralizedexchange.createLimitOrder(SRS, 100, 2, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(SRS, 100, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(SRS, 200, 4, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(SRS, 200, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(SRS, 600, 3, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(SRS, 600, SIDE.SELL, { from: trader2 });

  await decentralizedexchange.createLimitOrder(ZRC, 1400, 1, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(ZRC, 1400, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(ZRC, 1000, 2, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(ZRC, 1000, SIDE.SELL, { from: trader2 });
  await increaseTime(1);
  await decentralizedexchange.createLimitOrder(ZRC, 1200, 3, SIDE.BUY, { from: trader1 });
  await decentralizedexchange.createMarketOrder(ZRC, 1200, SIDE.SELL, { from: trader2 });

  //create orders
  await Promise.all([
    decentralizedexchange.createLimitOrder(AUG, 1400, 10, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(AUG, 1200, 11, SIDE.BUY, { from: trader2 }),
    decentralizedexchange.createLimitOrder(AUG, 1000, 12, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(EMP, 680, 23, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(EMP, 845, 22, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(EMP, 900, 21, SIDE.SELL, { from: trader4 }),

    decentralizedexchange.createLimitOrder(EMP, 400, 12, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(EMP, 250, 13, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(EMP, 500, 14, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(HLX, 4000, 10, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(HLX, 2000, 9, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(HLX, 800, 8, SIDE.SELL, { from: trader4 }),

    decentralizedexchange.createLimitOrder(HLX, 3000, 4, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(HLX, 2000, 5, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(HLX, 500, 6, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(QTM, 800, 6, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(QTM, 600, 8, SIDE.BUY, { from: trader2 }),
    decentralizedexchange.createLimitOrder(QTM, 400, 10, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(SRS, 100, 1, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(SRS, 800, 2, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(SRS, 500, 3, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(QTM, 900, 11, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(QTM, 1200, 10, SIDE.SELL, { from: trader4 }),
    decentralizedexchange.createLimitOrder(QTM, 500, 9, SIDE.SELL, { from: trader4 }),

    decentralizedexchange.createLimitOrder(AUG, 888, 16, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(AUG, 950, 15, SIDE.SELL, { from: trader4 }),
    decentralizedexchange.createLimitOrder(AUG, 500, 14, SIDE.SELL, { from: trader4 }),

    decentralizedexchange.createLimitOrder(ZRC, 450, 4, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(ZRC, 500, 5, SIDE.BUY, { from: trader1 }),
    decentralizedexchange.createLimitOrder(ZRC, 800, 6, SIDE.BUY, { from: trader2 }),

    decentralizedexchange.createLimitOrder(SRS, 300, 4, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(SRS, 200, 3, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(SRS, 100, 2, SIDE.SELL, { from: trader4 }),

    decentralizedexchange.createLimitOrder(ZRC, 500, 1, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(ZRC, 400, 2, SIDE.SELL, { from: trader3 }),
    decentralizedexchange.createLimitOrder(ZRC, 300, 3, SIDE.SELL, { from: trader4 })
  ]);

}