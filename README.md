# LFei - Marketplace between Fei token holders and arbitrageurs 

These contracts provide a marketplace for **Fei holders** who want to sell but:
1. Don't have enough capital to quickly convert at a favorable price
2. Don't want to get involved into the complexities of an arbitrage

and, **arbitrageurs** who need enough capital to make their trades profitable.

Several contracts will be deployed each with a unique `conversionRate`, the contracts guarantee that `amountFei` of Fei will be converted to `conversionRate*amountFei` USDC.

These contracts can be treated as limit orders, where the execution is happening via arbitrageurs instead of an exchange.

### Contract Flow
1. [depositFei(uint256 amountFeiIn)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L37): Deposit `amountFeiIn` Fei into the contract and receive an equivalent amount of LFei tokens (used by **Fei holders**)
2. [withdrawFei(uint256 amountLFeiIn) ](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L43): Can withdraw `amountFeiIn` Fei by returning `amountFeiIn` LFei tokens (used by **Fei holders**)
3. [swap(uint256 amountFeiOut, address to, bytes calldata data)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L58): Can flash loan `amountFeiOut` Fei tokens from the contract but has to return atleast `conversionRate*amountFeiOut` USDC tokens. (used by **Arbitrageurs**)
4. [withdrawUSDC(uint256 amountLFeiIn)](https://github.com/ankitchiplunkar/lfei-core/blob/master/contracts/LFeiPair.sol#L49): Can withdraw USDC by returning LFei tokens, `amountLFeiIn` will return `conversionRate*amountLFeiIn` USDC tokens (minus 0.1% in fees). Any extra USDC can be claimed by the arbitrageur. The marketplace will give 0.1% of USDC tokens to the contract creator for each USDC withdrawal. (used by **Fei holders**)

## Contracts
### Ropsten:
1. `ConversionRate=0.99FEI<>USDC`: [0xe675c14714f532852115e83f58a48bfd2eb964c5](https://ropsten.etherscan.io/address/0xe675c14714f532852115e83f58a48bfd2eb964c5)
