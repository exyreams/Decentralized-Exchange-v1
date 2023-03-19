// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./SafeMath.sol";
import "./IERC20.sol";

contract DecentralizedExchange {

    using SafeMath for uint256;

    enum Side { 
        BUY,
        SELL 
    }

    struct Token {
        bytes32 ticker;
        address tokenAddress;
    }

    struct Order {
        uint256 id;
        address trader;
        Side side;
        bytes32 ticker;
        uint256 amount;
        uint256 filled;
        uint256 price;
        uint256 date;
    }

    mapping(bytes32 => Token) public tokens;
    mapping(address => mapping(bytes32 => uint256)) public traderBalances;
    mapping(bytes32 => mapping(uint256 => Order[])) public orderBook;
   
    bytes32[] public tokenList;
    address public admin;
    uint256 public nextorderId;
    uint256 public nextTradeId;
    bytes32 constant FNX = bytes32("FNX");

    event NewTrade(
        uint256 tradeId,
        uint256 orderId,
        bytes32 indexed ticker,
        address indexed trader1,
        address indexed trader2,
        uint256 amount,
        uint256 price,
        uint256 date
    );

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only Administrator is allowed.");
        _;
    }
    
    modifier tokenIsNotFNX(bytes32 ticker) {
        require(ticker != FNX, "Cannot trade FNX.");
        _;
    }

    modifier tokenExist(bytes32 ticker) {
        require(tokens[ticker].tokenAddress != address(0),"This token doesn't exist.");
        _;
    }

    function getOrders(bytes32 ticker, Side side) external view returns(Order[] memory) {
      return orderBook[ticker][uint(side)];
    }

    function getTokens() external view returns(Token[] memory) {
      Token[] memory _tokens = new Token[](tokenList.length);
      for (uint i = 0; i < tokenList.length; i++) {
        _tokens[i] = Token(
          tokens[tokenList[i]].ticker,
          tokens[tokenList[i]].tokenAddress
        );
      }
      return _tokens;
    }

    function addToken(bytes32 ticker, address tokenAddress) external onlyAdmin {
        tokens[ticker] = Token(ticker, tokenAddress);
        tokenList.push(ticker);
    }

    function deposit(uint256 amount, bytes32 ticker) external tokenExist(ticker) {
        IERC20(tokens[ticker].tokenAddress).transferFrom(msg.sender,address(this),amount);
        traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].add(amount);
    }

    function withdraw(uint256 amount, bytes32 ticker) external tokenExist(ticker){
        require(traderBalances[msg.sender][ticker] >= amount,"Balance isn't enough to Withdraw Tokens.");
        traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(amount);
        IERC20(tokens[ticker].tokenAddress).transfer(msg.sender, amount);
    }

    function faucet(address recipient,uint256 amount,bytes32 ticker) external onlyAdmin {
        IERC20(tokens[ticker].tokenAddress).transfer(recipient, amount);
        traderBalances[recipient][ticker] = traderBalances[recipient][ticker].add(amount);
    }

    function createLimitOrder(bytes32 ticker,uint256 amount,uint256 price,Side side) external tokenExist(ticker) tokenIsNotFNX(ticker) {
        if (side == Side.SELL) {
            require(traderBalances[msg.sender][ticker] >= amount,"Token balance is too low.");
        } else {
            require(traderBalances[msg.sender][FNX] >= amount.mul(price),"FNX balance is too low.");
        }

        Order[] storage orders = orderBook[ticker][uint256(side)];
        orders.push(
            Order(
                nextorderId,
                msg.sender,
                side,
                ticker,
                amount,
                0,
                price,
                block.timestamp
            )
        );

        uint256 i = orders.length > 0 ? orders.length - 1 : 0;
        while (i > 0) {
            if (side == Side.BUY && orders[i - 1].price > orders[i].price) {
                break;
            }
            if (side == Side.SELL && orders[i - 1].price < orders[i].price) {
                break;
            }
            Order memory order = orders[i - 1];
            orders[i - 1] = orders[i];
            orders[i] = order;
            i = i.sub(1);
        }
        nextorderId = nextorderId.add(1);
    }

    function createMarketOrder(bytes32 ticker,uint256 amount,Side side) external tokenExist(ticker) tokenIsNotFNX(ticker) {
        if (side == Side.SELL) {
            require(traderBalances[msg.sender][ticker] >= amount,"Token balance it too low.");
        }
        Order[] storage orders = orderBook[ticker][uint256(side == Side.BUY ? Side.SELL : Side.BUY)];
        uint256 i;
        uint256 remaining = amount;

        while (i < orders.length && remaining > 0) {
            uint256 available = orders[i].amount.sub(orders[i].filled);
            uint256 matched = (remaining > available) ? available : remaining;
            remaining = remaining.sub(matched);
            orders[i].filled = orders[i].filled.add(matched);
            emit NewTrade(
                nextTradeId,
                orders[i].id,
                ticker,
                orders[i].trader,
                msg.sender,
                matched,
                orders[i].price,
                block.timestamp
            );
            if (side == Side.SELL) {
                traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(matched);
                traderBalances[msg.sender][FNX] = traderBalances[msg.sender][FNX].add(matched).mul(orders[i].price);
                traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].add(matched);
                traderBalances[orders[i].trader][FNX] = traderBalances[orders[i].trader][FNX].sub(matched).mul(orders[i].price);
            }
            if (side == Side.BUY) {
                require(traderBalances[msg.sender][FNX] >=matched.mul(orders[i].price),"FNX balance is too low.");
                traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].add(matched);
                traderBalances[msg.sender][FNX] = traderBalances[orders[i].trader][ticker].sub(matched).mul(orders[i].price);
                traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].sub(matched);
                traderBalances[orders[i].trader][FNX] = traderBalances[orders[i].trader][FNX].add(matched).mul(orders[i].price);
            }
            nextTradeId = nextTradeId.add(1);
            i = i.add(1);
        }

        i = 0;
        while (i < orders.length && orders[i].filled == orders[i].amount) {
            for (uint256 j = i; j < orders.length - 1; j++) {
                orders[j] = orders[j + 1];
            }
            orders.pop();
            i = i.add(1);
        }
    }
}