const DappToken = artifacts.require("./DappToken.sol");

contract("DappToken", (accounts) => {
  let tokenInstance, fromAccount, toAccount, spendingAccount;

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
          "Should be Approval event"
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

  it("Handles delegated token transfer", () => {
    return DappToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then((receipt) => {
        return tokenInstance.approve(spendingAccount, 10, {
          from: fromAccount
        });
      })
      .then((receipt) => {
        return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
          from: spendingAccount
        });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.indexOf("revert") >= 0, "Can not transfer value");
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, {
          from: spendingAccount
        });
      })
      .then(assert.fail)
      .catch((err) => {
        assert(err.message.indexOf("revert") >= 0, "Can not transfer value");
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {
          from: spendingAccount
        });
      })
      .then((success) => {
        assert.equal(success, true, "Success");
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, {
          from: spendingAccount
        });
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "Trigger one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "Should be Transfer event"
        );
        assert.equal(receipt.logs[0].args._from, fromAccount, "Success");
        assert.equal(receipt.logs[0].args._to, toAccount, "Success");
        assert.equal(receipt.logs[0].args._value, 10, "Success");

        return tokenInstance.balanceOf(fromAccount);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 90, "Success");
        return tokenInstance.balanceOf(toAccount);
      })
      .then((balance) => {
        assert.equal(balance.toNumber(), 10, "Success");
        return tokenInstance.allowance(fromAccount, spendingAccount);
      })
      .then((allowance) => {
        assert.equal(allowance, 0, "Success");
      });
  });
});
