// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";

contract Aug is ERC20 {

    constructor() ERC20("AUG", "Auriga", 18)  {}

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
    
}
