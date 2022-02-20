const mtaxIco = artifacts.require("MetaAxPresale");
const {readContractAddressFromFile, 
  writeContractAddressToFile} = require('../ds-common')
const adrJsonFile = './mtax-contracts.json'

module.exports = async function (deployer) {
  const adrs = readContractAddressFromFile(adrJsonFile)
  await deployer.deploy(mtaxIco, adrs.mtax);
  const contract = await mtaxIco.deployed();
  console.log("======== contract ========== ", contract.address);
  adrs.ico = contract.address
  writeContractAddressToFile(adrJsonFile, adrs)
};
