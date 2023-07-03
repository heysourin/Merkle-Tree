// SPDX-License-Identifier:MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Whitelist {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

/**
 * 
 * @param proof: Merkle proof
 * @param maxAllowanceToMint: maxAllowanceToMint is a variable that keeps track of the number of NFT's a given address can mint.
 */
    function checkInWhitelist(bytes32[] calldata proof, uint64 maxAllowanceToMint) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, maxAllowanceToMint));
        bool verified = MerkleProof.verify(proof, merkleRoot, leaf);
        return verified;
    }
}
/**
 * @note: We are not storing the address of each user in the contract, instead, we are only storing the root of the merkle tree which gets initialized in the constructor.
 * 
 * function 'checkInWhitelist()' which takes in a proof and maxAllowanceToMint. 'maxAllowanceToMint()' is a variable that keeps track of the number of NFT's a given address can mint.
 */