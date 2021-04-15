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
  const initialSupply = ethers.BigNumber.from("100000000000000000000")
  const initialUSDCSupply = ethers.BigNumber.from("100000000")

  console.log(deployer.address);
  const TestFeiTokenFactory = new TestFei__factory(deployer);
  const FeiInstance = await TestFeiTokenFactory.deploy(initialSupply);
  await FeiInstance.deployed();
  console.log('Fei deployed to: ', FeiInstance.address);
  console.log("Sender balance", (await FeiInstance.balanceOf(deployer.address)).toString());
  const TestUsdcTokenFactory = new TestUSDC__factory(deployer);
  const USDCInstance = await TestUsdcTokenFactory.deploy(initialUSDCSupply);
  await USDCInstance.deployed();
  console.log('USDC deployed to: ', USDCInstance.address);
  console.log("Sender balance", (await USDCInstance.balanceOf(deployer.address)).toString());
  const TestArberFactory = new TestArber__factory(deployer);
  const arberContract = await TestArberFactory.deploy(FeiInstance.address, USDCInstance.address);
  console.log('arber deployed to: ', arberContract.address);

  // deploying limit order contracts
  for (let i of [1000, 950, 900, 850, 800, 750]) {
    const LFeiPairFactory = new LFeiPair__factory(deployer);
    const LFeiInstance = await LFeiPairFactory.deploy(i, FeiInstance.address, USDCInstance.address);
    await LFeiInstance.deployed();
    console.log('LFei of conversionRate', i / 1000, ' deployed to: ', LFeiInstance.address);
  }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
