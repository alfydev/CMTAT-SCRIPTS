// scripts/mint-1000.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS;

  if (!TOKEN_ADDRESS || !RECIPIENT_ADDRESS) {
    throw new Error("Please set TOKEN_ADDRESS and RECIPIENT_ADDRESS env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must have MINTER_ROLE or be admin):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Recipient:", RECIPIENT_ADDRESS);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const decimals = await token.decimals();
  const amount = ethers.parseUnits("1000", decimals); // 1000 tokens

  console.log(`Minting 1000 tokens (10^${Number(decimals)} base units) ...`);

  // ✅ Disambiguate the overloaded function:
  const tx = await token["mint(address,uint256,bytes)"](RECIPIENT_ADDRESS, amount, "0x");
  console.log("Mint tx hash:", tx.hash);
  await tx.wait();

  const balance = await token.balanceOf(RECIPIENT_ADDRESS);
  console.log("New recipient balance:", balance.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

