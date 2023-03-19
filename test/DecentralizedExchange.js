const { expectRevert } = require("@openzeppelin/test-helpers");
const Aug = artifacts.require("Aug.sol");
const Emp = artifacts.require("Emp.sol");
const Fnx = artifacts.require("Fnx.sol");
const Hlx = artifacts.require("Hlx.sol");
const Qtm = artifacts.require("Qtm.sol");
const Srs = artifacts.require("Srs.sol");
const Zrc = artifacts.require("Zrc.sol");
const DecentralizedExchange = artifacts.require("DecentralizedExchange.sol");

contract("DeXchange", (accounts) => {
    let aug, emp, fnx, hlx, qtm, srs, zrc, decentralizedexchange;
    const [trader1, trader2] = [accounts[1], accounts[2]];
    const [AUG, EMP, FNX, HLX, QTM, SRS, ZRC] = ["AUG", "EMP", "FNX", "HLX", "QTM", "SRS", "ZRC"].map(ticker => web3.utils.fromAscii(ticker));

    beforeEach(async () => {
        ([aug, emp, fnx, hlx, qtm, srs, zrc] = await Promise.all([
            Aug.new(),
            Emp.new(),
            Fnx.new(),
            Hlx.new(),
            Qtm.new(),
            Srs.new(),
            Zrc.new()
        ]));

        decentralizedexchange = await DecentralizedExchange.new();
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
        };
        for (let i = 0; i < [aug, emp, fnx, hlx, qtm, srs, zrc].length; i++) {
            const token = [aug, emp, fnx, hlx, qtm, srs, zrc][i];
            await seedTokenBalance(token, trader1);
            await seedTokenBalance(token, trader2);
        }
    });

    it("Should Deposit Tokens.", async () => {
        const amount = web3.utils.toWei("100");
        const initialBalance = await decentralizedexchange.traderBalances(trader1, FNX);
        await decentralizedexchange.deposit(amount, FNX, { from: trader1 });
        const balance = await decentralizedexchange.traderBalances(trader1, FNX);
        assert(balance.toString() === initialBalance.add(web3.utils.toBN(amount)).toString(), "Deposit failed: Incorrect balance.");
    });

    it("Shouldn't Deposit Tokens: When Token doesn't exist.", async () => {
        const nonExistentToken = web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST");
        await expectRevert(
            decentralizedexchange.deposit(web3.utils.toWei("100"), nonExistentToken, { from: trader1 }),
            "This token doesn't exist."
        );
    });

    it("Should Withdraw Tokens.", async () => {
        const amount = web3.utils.toWei("100");
        await decentralizedexchange.deposit(amount, FNX, { from: trader1 });
        const initialExchangeBalance = await decentralizedexchange.traderBalances(trader1, FNX);
        const initialFnxBalance = await fnx.balanceOf(trader1);
        await decentralizedexchange.withdraw(amount, FNX, { from: trader1 });
        const exchangeBalance = await decentralizedexchange.traderBalances(trader1, FNX);
        const fnxBalance = await fnx.balanceOf(trader1);
        assert(exchangeBalance.isZero(), "Withdrawal failed: Incorrect exchange balance.");
        assert(fnxBalance.toString() === initialFnxBalance.add(web3.utils.toBN(amount)).toString(), "Withdrawal failed: Incorrect FNX balance.");
    });

    it("Shouldn't Withdraw Tokens: When Token doesn't exist.", async () => {
        const nonExistentToken = web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST");
        await expectRevert(
            decentralizedexchange.withdraw(web3.utils.toWei("1000"), nonExistentToken, { from: trader1 }),
            "This token doesn't exist."
        );
    });
});



    // it("should create limit order", async () => {
    //     await dex.deposit(web3.utils.toWei("100"), DAI, { from: trader1 });
    //     await dex.createLimitOrder(REP, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 });
    //     let buyOrders = await dex.getOrders(REP, SIDE.BUY);
    //     let sellOrders = await dex.getOrders(REP, SIDE.SELL);
    //     assert(buyOrders.length === 1);
    //     assert(buyOrders[0].trader === trader1);
    //     assert(buyOrders[0].ticker === web3.utils.padRight(REP, 64));
    //     assert(buyOrders[0].price === "10");
    //     assert(buyOrders[0].amount === web3.utils.toWei("10"));
    //     assert(sellOrders.length === 0);

    //     await dex.deposit(web3.utils.toWei("200"), DAI, { from: trader2 });
    //     await dex.createLimitOrder(REP, web3.utils.toWei("10"), 11, SIDE.BUY, { from: trader2 });

    //     buyOrders = await dex.getOrders(REP, SIDE.BUY);
    //     sellOrders = await dex.getOrders(REP, SIDE.SELL);
    //     assert(buyOrders.length === 2);
    //     assert(buyOrders[0].trader === trader2);
    //     assert(buyOrders[1].trader === trader1);
    //     assert(sellOrders.length === 0);

    //     await dex.deposit(web3.utils.toWei("200"), DAI, { from: trader2 });
    //     await dex.createLimitOrder(REP, web3.utils.toWei("10"), 9, SIDE.BUY, { from: trader2 });

    //     buyOrders = await dex.getOrders(REP, SIDE.BUY);
    //     sellOrders = await dex.getOrders(REP, SIDE.SELL);
    //     assert(buyOrders.length === 3);
    //     assert(buyOrders[0].trader === trader2);
    //     assert(buyOrders[1].trader === trader1);
    //     assert(buyOrders[2].trader === trader2);
    //     assert(sellOrders.length === 0);
    // });

    // it("should NOT create limit order if token balance too low", async () => {
    //     await dex.deposit(web3.utils.toWei("99"), REP, { from: trader1 });
    //     await expectRevert(dex.createLimitOrder(REP, web3.utils.toWei("100"), 10, SIDE.SELL, { from: trader1 }), "token balance too low");
    // });

    // it("should NOT create limit order if dai balance too low", async () => {
    //     await dex.deposit(web3.utils.toWei("99"), DAI, { from: trader1 });
    //     await expectRevert(dex.createLimitOrder(REP, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 }), "dai balance too low");
    // });

    // it("should NOT create limit order if token is DAI", async () => {
    //     await expectRevert(dex.createLimitOrder(DAI, web3.utils.toWei("1000"), 10, SIDE.BUY, { from: trader1 }), "cannot trade DAI");
    // });

    // it("should NOT create limit order if token does not not exist", async () => {
    //     await expectRevert(dex.createLimitOrder(web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST"), web3.utils.toWei("1000"), 10, SIDE.BUY,
    //         { from: trader1 }), "this token does not exist");
    // });

    // it("should create market order & match", async () => {
    //     await dex.deposit(web3.utils.toWei("100"), DAI, { from: trader1 });
    //     await dex.createLimitOrder(REP, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 });
    //     await dex.deposit(web3.utils.toWei("100"), REP, { from: trader2 });
    //     await dex.createMarketOrder(REP, web3.utils.toWei("5"), SIDE.SELL, { from: trader2 });

    //     const balances = await Promise.all([
    //         dex.traderBalances(trader1, DAI),
    //         dex.traderBalances(trader1, REP),
    //         dex.traderBalances(trader2, DAI),
    //         dex.traderBalances(trader2, REP),
    //     ]);

    //     const orders = await dex.getOrders(REP, SIDE.BUY);
    //     assert(orders.length === 1);
    //     assert(orders[0].filled = web3.utils.toWei("5"));
    //     assert(balances[0].toString() === web3.utils.toWei("50"));
    //     assert(balances[1].toString() === web3.utils.toWei("5"));
    //     assert(balances[2].toString() === web3.utils.toWei("50"));
    //     assert(balances[3].toString() === web3.utils.toWei("95"));
    // });

    // it("should NOT create market order if token balance too low", async () => {
    //     await expectRevert(dex.createMarketOrder(REP, web3.utils.toWei("101"), SIDE.SELL, { from: trader2 }), "token balance too low");
    // });

    // it("should NOT create market order if dai balance too low", async () => {
    //     await dex.deposit(web3.utils.toWei("100"), REP, { from: trader1 });
    //     await dex.createLimitOrder(REP, web3.utils.toWei("100"), 10, SIDE.SELL, { from: trader1 });
    //     await expectRevert(dex.createMarketOrder(REP, web3.utils.toWei("101"), SIDE.BUY, { from: trader2 }), "dai balance too low");
    // });

    // it("should NOT create market order if token is DAI", async () => {
    //     await expectRevert(dex.createMarketOrder(DAI, web3.utils.toWei("1000"), SIDE.BUY, { from: trader1 }), "cannot trade DAI");
    // });

    // it("should NOT create market order if token does not not exist", async () => {
    //     await expectRevert(dex.createMarketOrder(web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST"), web3.utils.toWei("1000"), SIDE.BUY, { from: trader1 }), "this token does not exist");
    // });






