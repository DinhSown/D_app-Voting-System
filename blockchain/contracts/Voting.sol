// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    address public owner;
    bool public votingStarted;
    bool public votingEnded;
    uint public startTime;
    uint public endTime;

    mapping(address => bool) public hasVoted;
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event Voted(address indexed voter, uint indexed candidateId);
    event VotingStarted(uint startTime);
    event VotingEnded(uint endTime);
    event CandidateAdded(uint id, string name);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier votingActive() {
        require(votingStarted && !votingEnded, "Voting is not active");
        require(block.timestamp >= startTime && block.timestamp <= endTime, "Outside voting time");
        _;
    }

    constructor(string[] memory _candidateNames, uint _startTime, uint _endTime) {
        require(_startTime < _endTime, "Invalid time range");
        require(_candidateNames.length > 0, "Need at least one candidate");

        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;

        for (uint i = 0; i < _candidateNames.length; i++) {
            candidatesCount++;
            candidates[candidatesCount] = Candidate(candidatesCount, _candidateNames[i], 0);
            emit CandidateAdded(candidatesCount, _candidateNames[i]);
        }
    }

    function startVoting() external onlyOwner {
        require(!votingStarted, "Voting already started");
        votingStarted = true;
        emit VotingStarted(block.timestamp);
    }

    function vote(uint candidateId) external votingActive {
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;

        emit Voted(msg.sender, candidateId);
    }

    function endVoting() external onlyOwner {
        require(votingStarted, "Voting hasn't started");
        require(!votingEnded, "Voting already ended");
        votingEnded = true;
        emit VotingEnded(block.timestamp);
    }

    function getCandidate(uint id) external view returns (uint, string memory, uint) {
        require(id > 0 && id <= candidatesCount, "Invalid candidate");
        Candidate memory c = candidates[id];
        return (c.id, c.name, c.voteCount);
    }

    function getAllCandidates() external view returns (Candidate[] memory) {
        Candidate[] memory all = new Candidate[](candidatesCount);
        for (uint i = 1; i <= candidatesCount; i++) {
            all[i - 1] = candidates[i];
        }
        return all;
    }

    function hasAddressVoted(address user) external view returns (bool) {
        return hasVoted[user];
    }

    function getVotingStatus() external view returns (
        bool _started,
        bool _ended,
        uint _startTime,
        uint _endTime,
        uint _totalVotes
    ) {
        uint total = 0;
        for (uint i = 1; i <= candidatesCount; i++) {
            total += candidates[i].voteCount;
        }
        return (votingStarted, votingEnded, startTime, endTime, total);
    }
}
