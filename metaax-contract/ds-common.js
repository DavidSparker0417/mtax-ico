const Web3 = require('web3')

function getWeb3(url) {
  const web3 = new Web3(new Web3.providers.HttpProvider(url))
  return web3
}
async function sendTransaction(web3, privateKey, transaction) {
  const account = web3.eth.accounts.privateKeyToAccount(privateKey).address
  // console.log(transaction)
  const gasPrice = await web3.eth.getGasPrice()
  const options = {
    to: transaction._parent._address,
    data: transaction.encodeABI(),
    gas: await transaction.estimateGas({from:account}),
    gasPrice: gasPrice
  }
  const signed = await web3.eth.accounts.signTransaction(options, privateKey)
  await web3.eth.sendSignedTransaction(signed.rawTransaction)
}

function readContractAddressFromFile(path) {
  const fs = require('fs')
  const rawdata = fs.readFileSync(path)
  const contractAddresses = JSON.parse(rawdata)
  return contractAddresses
}

function writeContractAddressToFile(path, addresses) {
  const fs = require('fs')
  const rawdata = JSON.stringify(addresses, null, 2)
  fs.writeFileSync(path, rawdata)
}

module.exports = {
  sendTransaction             : sendTransaction,
  getWeb3                     : getWeb3,
  readContractAddressFromFile : readContractAddressFromFile,
  writeContractAddressToFile  : writeContractAddressToFile
}