require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config({ path: "../.env" });

const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        hardhat: {
            chainId: 31337
        },
        mumbai: {
            url: "https://rpc-mumbai.maticvigil.com",
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
            chainId: 80001,
            gasPrice: 35000000000, // 35 gwei
            gas: 2100000
        }
    },
    etherscan: {
        apiKey: {
            polygonMumbai: POLYGONSCAN_API_KEY
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};
