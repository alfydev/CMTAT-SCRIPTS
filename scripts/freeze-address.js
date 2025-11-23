// scripts/freeze-address.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const FREEZE_ADDRESS = process.env.FREEZE_ADDRESS;

  if (!TOKEN_ADDRESS || !FREEZE_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and FREEZE_ADDRESS env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must have ENFORCER_ROLE):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Address to freeze:", FREEZE_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const tx = await token.setAddressFrozen(FREEZE_ADDRESS, true);
  console.log("Freezing address... tx hash:", tx.hash);
  await tx.wait();

  const frozen = await token.isFrozen(FREEZE_ADDRESS);
  console.log("Frozen status:", frozen);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

