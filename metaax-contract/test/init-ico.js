const Web3 = require('web3')
const {
  getWeb3, 
  sendTransaction,
  readContractAddressFromFile} = require('../ds-common')
const fs = require('fs')
const {TARGET_NET} = require('../bc-net')
const web3 = getWeb3(TARGET_NET.url)
const privateKey = fs.readFileSync('.secret').toString().trim();
const adrs = readContractAddressFromFile('./mtax-contracts.json')
const mtaxAddress = adrs.mtax
const mtaxAbi = require('../build/contracts/IMetaAX.json')
const mtax = new web3.eth.Contract(mtaxAbi.abi, mtaxAddress)
const icoAddress = adrs.ico
const icoAbi = require('../build/contracts/MetaAxPresale.json')
const ico = new web3.eth.Contract(icoAbi.abi, icoAddress)

initICO()
async function initICO() {
  // transfer mtax token to ico
  const initialTokenForICO = Web3.utils.toWei("100000", 'nano')
  console.log(`Sending ${initialTokenForICO} to ico(${icoAddress}) ...`)
  try
  {
    const transaction = mtax.methods.transfer(icoAddress, initialTokenForICO)
    await sendTransaction(web3, privateKey, transaction)
    console.log("Sending initial token to ICO succeeded.")
  } catch (e) {
    console.log(e.message)
  }
  // set ico to exclude fee
  try
  {
    console.log("Setting ICO to exclude fee account...")
    const alreadyExcluede = await mtax.methods.isExcludedFromFee(icoAddress).call()
    if (alreadyExcluede == true)
      console.log("ICO is already excluded from fee.")
    else {
      const transaction = mtax.methods.excludeFromFee(icoAddress)
      await sendTransaction(web3, privateKey, transaction)
      console.log("Setting ICO to exclude fee account succeeded.")
    }
  } catch (e) {
    console.log(e.message)
  }
}
