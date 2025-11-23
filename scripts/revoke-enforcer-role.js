// scripts/revoke-enforcer-role.js
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
  console.log("Target (enforcer to revoke):", TARGET_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const ENFORCER_ROLE = await token.ENFORCER_ROLE();
  console.log("ENFORCER_ROLE:", ENFORCER_ROLE);

  const before = await token.hasRole(ENFORCER_ROLE, TARGET_ADDRESS);
  console.log("Has ENFORCER_ROLE before revoke:", before);

  const tx = await token.revokeRole(ENFORCER_ROLE, TARGET_ADDRESS);
  console.log("Revoking ENFORCER_ROLE... tx hash:", tx.hash);
  await tx.wait();

  const after = await token.hasRole(ENFORCER_ROLE, TARGET_ADDRESS);
  console.log("Has ENFORCER_ROLE after revoke:", after);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

