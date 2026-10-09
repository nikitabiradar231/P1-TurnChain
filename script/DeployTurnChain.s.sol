// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Script.sol";
import "../contracts/TurnChain.sol";

contract DeployTurnChain is Script {
    function run() external returns (TurnChain turnChain) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        turnChain = new TurnChain();
        vm.stopBroadcast();

        console.log("TurnChain deployed successfully!");
        console.log("Contract Address:", address(turnChain));
        console.log("Chain ID:", block.chainid);
    }
}
