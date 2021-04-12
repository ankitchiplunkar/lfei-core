# LFei - Marketplace between Fei token holders and arbitrageurs 

These contracts provide a marketplace for **Fei holders** who want to sell but:
1. Don't have enough capital to quickly convert at a favorable price
2. Don't want to get involved into the complexities of an arbitrage

and, **arbitrageurs** who need enough capital to make their trades profitable.

Several contracts will be deployed each with a unique `conversionRate`, the contracts guarantee that `amountFei` of Fei will be converted to `conversionRate*amountFei` USDC.

These contracts can be treated as limit orders, where the execution is happening via arbitrageurs instead of an exchange.

### Contract Flow
1. [depositFei(uint256 amountFeiIn)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L54): Deposit `amountFeiIn` Fei into the contract and receive an equivalent amount of LFei tokens (used by **Fei holders**)
2. [withdrawFei(uint256 amountFeiOut) ](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L71): Can withdraw `amountFeiOut` Fei by returning `amountFeiOut` LFei tokens (used by **Fei holders**)
3. [swap(uint256 amountFeiOut, address to, bytes calldata data)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L114): Can flash loan `amountFeiOut` Fei tokens from the contract but has to return atleast `conversionRate*amountFeiOut` USDC tokens + 0.3% in fees. Any extra USDC can be claimed by the arbitrageur, the marketplace will give 0.3% of USDC tokens to the contract creator for each USDC withdrawal.(used by **Arbitrageurs**)
4. [withdrawUSDC(uint256 amountUSDCOut)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L89): Can withdraw USDC by returning LFei tokens, will burn `amountUSDCOut/conversionRate` lFei tokens from the user and will return `amountUSDCOut` USDC tokens. (used by **Fei holders**)

## Contracts
### Ropsten:
1. `ConversionRate = 1FEI<>1USDC`: [0xE95b5622410e56ea876fFed00C3f63c6EF3D56A6](https://ropsten.etherscan.io/address/0xE95b5622410e56ea876fFed00C3f63c6EF3D56A6)
2. `ConversionRate = 0.95FEI<>1USDC`: [0xfECB7F0e191Feefabd85361F91E830e88f304D2F](https://ropsten.etherscan.io/address/0xfECB7F0e191Feefabd85361F91E830e88f304D2F)
3. `ConversionRate = 0.9FEI<>1USDC`: [0xAfc6CC6ec62E0E76b03B763E36E27b055F273cdb](https://ropsten.etherscan.io/address/0xAfc6CC6ec62E0E76b03B763E36E27b055F273cdb)
4. `ConversionRate = 0.85FEI<>1USDC`: [0x26Ba4e093122e0327971EC34811c24aF3B4b7AC5](https://ropsten.etherscan.io/address/0x26Ba4e093122e0327971EC34811c24aF3B4b7AC5)
5. `ConversionRate = 0.8FEI<>USDC`: [0xC8551200257aD83bbC01fE82984c815908B0Fe8C](https://ropsten.etherscan.io/address/0xC8551200257aD83bbC01fE82984c815908B0Fe8C)
6. `ConversionRate = 0.75FEI<>USDC`: [0xB2D62330ed55E23e517f6e2d48989dE8d1d1e3b2](https://ropsten.etherscan.io/address/0xB2D62330ed55E23e517f6e2d48989dE8d1d1e3b2)
