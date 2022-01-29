const DappTokenSale = artifacts.require("../contracts/DappTokenSale.sol");

contract("DappTokenSale", (accounts) => {
  let tokenSaleInstance;
  const tokenPrice = 1000000000000000; // 1 Finney (in Wei)

  it("Initializes the contract with the correct values", () => {
    return DappTokenSale.deployed()
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.address;
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "Initial Success.");
        return tokenSaleInstance.tokenContract();
      })
      .then((address) => {
        assert.notEqual(address, 0x0, "has token contract address");
        return tokenSaleInstance.tokenPrice();
      })
      .then((price) => {
        assert.equal(price, tokenPrice, "Success");
      });
  });
});
