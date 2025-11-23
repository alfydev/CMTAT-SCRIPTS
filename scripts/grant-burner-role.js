// scripts/grant-burner-role.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const BURNER_ADDRESS = process.env.BURNER_ADDRESS;

  if (!TOKEN_ADDRESS || !BURNER_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and BURNER_ADDRESS env vars.");
  }

  const [admin] = await ethers.getSigners();
  console.log("Admin (must have DEFAULT_ADMIN_ROLE):", admin.address);
  console.log("Token:", TOKEN_ADDRESS);
  console.log("Burner to grant role to:", BURNER_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  const BURNER_ROLE = await token.BURNER_ROLE();

  const isAdmin = await token.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
  console.log("Caller has DEFAULT_ADMIN_ROLE:", isAdmin);
  if (!isAdmin) {
    throw new Error("Caller does not have DEFAULT_ADMIN_ROLE. Use the admin wallet.");
  }

  const alreadyBurner = await token.hasRole(BURNER_ROLE, BURNER_ADDRESS);
  console.log("Target already has BURNER_ROLE:", alreadyBurner);
  if (alreadyBurner) {
    console.log("Nothing to do.");
    return;
  }

  console.log("Granting BURNER_ROLE…");
  const tx = await token.grantRole(BURNER_ROLE, BURNER_ADDRESS);
  console.log("grantRole tx hash:", tx.hash);
  await tx.wait();

  const nowBurner = await token.hasRole(BURNER_ROLE, BURNER_ADDRESS);
  console.log("Grant result, has BURNER_ROLE:", nowBurner);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

