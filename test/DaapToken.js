const DappToken = artifacts.require("../contracts/DappToken.sol");

contract("DappToken", (accounts) => {
  let tokenInstance;

  it("Initializes the contract with the correct values", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "Dapp Token", "Correct Name");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "DAPP", "Correct Symbol");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(standard, "Dapp Token v1.0", "Correct Standard");
      });
  });

  it("Sets the total supply upon deployment", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), 1000000, "Success");
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(adminBalance.toNumber(), 1000000, "Success");
      });
  });
});
