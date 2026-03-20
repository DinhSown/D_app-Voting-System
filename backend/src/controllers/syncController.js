const { pool } = require("../config/database");
const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// Record tx from frontend after vote
const recordTransaction = async (req, res) => {
  try {
    const { voting_id, wallet_address, candidate_blockchain_id, tx_hash } = req.body;

    if (!voting_id || !wallet_address || !candidate_blockchain_id) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM vote_transactions WHERE voting_id = ? AND wallet_address = ?",
      [voting_id, wallet_address.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: "This wallet has already voted" });
    }

    const [result] = await pool.query(
      `INSERT INTO vote_transactions (voting_id, wallet_address, candidate_blockchain_id, tx_hash, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [voting_id, wallet_address.toLowerCase(), candidate_blockchain_id, tx_hash]
    );

    // Async verify tx
    verifyTxAsync(result.insertId, tx_hash, voting_id, wallet_address, candidate_blockchain_id);

    res.status(201).json({ success: true, message: "Transaction recorded", id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "This wallet has already voted" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

async function verifyTxAsync(dbId, txHash, votingId, walletAddress, candidateId) {
  try {
    const configPath = path.join(__dirname, "../config/contractConfig.json");
    if (!fs.existsSync(configPath)) return;

    const config = JSON.parse(fs.readFileSync(configPath));
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

    const receipt = await provider.waitForTransaction(txHash, 1, 30000);
    if (receipt && receipt.status === 1) {
      await pool.query(
        "UPDATE vote_transactions SET status='confirmed', block_number=? WHERE id=?",
        [receipt.blockNumber, dbId]
      );
    } else {
      await pool.query("UPDATE vote_transactions SET status='failed' WHERE id=?", [dbId]);
    }
  } catch (err) {
    console.error("Tx verify error:", err.message);
  }
}

// Sync events from blockchain
const syncVoting = async (req, res) => {
  try {
    const { votingId } = req.params;
    const [votings] = await pool.query("SELECT * FROM votings WHERE id = ?", [votingId]);
    if (votings.length === 0) return res.status(404).json({ success: false, message: "Voting not found" });

    const voting = votings[0];
    if (!voting.contract_address) {
      return res.status(400).json({ success: false, message: "No contract address for this voting" });
    }

    const configPath = path.join(__dirname, "../config/contractConfig.json");
    if (!fs.existsSync(configPath)) {
      return res.status(400).json({ success: false, message: "Contract config not found. Deploy contract first." });
    }

    const config = JSON.parse(fs.readFileSync(configPath));
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");
    const contract = new ethers.Contract(voting.contract_address, config.abi, provider);

    const [syncLog] = await pool.query(
      "SELECT * FROM sync_logs WHERE contract_address = ?",
      [voting.contract_address]
    );

    const fromBlock = syncLog.length > 0 ? Number(syncLog[0].last_synced_block) + 1 : 0;
    const currentBlock = await provider.getBlockNumber();

    const events = await contract.queryFilter("Voted", fromBlock, currentBlock);
    let synced = 0;

    for (const event of events) {
      const voter = event.args.voter.toLowerCase();
      const candidateId = Number(event.args.candidateId);
      const txHash = event.transactionHash;
      const blockNumber = event.blockNumber;

      try {
        await pool.query(
          `INSERT IGNORE INTO vote_transactions
           (voting_id, wallet_address, candidate_blockchain_id, tx_hash, block_number, status)
           VALUES (?, ?, ?, ?, ?, 'confirmed')
           ON DUPLICATE KEY UPDATE status='confirmed', block_number=?, tx_hash=?`,
          [votingId, voter, candidateId, txHash, blockNumber, blockNumber, txHash]
        );
        synced++;
      } catch (e) { /* skip duplicates */ }
    }

    // Update sync log
    if (syncLog.length === 0) {
      await pool.query(
        "INSERT INTO sync_logs (contract_address, last_synced_block, status, message) VALUES (?, ?, 'success', ?)",
        [voting.contract_address, currentBlock, `Synced ${synced} events`]
      );
    } else {
      await pool.query(
        "UPDATE sync_logs SET last_synced_block=?, status='success', message=? WHERE contract_address=?",
        [currentBlock, `Synced ${synced} events`, voting.contract_address]
      );
    }

    res.json({ success: true, message: `Synced ${synced} events`, current_block: currentBlock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { recordTransaction, syncVoting };
