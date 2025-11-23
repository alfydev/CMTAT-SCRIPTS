// scripts/forced-transfer.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const FROM_ADDRESS = process.env.FROM_ADDRESS;
  const TO_ADDRESS = process.env.TO_ADDRESS;
  const AMOUNT = process.env.AMOUNT; // e.g. "1000"

  if (!TOKEN_ADDRESS || !FROM_ADDRESS || !TO_ADDRESS || !AMOUNT) {
    throw new Error("Please set TOKEN_ADDRESS, FROM_ADDRESS, TO_ADDRESS and AMOUNT env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must be admin):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("From:", FROM_ADDRESS);
  console.log("To:", TO_ADDRESS);
  console.log("Amount (human):", AMOUNT);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const decimals = await token.decimals();
  const amount = ethers.parseUnits(AMOUNT, decimals);

  // 👇 Disambiguate the overloaded function here
  const tx = await token["forcedTransfer(address,address,uint256,bytes)"](
    FROM_ADDRESS,
    TO_ADDRESS,
    amount,
    "0x"    // data
  );
  console.log("Forced transfer tx hash:", tx.hash);
  await tx.wait();

  const fromBal = await token.balanceOf(FROM_ADDRESS);
  const toBal = await token.balanceOf(TO_ADDRESS);

  console.log("New FROM balance:", fromBal.toString());
  console.log("New TO balance:", toBal.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

