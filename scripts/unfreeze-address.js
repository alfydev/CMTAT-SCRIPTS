// scripts/unfreeze-address.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const UNFREEZE_ADDRESS = process.env.UNFREEZE_ADDRESS;

  if (!TOKEN_ADDRESS || !UNFREEZE_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and UNFREEZE_ADDRESS env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must have ENFORCER_ROLE):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Address to unfreeze:", UNFREEZE_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const tx = await token.setAddressFrozen(UNFREEZE_ADDRESS, false);
  console.log("Unfreezing address... tx hash:", tx.hash);
  await tx.wait();

  const frozen = await token.isFrozen(UNFREEZE_ADDRESS);
  console.log("Frozen status:", frozen);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

