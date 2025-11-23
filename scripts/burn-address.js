// scripts/burn-address.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
  const TARGET_ADDRESS = process.env.TARGET_ADDRESS;
  const AMOUNT = process.env.AMOUNT; // human, e.g. "99"

  if (!TOKEN_ADDRESS || !TARGET_ADDRESS || !AMOUNT) {
    throw new Error("Please set TOKEN_ADDRESS, TARGET_ADDRESS and AMOUNT env vars.");
  }

  const [caller] = await ethers.getSigners();
  console.log("Caller (must have BURNER_ROLE):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Target address (to burn from):", TARGET_ADDRESS);
  console.log("Amount (human):", AMOUNT);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  // Roles
  const BURNER_ROLE = await token.BURNER_ROLE();
  const isBurner = await token.hasRole(BURNER_ROLE, caller.address);
  console.log("Caller has BURNER_ROLE:", isBurner);
  if (!isBurner) {
    throw new Error("Caller does not have BURNER_ROLE. Use the burner wallet.");
  }

  // Check if target is frozen – if yes, bail out with guidance
  const isFrozen = await token.isFrozen(TARGET_ADDRESS);
  console.log("Target is frozen:", isFrozen);
  if (isFrozen) {
    console.log(
      "Target address is frozen. CMTAT does not allow burning directly from a frozen address.\n" +
      "Please either:\n" +
      "  - unfreeze the address and run this script again, OR\n" +
      "  - use burn-or-clawback-burn.js to forcedTransfer + burn."
    );
    return;
  }

  // Decimals + amount in base units
  const decimals = await token.decimals();
  const amount = ethers.parseUnits(AMOUNT, decimals);
  console.log("Amount to burn (base units):", amount.toString());

  // Balances & total supply before
  const balanceBefore = await token.balanceOf(TARGET_ADDRESS);
  const totalSupplyBefore = await token.totalSupply();

  console.log("Balance before burn (base units):", balanceBefore.toString());
  console.log("Total supply before burn (base units):", totalSupplyBefore.toString());

  if (balanceBefore < amount) {
    throw new Error("Target balance is smaller than amount to burn.");
  }

  // --- Proper supply-reducing burn ---
  // Use the explicit overload to avoid the ethers v6 "ambiguous function" error:
  const burnFn = token["burn(address,uint256,bytes)"];

  console.log("Calling burn(address,uint256,bytes) …");
  const tx = await burnFn(TARGET_ADDRESS, amount, "0x");
  console.log("Burn tx hash:", tx.hash);
  await tx.wait();

  // Balances & total supply after
  const balanceAfter = await token.balanceOf(TARGET_ADDRESS);
  const totalSupplyAfter = await token.totalSupply();

  console.log("Balance after burn (base units):", balanceAfter.toString());
  console.log("Total supply after burn (base units):", totalSupplyAfter.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

