// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";

contract Emp is ERC20 {
    
    constructor() ERC20("EMP", "Empyrean", 18) {}

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
}