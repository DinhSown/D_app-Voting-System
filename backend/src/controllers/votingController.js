const { pool } = require("../config/database");

const createVoting = async (req, res) => {
  try {
    const { title, description, contract_address, start_time, end_time } = req.body;
    if (!title || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: "title, start_time, end_time are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO votings (title, description, contract_address, start_time, end_time, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
      [title, description, contract_address, start_time, end_time, req.admin.id]
    );

    const [rows] = await pool.query("SELECT * FROM votings WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, voting: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllVotings = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, a.username as creator_name,
        (SELECT COUNT(*) FROM candidates WHERE voting_id = v.id) as candidate_count,
        (SELECT COUNT(*) FROM vote_transactions WHERE voting_id = v.id AND status = 'confirmed') as total_votes
       FROM votings v
       LEFT JOIN admins a ON v.created_by = a.id
       ORDER BY v.created_at DESC`
    );
    res.json({ success: true, votings: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getVoting = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT v.*, a.username as creator_name FROM votings v
       LEFT JOIN admins a ON v.created_by = a.id
       WHERE v.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Voting not found" });

    const [candidates] = await pool.query(
      "SELECT * FROM candidates WHERE voting_id = ? ORDER BY blockchain_candidate_id ASC",
      [id]
    );

    res.json({ success: true, voting: rows[0], candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateVoting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, contract_address, start_time, end_time, status } = req.body;

    await pool.query(
      `UPDATE votings SET title=COALESCE(?,title), description=COALESCE(?,description),
       contract_address=COALESCE(?,contract_address), start_time=COALESCE(?,start_time),
       end_time=COALESCE(?,end_time), status=COALESCE(?,status) WHERE id=?`,
      [title, description, contract_address, start_time, end_time, status, id]
    );

    const [rows] = await pool.query("SELECT * FROM votings WHERE id = ?", [id]);
    res.json({ success: true, voting: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteVoting = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM votings WHERE id = ?", [id]);
    res.json({ success: true, message: "Voting deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getResults = async (req, res) => {
  try {
    const { id } = req.params;
    const [voting] = await pool.query("SELECT * FROM votings WHERE id = ?", [id]);
    if (voting.length === 0) return res.status(404).json({ success: false, message: "Voting not found" });

    const [candidates] = await pool.query(
      "SELECT * FROM candidates WHERE voting_id = ? ORDER BY blockchain_candidate_id ASC",
      [id]
    );

    const [txStats] = await pool.query(
      `SELECT candidate_blockchain_id, COUNT(*) as vote_count
       FROM vote_transactions WHERE voting_id = ? AND status = 'confirmed'
       GROUP BY candidate_blockchain_id`,
      [id]
    );

    const txMap = {};
    txStats.forEach(t => { txMap[t.candidate_blockchain_id] = t.vote_count; });

    const results = candidates.map(c => ({
      ...c,
      db_vote_count: txMap[c.blockchain_candidate_id] || 0
    }));

    const total = results.reduce((s, c) => s + parseInt(c.db_vote_count), 0);

    res.json({ success: true, voting: voting[0], results, total_votes: total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const [txs] = await pool.query(
      `SELECT vt.*, c.candidate_name FROM vote_transactions vt
       LEFT JOIN candidates c ON vt.candidate_blockchain_id = c.blockchain_candidate_id AND c.voting_id = vt.voting_id
       WHERE vt.voting_id = ? ORDER BY vt.created_at DESC LIMIT ? OFFSET ?`,
      [id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM vote_transactions WHERE voting_id = ?", [id]
    );

    res.json({ success: true, transactions: txs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createVoting, getAllVotings, getVoting, updateVoting, deleteVoting, getResults, getTransactions };
