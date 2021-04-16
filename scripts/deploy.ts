// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from 'hardhat';
import { Contract, ContractFactory } from 'ethers';
import { LFeiPair__factory } from "../typechain";


async function main(): Promise<void> {
  // Hardhat always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");
  // We get the contract to deploy
  const [deployer] = await ethers.getSigners();
  const fei = '0x956F47F50A910163D8BF957Cf5846D573E7f87CA';
  const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  console.log(deployer.address);
  const LFeiPairFactory = new LFeiPair__factory(deployer);
  const LFeiInstance = await LFeiPairFactory.deploy(1000, fei, usdc);
  await LFeiInstance.deployed();
  console.log('LFei deployed to: ', LFeiInstance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
