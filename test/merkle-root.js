const { expect } = require("chai");
const { ethers } = require("hardhat");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

function encodeLeaf(address, maxNumOfNft) {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["address", "uint64"],
    [address, maxNumOfNft]
  );
}

describe("Merkle Trees", function () {
  it("Should be able to verify if address is in whitelist or not", async function () {
    const testAddresses = await ethers.getSigners();

    const list = [
      encodeLeaf(testAddresses[0].address, 2),
      encodeLeaf(testAddresses[1].address, 2),
      encodeLeaf(testAddresses[2].address, 2),
      encodeLeaf(testAddresses[3].address, 2),
      encodeLeaf(testAddresses[4].address, 2),
      encodeLeaf(testAddresses[5].address, 2),
    ];
    
    // The lines of code you're referring to are creating a new instance of a Merkle Tree
    const merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true,
      sortPairs: true,
      sortLeaves: true,
    });

    const root = merkleTree.getHexRoot();

    const Whitelist = await ethers.getContractFactory("Whitelist");
    const whitelist = await Whitelist.deploy(root);
    await whitelist.waitForDeployment();

    for (let i = 0; i < 6; i++) {
      const leaf = keccak256(list[i]);//taking hash of every encoded content
      const proof = merkleTree.getHexProof(leaf);
      const connectedWhitelist = whitelist.connect(testAddresses[i]);

      const verified = await connectedWhitelist.checkInWhitelist(proof, 2);
      expect(verified).to.equal(true);
    }
    const verifiedInvalid = await whitelist.checkInWhitelist([], 2);
    expect(verifiedInvalid).to.equal(false);
  });
});

/**
 * Inside the function, these two arguments are encoded together into a binary string. The encoding is done using the ethers.utils.defaultAbiCoder.encode() function. This function takes two arguments: an array of data types and an array of corresponding values.

The first argument is ["address", "uint64"], which denotes that we are encoding an Ethereum address and a 64-bit unsigned integer.
The second argument is [address, maxNumOfNft], which are the actual values to be encoded.
The encode() function returns a binary string that represents the encoded address and maxNumOfNft. This binary string is then hashed using the keccak256 function to create a unique identifier for the leaf node in the Merkle tree.

** "encodeLeaf()": returns something like this: '0x0000000000000000000000009965507d1a55bcc2695c58ba16fb37d819b0a4dc0000000000000000000000000000000000000000000000000000000000000002'

** Merkle Tree instance:
  hashLeaves: true specifies that the leaf nodes should be hashed. In your case, since you're already providing hashed leaf nodes, this property might not be necessary.

  sortPairs: true specifies that sibling pairs should be sorted before they're hashed together. This is necessary to ensure that the Merkle Tree is deterministic, meaning it will always produce the same root for the same set of inputs, regardless of their order.

  sortLeaves: true specifies that the leaf nodes should be sorted before they're hashed. This is similar to sortPairs and helps ensure the Merkle Tree is deterministic.
 */