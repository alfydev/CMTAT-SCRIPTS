// scripts/burn-or-clawback-burn.js
const { ethers } = require("hardhat");

async function main() {
  const TOKEN_ADDRESS    = process.env.TOKEN_ADDRESS;
  const TARGET_ADDRESS   = process.env.TARGET_ADDRESS;   // address whose tokens you want to destroy
  const AMOUNT           = process.env.AMOUNT;           // human-readable amount, e.g. "99"
  const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS; // optional; if missing, defaults to caller

  if (!TOKEN_ADDRESS || !TARGET_ADDRESS || !AMOUNT) {
    throw new Error("Please set TOKEN_ADDRESS, TARGET_ADDRESS and AMOUNT env vars.");
  }

  const [caller] = await ethers.getSigners();
  const treasury = TREASURY_ADDRESS || caller.address;

  console.log("Caller (must have BURNER_ROLE, and admin if forcedTransfer is needed):", caller.address);
  console.log("Token address:", TOKEN_ADDRESS);
  console.log("Target address (to burn from):", TARGET_ADDRESS);
  console.log("Treasury address (for clawback if needed):", treasury);
  console.log("Amount (human):", AMOUNT);

  const token = await ethers.getContractAt("CMTATStandalone", TOKEN_ADDRESS);

  const BURNER_ROLE = await token.BURNER_ROLE();
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();

  const isBurner = await token.hasRole(BURNER_ROLE, caller.address);
  const isAdmin  = await token.hasRole(DEFAULT_ADMIN_ROLE, caller.address);

  console.log("Caller has BURNER_ROLE:", isBurner);
  console.log("Caller has DEFAULT_ADMIN_ROLE:", isAdmin);

  if (!isBurner) {
    throw new Error("Caller does not have BURNER_ROLE. Use the burner wallet.");
  }

  const decimals = await token.decimals();
  const amount = ethers.parseUnits(AMOUNT, decimals);
  console.log("Amount to destroy (base units):", amount.toString());

  // Read balances and total supply before
  const targetBefore   = await token.balanceOf(TARGET_ADDRESS);
  const treasuryBefore = await token.balanceOf(treasury);
  const totalBefore    = await token.totalSupply();

  console.log("Target balance before (base units):",   targetBefore.toString());
  console.log("Treasury balance before (base units):", treasuryBefore.toString());
  console.log("Total supply before (base units):",     totalBefore.toString());

  if (targetBefore < amount) {
    throw new Error(`Target balance is smaller than amount to destroy. balance=${targetBefore.toString()}, amount=${amount.toString()}`);
  }

  const isFrozen = await token.isFrozen(TARGET_ADDRESS);
  console.log("Target is frozen:", isFrozen);

  // ------------------------------------------------
  // CASE 1: target is NOT frozen → direct burn
  // ------------------------------------------------
  if (!isFrozen) {
    console.log("Target is not frozen → burning directly from TARGET_ADDRESS via burn(address,uint256,bytes)");

    const burnFn = token["burn(address,uint256,bytes)"];
    const tx = await burnFn(TARGET_ADDRESS, amount, "0x");
    console.log("Burn tx hash:", tx.hash);
    await tx.wait();
  } else {
    // ------------------------------------------------
    // CASE 2: target is frozen → forcedTransfer + burn
    // ------------------------------------------------
    console.log("Target is frozen → performing forcedTransfer to treasury, then burning there.");

    if (!isAdmin) {
      throw new Error("Caller must also have DEFAULT_ADMIN_ROLE to use forcedTransfer on a frozen target.");
    }

    // Step 1: forcedTransfer TARGET → TREASURY
    const forcedTransferFn = token["forcedTransfer(address,address,uint256,bytes)"];

    console.log("Calling forcedTransfer(TARGET → TREASURY) …");
    const tx1 = await forcedTransferFn(TARGET_ADDRESS, treasury, amount, "0x");
    console.log("forcedTransfer tx hash:", tx1.hash);
    await tx1.wait();

    const targetMid   = await token.balanceOf(TARGET_ADDRESS);
    const treasuryMid = await token.balanceOf(treasury);

    console.log("Target balance after forcedTransfer (base units):",   targetMid.toString());
    console.log("Treasury balance after forcedTransfer (base units):", treasuryMid.toString());

    if (treasuryMid < treasuryBefore + amount) {
      console.warn("WARNING: Treasury balance after forcedTransfer is smaller than expected. Double-check balances.");
    }

    // Step 2: burn from TREASURY
    console.log("Burning from treasury via burn(address,uint256,bytes)…");
    const burnFn = token["burn(address,uint256,bytes)"];
    const tx2 = await burnFn(treasury, amount, "0x");
    console.log("Burn tx hash:", tx2.hash);
    await tx2.wait();
  }

  // Final balances and total supply after everything
  const targetAfter   = await token.balanceOf(TARGET_ADDRESS);
  const treasuryAfter = await token.balanceOf(treasury);
  const totalAfter    = await token.totalSupply();

  console.log("Target balance after (base units):",   targetAfter.toString());
  console.log("Treasury balance after (base units):", treasuryAfter.toString());
  console.log("Total supply after (base units):",     totalAfter.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

