const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const { login, getProfile } = require("../controllers/adminController");
const { createVoting, getAllVotings, getVoting, updateVoting, deleteVoting, getResults, getTransactions } = require("../controllers/votingController");
const { addCandidate, getCandidates, updateCandidate, deleteCandidate } = require("../controllers/candidateController");
const { recordTransaction, syncVoting } = require("../controllers/syncController");

// Admin auth
router.post("/admin/login", login);
router.get("/admin/profile", authMiddleware, getProfile);

// Public voting routes
router.get("/votings", getAllVotings);
router.get("/votings/:id", getVoting);
router.get("/votings/:id/candidates", getCandidates);
router.get("/votings/:id/results", getResults);
router.get("/votings/:id/transactions", getTransactions);

// Admin-protected voting routes
router.post("/votings", authMiddleware, createVoting);
router.put("/votings/:id", authMiddleware, updateVoting);
router.delete("/votings/:id", authMiddleware, deleteVoting);

// Admin-protected candidate routes
router.post("/votings/:id/candidates", authMiddleware, addCandidate);
router.put("/candidates/:candidateId", authMiddleware, updateCandidate);
router.delete("/candidates/:candidateId", authMiddleware, deleteCandidate);

// Transaction record (public - called from frontend after voting)
router.post("/transactions", recordTransaction);

// Sync (admin only)
router.post("/sync/:votingId", authMiddleware, syncVoting);

module.exports = router;
