import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { LFeiPair__factory, TestERC20__factory, TestArber__factory } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("LFeiPair", () => {
  let tokenAddress: string;
  let feiAddress: string;
  let usdcAddress: string;
  let arberAddress: string;
  const conversionRateNumerator = 950;
  const denominator = 1000;
  const initialSupply = 1000;

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    const LFeiPairFactory = new LFeiPair__factory(deployer);
    const TestERC20Factory = new TestERC20__factory(deployer);
    const TestArberFactory = new TestArber__factory(deployer);
    const feiContract = await TestERC20Factory.deploy(initialSupply);
    const usdcContract = await TestERC20Factory.deploy(initialSupply);

    // transfer usdc and fei to user address
    await usdcContract.transfer(user.address, initialSupply);
    await feiContract.transfer(user.address, initialSupply);


    feiAddress = feiContract.address;
    usdcAddress = usdcContract.address;

    const tokenContract = await LFeiPairFactory.deploy(conversionRateNumerator, feiAddress, usdcAddress);
    tokenAddress = tokenContract.address;

    const arberContract = await TestArberFactory.deploy(feiAddress, usdcAddress);
    arberAddress = arberContract.address;
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
      expect(await tokenInstance.usdcFeesNumerator()).to.equal(999);
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
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply)
      expect(await feiInstance.balanceOf(user.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
    });

    it("Should fail if account has low fei balance", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, 2 * initialSupply);
      await expect(tokenInstance.connect(user).depositFei(2 * initialSupply)).to.be.reverted;
    });
  });

  describe("Withdraw Fei", async () => {
    it("Should correctly withdraw fei", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply)

      expect(await feiInstance.balanceOf(user.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
      await tokenInstance.connect(user).withdrawFei(initialSupply);
      expect(await feiInstance.balanceOf(user.address)).to.equal(initialSupply);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(0);
    });

    it("Should fail if account has low LFei balance", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply)
      await expect(tokenInstance.connect(user).withdrawFei(2 * initialSupply)).to.be.reverted;
    });

  });

  describe("Withdraw USDC", async () => {
    it("Should correctly withdraw usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestERC20__factory(deployer).attach(usdcAddress);


      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(tokenInstance.address, initialSupply);

      expect(await feiInstance.balanceOf(user.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(initialSupply);
      await tokenInstance.connect(user).withdrawUSDC(initialSupply);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(50);
      expect(await usdcInstance.balanceOf(user.address)).to.equal(949);
      expect(await usdcInstance.balanceOf(deployer.address)).to.equal(1);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(0);
    });

    it("Should fail to withdraw usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);

      // transaction reverts because LFeiPair does not have enough USDC tokens
      await expect(tokenInstance.connect(user).withdrawUSDC(initialSupply)).to.be.reverted;
    });

  });

  describe("Swap", async () => {
    it("Should correctly swap fei for usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestERC20__factory(deployer).attach(usdcAddress);
      const arbInstance = new TestArber__factory(deployer).attach(arberAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(arbInstance.address, initialSupply);

      await arbInstance.flashArb(initialSupply, conversionRateNumerator * initialSupply / denominator + 1, tokenInstance.address);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(951);
      expect(await usdcInstance.balanceOf(arbInstance.address)).to.equal(49);
    });

    it("Should fail if usdc returned is insufficient", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestERC20__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestERC20__factory(deployer).attach(usdcAddress);
      const arbInstance = new TestArber__factory(deployer).attach(arberAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(arbInstance.address, initialSupply);

      await expect(arbInstance.flashArb(initialSupply, conversionRateNumerator * initialSupply / denominator - 1, tokenInstance.address))
        .to.be.reverted;
    });

  });

});
