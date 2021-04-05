// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @notice A mintable ERC20
 */
contract LFeiPair is ERC20 {
    using SafeMath for uint256;

    // contract constants
    uint128 public constant usdcOutNumerator = 995; // output is 1 - 0.5%
    uint128 public constant denominator = 1000; // fee is 0.5%

    // constructor constants
    address public usdc;
    address public fei;
    address public contractCreator;
    uint256 public conversionRateNumerator; // this conversion rate is divided by denominator (1000)

    constructor(
        uint256 _conversionRateNumerator,
        address _fei,
        address _usdc
    ) public ERC20("LFeiPair", "LFP") {
        conversionRateNumerator = _conversionRateNumerator;
        contractCreator = msg.sender;
        fei = _fei;
        usdc = _usdc;
    }

    receive() external payable {}

    // Deposit Fei into the contract and mint equivalent amount of LFeiPair tokens
    function depositFei(uint256 amountFeiIn) public {
        TransferHelper.safeTransferFrom(fei, msg.sender, address(this), amountFeiIn);
        _mint(msg.sender, amountFeiIn);
    }

    // Burn LFeiPair from the sender and send equivalent amount of Fei tokens
    function withdrawFei(uint256 amountLFeiIn) public {
        _burn(msg.sender, amountLFeiIn);
        TransferHelper.safeTransferFrom(fei, address(this), msg.sender, amountLFeiIn);
    }

    // Burn LFeiPair from the sender and send equivalent amount of Fei tokens
    function withdrawUSDC(uint256 amountLFeiIn) public {
        _burn(msg.sender, amountLFeiIn);
        uint256 amountUSDCOut = amountLFeiIn.mul(usdcOutNumerator).div(denominator);
        uint256 amountUSDCWithdrawn = amountUSDCOut.mul(conversionRateNumerator).div(denominator);
        uint256 amountUSDCFees = amountUSDCOut.sub(amountUSDCWithdrawn);
        TransferHelper.safeTransferFrom(usdc, address(this), msg.sender, amountUSDCWithdrawn);
        TransferHelper.safeTransferFrom(usdc, address(this), contractCreator, amountUSDCFees);
    }
}
