const DappToken = artifacts.require("../contracts/DappToken.sol");
const DappTokenSale = artifacts.require("../contracts/DappTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1000000).then(() => {
    const tokenPrice = 1000000000000000; // 1 Finney (in Wei)
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  });
};
