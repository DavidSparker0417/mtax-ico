const mtaxIcoAbi = artifacts.require("MetaAxPresale");

module.exports = async function (deployer) {
  const mtaxIco = deployer.deploy(mtaxIcoAbi, "0x5334E7aA4089866a76D7CAA010b256b3CfC18aEF");
  console.log(mtaxIco);
  const contract = await mtaxIcoAbi.deployed();
  console.log(contract.mothods);
};
