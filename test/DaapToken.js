const DappToken = artifacts.require("../contracts/DappToken.sol");

contract("DappToken", () => {
  it("Sets the total supply upon deployment", () => {
    return DappToken.deployed()
      .then((instance) => {
        const tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(totalSupply.toNumber(), 1000000, "Success");
      });
  });
});
