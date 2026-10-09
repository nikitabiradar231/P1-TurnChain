// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Script.sol";
import "../contracts/TurnChain.sol";

contract DeployTurnChain is Script {
    function run() external returns (TurnChain turnChain) {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80) // Anvil default #0
        );

        vm.startBroadcast(deployerPrivateKey);
        turnChain = new TurnChain();
        vm.stopBroadcast();

        console.log("TurnChain deployed at:", address(turnChain));
        console.log("Chain ID:", block.chainid);
    }
}
