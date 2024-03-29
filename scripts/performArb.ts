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
  const fei = '0x956F47F50A910163D8BF957Cf5846D573E7f87CA';
  const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const arberAddress = "0xd985E01C6D47322a55586A930951fd3E125045B2"
  const lFeiAddress = "0x7a3B15eE0D0884804F6e846f1F597175ea4631a8"   

  console.log(deployer.address);
  const TestArberFactory = new TestArber__factory(deployer);
  const arberInstance = TestArberFactory.attach(arberAddress);

  const feiDecimals = ethers.BigNumber.from("1000000000000000000")
  const flashArbedFeiValue = feiDecimals.mul(10);
  const flashArbedfeiToUSDC = flashArbedFeiValue.mul(900).div(1000).div(1000000000000)
  const flashArbedfeiToUSDCWithFees = flashArbedfeiToUSDC.mul(1003).div(1000);
  await arberInstance.connect(deployer).flashArb(flashArbedFeiValue, flashArbedfeiToUSDCWithFees.add(1), lFeiAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
