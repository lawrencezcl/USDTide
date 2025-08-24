// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockKAIA
 * @dev Mock KAIA token for testing USDTide on Kaia testnet
 * @notice This is a test token with 18 decimals to match real KAIA
 */
contract MockKAIA is ERC20, Ownable {
    constructor() ERC20("Mock KAIA", "mKAIA") Ownable(msg.sender) {
        // Mint 1 million KAIA for testing
        _mint(msg.sender, 1000000 * 10**18);
    }

    /**
     * @dev Mint tokens to any address (for testing purposes)
     * @param to Address to mint tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Faucet function - anyone can get 100 KAIA for testing
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 1000 * 10**18, "Already have enough tokens");
        _mint(msg.sender, 100 * 10**18);
    }

    /**
     * @dev Burn tokens from sender
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}