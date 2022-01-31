const DappToken = artifacts.require("./DappToken.sol");
const DappTokenSale = artifacts.require("./DappTokenSale.sol");

contract("DappTokenSale", (accounts) => {
  let tokenInstance, tokenSaleInstance;
  const tokenPrice = 1000000000000000; // 1 Finney (in Wei)
  const tokenAvailable = 750000;
  const admin = accounts[0];
  const buyer = accounts[1];
  const numberOfTokens = 10;

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

  it("Facilitates token buying  ", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;

        return tokenInstance.transfer(
          tokenSaleInstance.address,
          tokenAvailable,
          { from: admin }
        );
      })
      .then((receipt) => {
        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: numberOfTokens * tokenPrice
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "Trigger one event");
        assert.equal(receipt.logs[0].event, "Sell", "Should be Sell event");
        assert.equal(receipt.logs[0].args._buyer, buyer, "Success");
        assert.equal(receipt.logs[0].args._amount, numberOfTokens, "Success");

        return tokenSaleInstance.tokensSold();
      })
      .then((amount) => {
        assert.equal(
          amount.toNumber(),
          numberOfTokens,
          "Increments the number of tokens sold"
        );

        return tokenInstance.balanceOf(buyer);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), numberOfTokens);

        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), tokenAvailable - numberOfTokens);

        return tokenSaleInstance.buyTokens(numberOfTokens, {
          from: buyer,
          value: 1
        });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(
          err.message.indexOf("revert") >= 0,
          "msg.value must be equal of tokens in wei"
        );
        return tokenSaleInstance.buyTokens(800000, {
          from: buyer,
          value: numberOfTokens * tokenPrice
        });
      })
      .then(assert.fail)
      .catch(async (err) => {
        assert(
          err.message.indexOf("revert") >= 0,
          "can not purchase more tokens than available"
        );
      });
  });

  it("End token sale", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return DappTokenSale.deployed();
      })
      .then((instance) => {
        tokenSaleInstance = instance;
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.indexOf("revert") >= 0, "must be admin to end sale");
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then((receipt) => {
        return tokenInstance.balanceOf(admin);
      })
      .then(async (balance) => {
        assert.equal(
          balance.toNumber(),
          999990,
          "returns all unsold dapp tokens to admin"
        );

        const tokenSaleBalance = await web3.eth.getBalance(
          tokenSaleInstance.address
        );
        assert.equal(tokenSaleBalance, 0);
      });
  });
});
