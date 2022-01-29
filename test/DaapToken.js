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

  it("Transfers token ownership", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 999999999999);
      })
      .then(assert.fail)
      .catch((err) => {
        assert(
          err.message.indexOf("revert") >= 0,
          "error msg must contain revert"
        );

        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0]
        });
      })
      .then((success) => {
        assert.equal(success, true, "Success");
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0]
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "Trigger one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "Should be Transfer event"
        );
        assert.equal(receipt.logs[0].args._from, accounts[0], "Success");
        assert.equal(receipt.logs[0].args._to, accounts[1], "Success");
        assert.equal(receipt.logs[0].args._value, 250000, "Success");

        return tokenInstance.balanceOf(accounts[1]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          250000,
          "Add amount to the receiving account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((balance) => {
        assert.equal(
          balance.toNumber(),
          750000,
          "Deduct the amount from the sending account"
        );
      });
  });

  it("Approve tokens for delegated transfer", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then((success) => {
        assert.equal(success, true, "Success");
        return tokenInstance.approve(accounts[1], 100);
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "Trigger one event");
        assert.equal(
          receipt.logs[0].event,
          "Approval",
          "Should be Transfer event"
        );
        assert.equal(receipt.logs[0].args._owner, accounts[0], "Success");
        assert.equal(receipt.logs[0].args._spender, accounts[1], "Success");
        assert.equal(receipt.logs[0].args._value, 100, "Success");

        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then((allowance) => {
        assert.equal(
          allowance,
          100,
          "Stores the allowance for delegated transfer"
        );
      });
  });
});
