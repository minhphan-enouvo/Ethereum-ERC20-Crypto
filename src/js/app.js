App = {
  web3Provider: null,

  init: function () {
    console.log("init....");
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== undefined) {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
  },

  initContracts: function () {
    $.getJSON("DappTokenSale.json", function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then((instance) => {
        console.log("Dapp token sale address", instance.address);
      });
    });
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
