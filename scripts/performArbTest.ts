// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { TestFei__factory, TestUSDC__factory, LFeiPair__factory, TestArber__factory } from "../typechain";



async function main(): Promise<void> {
  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");
  // We get the contract to deploy
  const [deployer] = await ethers.getSigners();
  const feiAddress = "0x1d2413000D1Be1504ff93f8DDF2606f6E1384B4b"
  const usdcAddress = "0xb42A48ED6Ea543834FD314A54d918f0f52E2A367"
  const arberAddress = "0x16e57e0Faf1686176cAC07f041679e217Fd4129A"

  const lFeiAddress = "0x6E3fa4c9ACF353d5f1A213008E5A93ec1798b86a"   

  console.log(deployer.address);
  const TestFeiTokenFactory = new TestFei__factory();
  const FeiInstance = TestFeiTokenFactory.attach(feiAddress);
  const TestUsdcTokenFactory = new TestUSDC__factory();
  const USDCInstance = TestUsdcTokenFactory.attach(usdcAddress);
  const TestArberFactory = new TestArber__factory(deployer);
  const arberInstance = TestArberFactory.attach(arberAddress);
  const LFeiPairFactory = new LFeiPair__factory();
  const LFeiInstance = LFeiPairFactory.attach(lFeiAddress);

  // send usdc to arber
  const flashArbedFeiValue = ethers.BigNumber.from("100000000000000000000");
  const flashArbedfeiToUSDC = flashArbedFeiValue.mul(900).div(1000).div(1000000000000)
  const flashArbedfeiToUSDCWithFees = flashArbedfeiToUSDC.mul(1003).div(1000);
  // await USDCInstance.connect(deployer).transfer(arberInstance.address, flashArbedFeiValue);
  await arberInstance.connect(deployer).flashArb(flashArbedFeiValue, flashArbedfeiToUSDCWithFees.add(1), lFeiAddress);
  // await LFeiInstance.connect(deployer).withdrawUSDC(flashArbedFeiValue);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
