
const rpcNodes = {
  ether : {
    chainId : 1,
    url: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  },
  ropsten : {
    chainId : 3,
    url: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  },
  rinkeby : {
    chainId : 4,
    url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  },
  bsc : {
    chainId : 56,
    url: "https://bsc-dataseed1.ninicoin.io",
  },
  bsc_test : {
    chainId : 97,
    url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  },
  local : {
    chainId : 539,
    url : "http://localhost:8545",
  }
}

module.exports = {
  rpcNodes: rpcNodes,
  TARGET_NET : rpcNodes.bsc_test
}
