import { ethers } from "hardhat";
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { LFeiPair__factory, TestFei__factory, TestUSDC__factory, TestArber__factory } from "../typechain";

chai.use(solidity);
const { expect } = chai;

describe("LFeiPair", () => {
  let tokenAddress: string;
  let feiAddress: string;
  let usdcAddress: string;
  let arberAddress: string;
  const conversionRateNumerator = 950;
  const usdcFeesNumerator = 1003;
  const denominator = 1000;
  const initialSupply = ethers.BigNumber.from("100000000000000000000");

  beforeEach(async () => {
    const [deployer, user] = await ethers.getSigners();
    const LFeiPairFactory = new LFeiPair__factory(deployer);
    const TestFeiFactory = new TestFei__factory(deployer);
    const TestUSDCFactory = new TestUSDC__factory(deployer);
    const TestArberFactory = new TestArber__factory(deployer);
    const feiContract = await TestFeiFactory.deploy(initialSupply);
    const usdcContract = await TestUSDCFactory.deploy(initialSupply);

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
      expect(await tokenInstance.usdcFeesNumerator()).to.equal(usdcFeesNumerator);
      expect(await tokenInstance.denominator()).to.equal(denominator);
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
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply)
      expect(await feiInstance.balanceOf(user.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
    });

    it("Should fail if account has low fei balance", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply.mul(2));
      await expect(tokenInstance.connect(user).depositFei(initialSupply.mul(2))).to.be.reverted;
    });
  });

  describe("Withdraw Fei", async () => {
    it("Should correctly withdraw fei", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
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
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply)
      await expect(tokenInstance.connect(user).withdrawFei(initialSupply.mul(2))).to.be.reverted;
    });

  });

  describe("Withdraw USDC", async () => {
    const equivalentUSDC = initialSupply.mul(conversionRateNumerator).div(denominator).div(1000000000000)
    it("Should correctly withdraw usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestUSDC__factory(deployer).attach(usdcAddress);


      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(tokenInstance.address, initialSupply);

      expect(await feiInstance.balanceOf(user.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(initialSupply);
      expect(await tokenInstance.withdrawableUSDC(user.address)).to.equal(equivalentUSDC)
      await tokenInstance.connect(user).withdrawUSDC(equivalentUSDC);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(initialSupply.sub(equivalentUSDC));
      expect(await usdcInstance.balanceOf(user.address)).to.equal(equivalentUSDC);
      expect(await usdcInstance.balanceOf(deployer.address)).to.equal(0);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(0);
    });

    it("Should fail to withdraw usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);

      // transaction reverts because LFeiPair does not have enough USDC tokens
      await expect(tokenInstance.connect(user).withdrawUSDC(initialSupply)).to.be.reverted;
    });

  });

  describe("Swap", async () => {
    const sentBackflashArbedUSDC = initialSupply.mul(conversionRateNumerator).div(denominator).div(1000000000000).mul(usdcFeesNumerator).div(denominator)
    it("Should correctly swap fei for usdc", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestUSDC__factory(deployer).attach(usdcAddress);
      const arbInstance = new TestArber__factory(deployer).attach(arberAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(arbInstance.address, initialSupply);

      await arbInstance.flashArb(initialSupply, sentBackflashArbedUSDC.add(1), tokenInstance.address);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(sentBackflashArbedUSDC.add(1));
      expect(await usdcInstance.balanceOf(arbInstance.address)).to.equal(initialSupply.sub(sentBackflashArbedUSDC).sub(1));
    });

    it("Should fail if usdc returned is insufficient", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestUSDC__factory(deployer).attach(usdcAddress);
      const arbInstance = new TestArber__factory(deployer).attach(arberAddress);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(arbInstance.address, initialSupply);

      await expect(arbInstance.flashArb(initialSupply, sentBackflashArbedUSDC.sub(1), tokenInstance.address))
        .to.be.reverted;
    });

  });

  describe("Fees", async () => {
    it("Should correctly calculate and claim fees", async () => {
      const [deployer, user] = await ethers.getSigners();
      const tokenInstance = new LFeiPair__factory(deployer).attach(tokenAddress);
      const feiInstance = new TestFei__factory(deployer).attach(feiAddress);
      const usdcInstance = new TestUSDC__factory(deployer).attach(usdcAddress);
      const arbInstance = new TestArber__factory(deployer).attach(arberAddress);
      const flashArbedfeiToUSDC = initialSupply.mul(conversionRateNumerator).div(denominator).div(1000000000000); 
      const flashArbedfeiToUSDCWithFees = flashArbedfeiToUSDC.mul(usdcFeesNumerator).div(denominator);

      await feiInstance.connect(user).approve(tokenInstance.address, initialSupply);
      await tokenInstance.connect(user).depositFei(initialSupply);
      await usdcInstance.connect(user).transfer(arbInstance.address, initialSupply);

      await arbInstance.flashArb(initialSupply, flashArbedfeiToUSDCWithFees.add(1), tokenInstance.address);

      expect(await feiInstance.balanceOf(arbInstance.address)).to.equal(initialSupply);
      expect(await tokenInstance.balanceOf(user.address)).to.equal(initialSupply);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(flashArbedfeiToUSDCWithFees.add(1));
      await tokenInstance.connect(user).withdrawUSDC(flashArbedfeiToUSDC);

      expect(await tokenInstance.feesEarned()).to.equal(flashArbedfeiToUSDCWithFees.sub(flashArbedfeiToUSDC).add(1));
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(flashArbedfeiToUSDCWithFees.sub(flashArbedfeiToUSDC).add(1));
      expect(await usdcInstance.balanceOf(deployer.address)).to.equal(0);

      await tokenInstance.connect(user).claimFees();
      expect(await tokenInstance.feesEarned()).to.equal(0);
      expect(await usdcInstance.balanceOf(tokenInstance.address)).to.equal(0);
      expect(await usdcInstance.balanceOf(deployer.address)).to.equal(flashArbedfeiToUSDCWithFees.sub(flashArbedfeiToUSDC).add(1));
    });

  });

});
