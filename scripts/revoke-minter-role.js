// scripts/revoke-minter-role.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const TARGET_ADDRESS = process.env.TARGET_ADDRESS;

  if (!TOKEN_ADDRESS || !TARGET_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and TARGET_ADDRESS env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must be admin):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Target (minter to revoke):", TARGET_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const MINTER_ROLE = await token.MINTER_ROLE();
  console.log("MINTER_ROLE:", MINTER_ROLE);

  const before = await token.hasRole(MINTER_ROLE, TARGET_ADDRESS);
  console.log("Has MINTER_ROLE before revoke:", before);

  const tx = await token.revokeRole(MINTER_ROLE, TARGET_ADDRESS);
  console.log("Revoking MINTER_ROLE... tx hash:", tx.hash);
  await tx.wait();

  const after = await token.hasRole(MINTER_ROLE, TARGET_ADDRESS);
  console.log("Has MINTER_ROLE after revoke:", after);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

