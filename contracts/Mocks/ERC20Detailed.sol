// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "./IERC20.sol";

abstract contract ERC20Detailed is IERC20 {
    string private name;
    string private symbol;
    uint8 private decimals;

    constructor (string memory _name, string memory _symbol, uint8 _decimals) {
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
    }

    function Name() public view returns (string memory) {
        return name;
    }


    function Symbol() public view returns (string memory) {
        return symbol;
    }

    function Decimals() public view returns (uint8) {
        return decimals;
    }
}