// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";

contract Fnx is ERC20 {

    constructor() ERC20("FNX", "Finix", 18) {}

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
    
}