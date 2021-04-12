// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @notice A mintable ERC20
 */
contract TestFei is ERC20 {
    using SafeMath for uint256;

    constructor(uint256 _totalSupply) public ERC20("Fei", "Fei") {
        _mint(msg.sender, _totalSupply);
    }
}
