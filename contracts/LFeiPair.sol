// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/ILFeiPairCallee.sol";

contract LFeiPair is ERC20 {
    using SafeMath for uint256;

    // contract constants
    uint128 public constant usdcFeesNumerator = 999; // output is 1 - 0.1%
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
        TransferHelper.safeTransfer(fei, msg.sender, amountLFeiIn);
    }

    // Burn LFeiPair from the sender and send equivalent amount of Fei tokens
    function withdrawUSDC(uint256 amountLFeiIn) public {
        _burn(msg.sender, amountLFeiIn);
        uint256 amountUSDCOut = amountLFeiIn.mul(conversionRateNumerator).div(denominator);
        uint256 amountUSDCWithdrawn = amountUSDCOut.mul(usdcFeesNumerator).div(denominator);
        TransferHelper.safeTransfer(usdc, msg.sender, amountUSDCWithdrawn);
    }

    function feesEarned() public view returns (uint256) {
        uint256 reserveFei = IERC20(fei).balanceOf(address(this));
        uint256 reserveUSDC = IERC20(usdc).balanceOf(address(this));
        uint256 reserveFeiEquivalentUSDC = reserveFei.mul(conversionRateNumerator).div(denominator);
        uint256 reserveEquivalentUSDC = reserveFeiEquivalentUSDC.add(reserveUSDC);
        uint256 outstandingUSDC = totalSupply().mul(conversionRateNumerator).div(denominator);
        if (outstandingUSDC > reserveEquivalentUSDC) {
            return 0;
        } else {
            return reserveEquivalentUSDC.sub(outstandingUSDC);
        }
    }

    // Transfers fees earned to the contract creator
    function claimFees() public {
        TransferHelper.safeTransfer(usdc, contractCreator, feesEarned());
    }

    // Creates a flash loan of amountFeiOut Fei atleast amountFeiOut*conversionRate should be returned back
    function swap(
        uint256 amountFeiOut,
        address to,
        bytes calldata data
    ) public {
        uint256 reserveFei = IERC20(fei).balanceOf(address(this));
        uint256 reserveUSDC = IERC20(usdc).balanceOf(address(this));
        TransferHelper.safeTransfer(fei, msg.sender, amountFeiOut); // optimistically sending fei tokens
        if (data.length > 0) ILFeiPairCallee(to).lFeiPairCall(msg.sender, amountFeiOut, data);
        uint256 newReserveUSDC = IERC20(usdc).balanceOf(address(this));
        uint256 newReserveFei = IERC20(fei).balanceOf(address(this));

        require(reserveFei > newReserveFei && reserveUSDC < newReserveUSDC, "only one way arb possible");
        uint256 feiLost = reserveFei - newReserveFei;
        uint256 equivalentUSDCLost = feiLost.mul(conversionRateNumerator).div(denominator);
        uint256 usdcGained = newReserveUSDC - reserveUSDC;
        require(equivalentUSDCLost < usdcGained, "USDC returned insufficient");
    }
}
