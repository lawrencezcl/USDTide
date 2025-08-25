// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing USDTide on Kaia testnet
 * @notice This is a test token with 6 decimals to match real USDT
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6;

    constructor() ERC20("Mock USDT", "mUSDT") Ownable(msg.sender) {
        // Mint 1 million USDT for testing
        _mint(msg.sender, 1000000 * 10**_decimals);
    }

    /**
     * @dev Returns the number of decimals used to get its user representation
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
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
     * @dev Faucet function - anyone can get 1000 USDT for testing
     */
    function faucet() external {
        require(balanceOf(msg.sender) < 10000 * 10**_decimals, "Already have enough tokens");
        _mint(msg.sender, 1000 * 10**_decimals);
    }

    /**
     * @dev Burn tokens from sender
     * @param amount Amount to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}