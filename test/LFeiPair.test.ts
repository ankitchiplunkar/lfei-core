import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { LFeiPair__factory, } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("LFeiPair", () => {
  let tokenAddress: string;
  const feiAddress = "0x956F47F50A910163D8BF957Cf5846D573E7f87CA";
  const usdcAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const conversionRateNumerator = 950;

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    const LFeiPairFactory = new LFeiPair__factory(deployer);
    const tokenContract = await LFeiPairFactory.deploy(conversionRateNumerator, feiAddress, usdcAddress);
    tokenAddress = tokenContract.address;

    expect(await tokenContract.totalSupply()).to.eq(0);
  });
  describe("Check constants", async () => {
    it("Should have the correct constants", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      // ERC20 constants
      expect(await tokenInstance.name()).to.equal("LFeiPair");
      expect(await tokenInstance.symbol()).to.equal("LFP");
      expect(await tokenInstance.totalSupply()).to.equal(0);
      // Contract constants
      expect(await tokenInstance.usdcOutNumerator()).to.equal(995);
      expect(await tokenInstance.denominator()).to.equal(1000);
      // Constructor constants
      expect(await tokenInstance.usdc()).to.equal(usdcAddress);
      expect(await tokenInstance.fei()).to.equal(feiAddress);
      expect(await tokenInstance.contractCreator()).to.equal(deployer.address);
      expect(await tokenInstance.conversionRateNumerator()).to.equal(conversionRateNumerator);
    });
  });

});
