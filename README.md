# LFei - Marketplace between Fei token holders and arbitrageurs 

These contracts provide a marketplace for **Fei holders** who want to sell but:
1. Don't have enough capital to quickly convert at a favourable price
2. Don't want to get involved into the complexities of an arbitrage

and, **arbitrageurs** who need ennough capital to make their trades profitable.

Several contracts will be deployed each with a unique `conversionRate`, the contracts guarantee that `amountFei` of Fei will be converted to `conversionRate*amountFei` USDC.

### Contract Flow
1. [Fei Holder]: Deposit Fei into the contract and receive an equivalent amount of LFei tokens
2. [Fei Holder]: Can withdraw Fei by returning LFei tokens
3. [Arbitrageur]: Can flash loan `amountFei` Fei tokens from the contract but has to return atleast `conversionRate*amountFei` USDC tokens.
4. [Fei Holder]: Can withdraw USDC by returning LFei tokens, `amountLFei` will return `conversionRate*amountLFei` USDC tokens (minus 0.1% in fees). Any extra USDC can be claimed by the arbitrageur.
5. [Marketplace]: The marketplace will give 0.1% of USDC tokens to the contract creator for each USDC withdrawal.

## Contracts
### Ropsten:
1. `ConversionRate=0.99FEI<>USDC`: [0xe675c14714f532852115e83f58a48bfd2eb964c5](https://ropsten.etherscan.io/address/0xe675c14714f532852115e83f58a48bfd2eb964c5)