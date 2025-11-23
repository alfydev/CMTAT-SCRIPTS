// scripts/grant-minter-role.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const GRANTEE_ADDRESS = process.env.GRANTEE_ADDRESS;

  if (!TOKEN_ADDRESS || !GRANTEE_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and GRANTEE_ADDRESS env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must be admin):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Grantee (minter):", GRANTEE_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const MINTER_ROLE = await token.MINTER_ROLE();
  console.log("MINTER_ROLE:", MINTER_ROLE);

  const tx = await token.grantRole(MINTER_ROLE, GRANTEE_ADDRESS);
  console.log("Granting MINTER_ROLE... tx hash:", tx.hash);
  await tx.wait();

  const hasRole = await token.hasRole(MINTER_ROLE, GRANTEE_ADDRESS);
  console.log("Role granted:", hasRole);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

