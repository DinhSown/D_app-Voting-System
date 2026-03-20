const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Voting Contract", function () {
  let voting;
  let owner, voter1, voter2, voter3;
  let startTime, endTime;

  const candidates = ["Alice", "Bob", "Charlie"];

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const now = await time.latest();
    startTime = now + 10;
    endTime = now + 3600;

    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(candidates, startTime, endTime);
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize candidates correctly", async function () {
      expect(await voting.candidatesCount()).to.equal(3);
      const [id, name, count] = await voting.getCandidate(1);
      expect(name).to.equal("Alice");
      expect(count).to.equal(0);
    });

    it("Should not be started initially", async function () {
      expect(await voting.votingStarted()).to.equal(false);
    });
  });

  describe("Start Voting", function () {
    it("Should allow owner to start voting", async function () {
      await voting.startVoting();
      expect(await voting.votingStarted()).to.equal(true);
    });

    it("Should reject non-owner starting voting", async function () {
      await expect(voting.connect(voter1).startVoting())
        .to.be.revertedWith("Only owner can call this");
    });

    it("Should not allow double start", async function () {
      await voting.startVoting();
      await expect(voting.startVoting()).to.be.revertedWith("Voting already started");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await voting.startVoting();
      await time.increaseTo(startTime + 1);
    });

    it("Should allow a valid vote", async function () {
      await expect(voting.connect(voter1).vote(1))
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1);

      const [, , count] = await voting.getCandidate(1);
      expect(count).to.equal(1);
    });

    it("Should reject double voting", async function () {
      await voting.connect(voter1).vote(1);
      await expect(voting.connect(voter1).vote(1))
        .to.be.revertedWith("You have already voted");
    });

    it("Should reject vote for invalid candidate", async function () {
      await expect(voting.connect(voter1).vote(99))
        .to.be.revertedWith("Invalid candidate");
    });

    it("Should reject vote before voting starts (time)", async function () {
      const now2 = await time.latest();
      const s2 = now2 + 3600;
      const e2 = now2 + 7200;
      const Voting = await ethers.getContractFactory("Voting");
      const v2 = await Voting.deploy(candidates, s2, e2);
      await v2.waitForDeployment();
      await v2.startVoting();
      await expect(v2.connect(voter1).vote(1)).to.be.revertedWith("Outside voting time");
    });

    it("Should reject vote when voting not started", async function () {
      const now2 = await time.latest();
      const Voting = await ethers.getContractFactory("Voting");
      const v2 = await Voting.deploy(candidates, now2 + 10, now2 + 3600);
      await v2.waitForDeployment();
      await time.increaseTo(now2 + 11);
      await expect(v2.connect(voter1).vote(1)).to.be.revertedWith("Voting is not active");
    });

    it("Should reject vote after voting ends", async function () {
      await voting.connect(voter1).vote(1);
      await voting.endVoting();
      await expect(voting.connect(voter2).vote(2))
        .to.be.revertedWith("Voting is not active");
    });

    it("Should track hasVoted correctly", async function () {
      expect(await voting.hasAddressVoted(voter1.address)).to.equal(false);
      await voting.connect(voter1).vote(1);
      expect(await voting.hasAddressVoted(voter1.address)).to.equal(true);
    });
  });

  describe("End Voting", function () {
    it("Should allow owner to end voting", async function () {
      await voting.startVoting();
      await voting.endVoting();
      expect(await voting.votingEnded()).to.equal(true);
    });

    it("Should reject non-owner ending voting", async function () {
      await voting.startVoting();
      await expect(voting.connect(voter1).endVoting())
        .to.be.revertedWith("Only owner can call this");
    });
  });

  describe("Get Results", function () {
    beforeEach(async function () {
      await voting.startVoting();
      await time.increaseTo(startTime + 1);
      await voting.connect(voter1).vote(1);
      await voting.connect(voter2).vote(1);
      await voting.connect(voter3).vote(2);
    });

    it("Should return all candidates with correct vote counts", async function () {
      const all = await voting.getAllCandidates();
      expect(all[0].voteCount).to.equal(2); // Alice: 2
      expect(all[1].voteCount).to.equal(1); // Bob: 1
      expect(all[2].voteCount).to.equal(0); // Charlie: 0
    });

    it("Should return correct voting status", async function () {
      const [started, ended, , , totalVotes] = await voting.getVotingStatus();
      expect(started).to.equal(true);
      expect(ended).to.equal(false);
      expect(totalVotes).to.equal(3);
    });
  });
});
