const { pool } = require("../config/database");

const addCandidate = async (req, res) => {
  try {
    const { id: voting_id } = req.params;
    const { candidate_name, candidate_description, image_url, blockchain_candidate_id } = req.body;

    if (!candidate_name) {
      return res.status(400).json({ success: false, message: "candidate_name is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO candidates (voting_id, candidate_name, candidate_description, image_url, blockchain_candidate_id)
       VALUES (?, ?, ?, ?, ?)`,
      [voting_id, candidate_name, candidate_description, image_url, blockchain_candidate_id]
    );

    const [rows] = await pool.query("SELECT * FROM candidates WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, candidate: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCandidates = async (req, res) => {
  try {
    const { id: voting_id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM candidates WHERE voting_id = ? ORDER BY blockchain_candidate_id ASC",
      [voting_id]
    );
    res.json({ success: true, candidates: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { candidate_name, candidate_description, image_url } = req.body;

    await pool.query(
      `UPDATE candidates SET
       candidate_name=COALESCE(?,candidate_name),
       candidate_description=COALESCE(?,candidate_description),
       image_url=COALESCE(?,image_url)
       WHERE id=?`,
      [candidate_name, candidate_description, image_url, candidateId]
    );

    const [rows] = await pool.query("SELECT * FROM candidates WHERE id = ?", [candidateId]);
    res.json({ success: true, candidate: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    await pool.query("DELETE FROM candidates WHERE id = ?", [candidateId]);
    res.json({ success: true, message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { addCandidate, getCandidates, updateCandidate, deleteCandidate };
