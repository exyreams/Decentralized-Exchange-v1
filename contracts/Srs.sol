// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./ERC20.sol";


contract Srs is ERC20 {

  constructor() ERC20("SRS", "Sirius", 18) {}

  function faucet(address to, uint amount) external {
    _mint(to, amount);
  }
  
}


// pragma solidity ^0.8.18;

// contract Srs { 
    
//     using SrsSafeMath for uint256;

//     mapping (address => uint256) private _balances;
//     mapping (address => mapping (address => uint256)) private _allowances;

//     string private constant name = "Sirius";
//     string private constant symbol = "SRS";
//     uint8 private decimals = 18;
//     uint256 private _totalSupply;

//     event Transfer(address indexed from, address indexed to, uint256 value);
//     event Approval(address indexed owner,address indexed spender,uint256 value);

//     function Name() public pure returns(string memory) {
//         return name;
//     }

//     function Symbol() public pure returns(string memory) {
//         return symbol;
//     }

//     function Decimals() public view returns(uint8) {
//         return decimals;
//     }

//     function totalSupply() public view returns (uint256) {
//         return _totalSupply;
//     }

//     function balanceOf(address account) public view returns (uint256) {
//         return _balances[account];
//     }

//     function _msgSender() internal view returns (address) {
//         return address(msg.sender);
//     }

//     function _msgData() internal view returns (bytes memory) {
//         this;
//         return msg.data;
//     }

//     function transfer(address recipient, uint256 amount) public returns (bool) {
//         _transfer(_msgSender(), recipient, amount);
//         return true;
//     }

//     function allowance(address owner, address spender) public view returns (uint256) {
//         return _allowances[owner][spender];
//     }

//     function approve(address spender, uint256 amount) public returns (bool) {
//         _approve(_msgSender(), spender, amount);
//         return true;
//     }

//     function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
//         _transfer(sender, recipient, amount);
//         _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
//         return true;
//     }

//     function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
//         _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));
//         return true;
//     }

//     function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
//         _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
//         return true;
//     }


//     function _transfer(address sender, address recipient, uint256 amount) internal {
//         require(sender != address(0), "ERC20: transfer from the zero address");
//         require(recipient != address(0), "ERC20: transfer to the zero address");

//         _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
//         _balances[recipient] = _balances[recipient].add(amount);
//         emit Transfer(sender, recipient, amount);
//     }

//     function _mint(address account, uint256 amount) internal {
//         require(account != address(0), "ERC20: mint to the zero address");
    
//         _totalSupply = _totalSupply.add(amount);
//         _balances[account] = _balances[account].add(amount);
//         emit Transfer(address(0), account, amount);
//     }

//     function faucet(address to, uint256 amount) external {
//         _mint(to, amount);
//     }

//     function _burn(address account, uint256 amount) internal {
//         require(account != address(0), "ERC20: burn from the zero address");

//         _balances[account] = _balances[account].sub(amount, "ERC20: burn amount exceeds balance");
//         _totalSupply = _totalSupply.sub(amount);
//         emit Transfer(account, address(0), amount);
//     }

//     function _approve(address owner, address spender, uint256 amount) internal {
//         require(owner != address(0), "ERC20: approve from the zero address");
//         require(spender != address(0), "ERC20: approve to the zero address");

//         _allowances[owner][spender] = amount;
//         emit Approval(owner, spender, amount);
//     }

//     function _burnFrom(address account, uint256 amount) internal {
//         _burn(account, amount);
//         _approve(account, _msgSender(), _allowances[account][_msgSender()].sub(amount, "ERC20: burn amount exceeds allowance"));
//     }
// }

// library SrsSafeMath {

//     function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//         unchecked {
//             uint256 c = a + b;
//             if (c < a) return (false, 0);
//             return (true, c);
//         }
//     }

//     function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//         unchecked {
//             if (b > a) return (false, 0);
//             return (true, a - b);
//         }
//     }

//     function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//         unchecked {
//             if (a == 0) return (true, 0);
//             uint256 c = a * b;
//             if (c / a != b) return (false, 0);
//             return (true, c);
//         }
//     }

//     function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//         unchecked {
//             if (b == 0) return (false, 0);
//             return (true, a / b);
//         }
//     }

//     function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//         unchecked {
//             if (b == 0) return (false, 0);
//             return (true, a % b);
//         }
//     }

//     function add(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a + b;
//     }

//     function sub(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a - b;
//     }

//     function mul(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a * b;
//     }

//     function div(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a / b;
//     }

//     function mod(uint256 a, uint256 b) internal pure returns (uint256) {
//         return a % b;
//     }

//     function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//         unchecked {
//             require(b <= a, errorMessage);
//             return a - b;
//         }
//     }

//     function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//         unchecked {
//             require(b > 0, errorMessage);
//             return a / b;
//         }
//     }

//     function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//         unchecked {
//             require(b > 0, errorMessage);
//             return a % b;
//         }
//     }
// }