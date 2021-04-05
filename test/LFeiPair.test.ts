import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { LFeiPair__factory, TestERC20__factory } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("LFeiPair", () => {
  let tokenAddress: string;
  let feiAddress: string;
  let usdcAddress: string;
  const conversionRateNumerator = 950;
  const initialSupply = 1000;

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    const LFeiPairFactory = new LFeiPair__factory(deployer);
    const TestERC20Factory = new TestERC20__factory(deployer);
    const feiContract = await TestERC20Factory.deploy(initialSupply);
    const usdcContract = await TestERC20Factory.deploy(initialSupply);

    feiAddress = feiContract.address;
    usdcAddress = usdcContract.address;

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

  describe("Deposit Fei", async () => {
    it("Should correctly deposit fei", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.approve(tokenInstance.address, initialSupply);
      await tokenInstance.depositFei(initialSupply)
      expect(await feiInstance.balanceOf(deployer.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(deployer.address)).to.equal(initialSupply);
    });

    it("Should fail if account has low fei balance", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.approve(tokenInstance.address, 2 * initialSupply);
      await expect(tokenInstance.depositFei(2 * initialSupply)).to.be.reverted;
    });
  });

  describe("Withdraw Fei", async () => {
    it("Should correctly withdraw fei", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.approve(tokenInstance.address, initialSupply);
      await tokenInstance.depositFei(initialSupply)
      expect(await feiInstance.balanceOf(deployer.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(deployer.address)).to.equal(initialSupply);
      await tokenInstance.withdrawFei(initialSupply);
      expect(await feiInstance.balanceOf(deployer.address)).to.equal(initialSupply);
      expect(await tokenInstance.balanceOf(deployer.address)).to.equal(0);
    });

    it("Should fail if account has low LFei balance", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.approve(tokenInstance.address, initialSupply);
      await tokenInstance.depositFei(initialSupply)
      await expect(tokenInstance.withdrawFei(2 * initialSupply)).to.be.reverted;
    });

  });

});
