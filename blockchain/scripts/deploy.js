const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const candidateNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Minh Châu",
    "Phạm Quốc Dũng"
  ];

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60;        // start in 1 minute
  const endTime = now + 60 * 60 * 24; // end in 24 hours

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidateNames, startTime, endTime);
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();
  console.log("Voting contract deployed to:", contractAddress);

  // Save deployment info
  const deployInfo = {
    contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    startTime,
    endTime,
    candidates: candidateNames
  };

  const deployPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deployPath)) fs.mkdirSync(deployPath, { recursive: true });

  fs.writeFileSync(
    path.join(deployPath, `${hre.network.name}.json`),
    JSON.stringify(deployInfo, null, 2)
  );

  // Copy ABI to frontend and backend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Voting.sol/Voting.json");

  const frontendAbiPath = path.join(__dirname, "../../frontend/src/utils");
  if (!fs.existsSync(frontendAbiPath)) fs.mkdirSync(frontendAbiPath, { recursive: true });

  const artifact = JSON.parse(fs.readFileSync(artifactPath));
  const abiExport = {
    abi: artifact.abi,
    contractAddress,
    chainId: hre.network.config.chainId,
    network: hre.network.name
  };

  fs.writeFileSync(
    path.join(frontendAbiPath, "contractConfig.json"),
    JSON.stringify(abiExport, null, 2)
  );

  const backendAbiPath = path.join(__dirname, "../../backend/src/config");
  if (!fs.existsSync(backendAbiPath)) fs.mkdirSync(backendAbiPath, { recursive: true });

  fs.writeFileSync(
    path.join(backendAbiPath, "contractConfig.json"),
    JSON.stringify(abiExport, null, 2)
  );

  console.log("ABI and config saved to frontend and backend.");
  console.log("\nDeployment complete!");
  console.log("Contract Address:", contractAddress);
  console.log("Start Time:", new Date(startTime * 1000).toLocaleString());
  console.log("End Time:", new Date(endTime * 1000).toLocaleString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
