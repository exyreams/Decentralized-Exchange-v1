const { expectRevert } = require("@openzeppelin/test-helpers");
const Aug = artifacts.require("Aug.sol");
const Emp = artifacts.require("Emp.sol");
const Fnx = artifacts.require("Fnx.sol");
const Hlx = artifacts.require("Hlx.sol");
const Qtm = artifacts.require("Qtm.sol");
const Srs = artifacts.require("Srs.sol");
const Zrc = artifacts.require("Zrc.sol");
const DecentralizedExchange = artifacts.require("DecentralizedExchange.sol");
const SIDE = { BUY: 0, SELL: 1 };

contract("Decentralized Exchange", (accounts) => {
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

    //function for testing deposits
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

    //function for testing withdraw
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
    
    it("Shouldn't Withdraw Tokens: When balance too low.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("100"),FNX,{from: trader1});
        await expectRevert(decentralizedexchange.withdraw(web3.utils.toWei("1000"), FNX, {from: trader1}),"Balance isn't enough to Withdraw Tokens.");
    });

    //function for testing LimitOrders
    it("Should Create Limit Order.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("100"), FNX, { from: trader1 });
        await decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 });
        let buyOrders = await decentralizedexchange.getOrders(HLX, SIDE.BUY);
        let sellOrders = await decentralizedexchange.getOrders(HLX, SIDE.SELL);

        assert(buyOrders.length === 1);
        assert(buyOrders[0].trader === trader1);
        assert(buyOrders[0].ticker === web3.utils.padRight(HLX, 64));
        assert(buyOrders[0].price === "10");
        assert(buyOrders[0].amount === web3.utils.toWei("10"));
        assert(sellOrders.length === 0);

        await decentralizedexchange.deposit(web3.utils.toWei("200"), FNX, { from: trader2 });
        await decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("10"), 11, SIDE.BUY, { from: trader2 });

        buyOrders = await decentralizedexchange.getOrders(HLX, SIDE.BUY);
        sellOrders = await decentralizedexchange.getOrders(HLX, SIDE.SELL);
        assert(buyOrders.length === 2);
        assert(buyOrders[0].trader === trader2);
        assert(buyOrders[1].trader === trader1);
        assert(sellOrders.length === 0);

        await decentralizedexchange.deposit(web3.utils.toWei("200"), FNX, { from: trader2 });
        await decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("10"), 9, SIDE.BUY, { from: trader2 });

        buyOrders = await decentralizedexchange.getOrders(HLX, SIDE.BUY);
        sellOrders = await decentralizedexchange.getOrders(HLX, SIDE.SELL);
        assert(buyOrders.length === 3);
        assert(buyOrders[0].trader === trader2);
        assert(buyOrders[1].trader === trader1);
        assert(buyOrders[2].trader === trader2);
        assert(sellOrders.length === 0);
    });

    it("Shouldn't Create Limit Order: When token balance is too low.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("99"), HLX, { from: trader1 });
        await expectRevert(decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("100"), 10, SIDE.SELL, { from: trader1 }), "Token balance is too low.");
    });
    
    it("Shouldn't Create Limit Order: When FNX balance too low.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("99"), FNX, { from: trader1 });
        await expectRevert(decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 }), "FNX balance is too low.");
    });
    
    it("Shouldn't Create Limit Order: When token is FNX.", async () => {
        await expectRevert(decentralizedexchange.createLimitOrder(FNX, web3.utils.toWei("1000"), 10, SIDE.BUY, { from: trader1 }), "Cannot trade FNX.");
    });
    
    it("Shouldn't Create Limit Order: When token doesn't exist.", async () => {
        await expectRevert(decentralizedexchange.createLimitOrder(web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST"), web3.utils.toWei("1000"), 10, SIDE.BUY,
            { from: trader1 }), "This token doesn't exist.");
    });

    //function for testing marketOrders
    it("Should create Market Order & Match.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("100"), FNX, { from: trader1 });
        await decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("10"), 10, SIDE.BUY, { from: trader1 });
        await decentralizedexchange.deposit(web3.utils.toWei("100"), HLX, { from: trader2 });
        await decentralizedexchange.createMarketOrder(HLX, web3.utils.toWei("5"), SIDE.SELL, { from: trader2 });
    
        const balances = await Promise.all([
            decentralizedexchange.traderBalances(trader1, FNX),
            decentralizedexchange.traderBalances(trader1, HLX),
            decentralizedexchange.traderBalances(trader2, FNX),
            decentralizedexchange.traderBalances(trader2, HLX),
        ]);
    
        const orders = await decentralizedexchange.getOrders(HLX, SIDE.BUY);
        assert(orders.length === 1);
        assert(orders[0].filled === web3.utils.toWei("5"));
        assert(balances[0].toString() === web3.utils.toWei("50"));
        assert(balances[1].toString() === web3.utils.toWei("5"));
        assert(balances[2].toString() === web3.utils.toWei("50"));
        assert(balances[3].toString() === web3.utils.toWei("95"));
    });
    
    it("Shouldn't Create Market Order: When token balance too low.", async () => {
        await expectRevert(decentralizedexchange.createMarketOrder(HLX, web3.utils.toWei("101"), SIDE.SELL, { from: trader2 }), "Token balance is too low.");
    });
    
    it("Shouldn't Create Market Order: When FNX balance too low.", async () => {
        await decentralizedexchange.deposit(web3.utils.toWei("100"), HLX, { from: trader1 });
        await decentralizedexchange.createLimitOrder(HLX, web3.utils.toWei("100"), 10, SIDE.SELL, { from: trader1 });
        await expectRevert(decentralizedexchange.createMarketOrder(HLX, web3.utils.toWei("101"), SIDE.BUY, { from: trader2 }), "FNX balance is too low.");
    });
    
    it("Shouldn't Create Market Order: When token is FNX.", async () => {
        await expectRevert(decentralizedexchange.createMarketOrder(FNX, web3.utils.toWei("1000"), SIDE.BUY, { from: trader1 }), "Cannot trade FNX.");
    });
    
    it("Shouldn't Create Market Order: When token does not exist.", async () => {
        await expectRevert(decentralizedexchange.createMarketOrder(web3.utils.fromAscii("TOKEN-DOES-NOT-EXIST"), web3.utils.toWei("1000"), SIDE.BUY, { from: trader1 }), "This token doesn't exist.");
    });

});








