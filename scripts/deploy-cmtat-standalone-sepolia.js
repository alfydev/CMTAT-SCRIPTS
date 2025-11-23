// scripts/deploy-cmtat-standalone-sepolia.js
const { ethers } = require("hardhat");
const { ZeroAddress, keccak256, toUtf8Bytes } = require("ethers");

async function main() {
  // If you don’t use gasless / meta-tx, you can keep this as ZeroAddress.
  // Otherwise, put your trusted forwarder here.
  const forwarderIrrevocable = ZeroAddress;

  // This will be the DEFAULT_ADMIN_ROLE holder
  // (can manage roles, pause, forcedTransfer, forcedBurn, etc.).
  const [deployer] = await ethers.getSigners();
  const admin = deployer.address;
  console.log("Deploying from:", admin);

  // If you don’t have custom engines yet, you can set them to ZeroAddress.
  // Rule engine = address that enforces complex transfer rules
  // Snapshot engine = external contract for snapshotting
  // Document engine = external document / prospectus manager
  const ruleEngine = ZeroAddress;
  const snapshotEngine = ZeroAddress;
  const documentEngine = ZeroAddress;

  // ERC-20 metadata
  const ERC20Attributes = {
    name: "SWGCMAT",
    symbol: "SWGCMAT",
    // For typical securities CMTAT suggests 0 decimals; change if you need fractions.
    decimalsIrrevocable: 0,
  };

  // Terms / extra info (purely informational; change as you like)
  const terms = {
    name: "Terms v1",
    uri: "https://foobar.com/token-terms",
    documentHash: keccak256(toUtf8Bytes("terms-v1")),
  };

  const extraInformationAttributes = {
    tokenId: "ISIN-OR-OTHER-ID",
    terms: terms,
    information: "CMTAT security token example",
  };

  const engines = {
    ruleEngine: ruleEngine,
    snapshotEngine: snapshotEngine,
    documentEngine: documentEngine,
  };

  const CMTATStandalone = await ethers.getContractFactory("CMTATStandalone");

  const cmtat = await CMTATStandalone.deploy(
    forwarderIrrevocable,
    admin,
    ERC20Attributes,
    extraInformationAttributes,
    engines
  );

  await cmtat.waitForDeployment();

  console.log("CMTATStandalone deployed to:", await cmtat.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

