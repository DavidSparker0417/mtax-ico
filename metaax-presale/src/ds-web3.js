import {ethers} from 'ethers';
import Web3 from 'web3';
import BN from 'bignumber.js';
import HDWalletProvider from '@truffle/hdwallet-provider';

/***************************************/
/*          wallet functions           */
/***************************************/
export async function conntectWalletInjected(chainId) {
  if (!window.ethereum)
      return null;
  try {
    const strChainId = '0x' + chainId.toString(16);
    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: strChainId }],
    });
    const[account] = await window.ethereum.request({method: 'eth_requestAccounts'});
    return account;
  } catch (err) {
      alert(err.message);
  }
  return null;
}

export async function walletGetActiveNet() {
  if (!window.ethereum)
  {
      alert("Metamask is not installed.")
      return null;
  }
}

export function walletGetTrimedAccountName(account) {
  return account.substr(2,4) + '...' + account.substr(-4, 4);
}

/***************************************/
/*          ethers web3 functions      */
/***************************************/
// get web3 provider
export function ethersGetWeb3Provider() {
  if (!window.ethereum)
  {
      alert("Metamask is not installed.")
      return null;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  return provider;
}

// get contract object 
export function ethersGetContract(addr, abi, isTrReq) {
  if (!window.ethereum)
  {
      alert("Metamask is not installed.")
      return;
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  let contract;
  if (isTrReq === true)
  {
      const signer = provider.getSigner();
      contract = new ethers.Contract(addr, abi, signer);
  } else {
      contract = new ethers.Contract(addr, abi, provider);
  }
  return contract;
}

/***************************************/
/*          web3.js  functions         */
/***************************************/
export function web3GetSignedContract(chainId, privateKey, contractAbi, contractAddr) {
  const provider = new HDWalletProvider(privateKey, chainId);
  const web3 = new Web3(provider);
  const contract = new web3.eth.Contract(contractAbi, contractAddr);
  return contract;
}

/**
 * Get web3 from provider
 * @param rpc provider
 * @returns web3
 */
export function web3Get(provider) {
  let web3;
  if (typeof provider === 'undefined')
    web3 = new Web3(window.web3.currentProvider);
  else
    web3 = new Web3(provider);
  return web3;
}

// get web3 contract
export function web3GetContract(provider, address, abi) {
  const web3 = web3Get(provider)
  const contract = new web3.eth.Contract(abi, address);
  return contract;
}

// get current account of metamask
export async function web3GetCurrentAccount() {
  const web3 = new Web3(window.web3.currentProvider);
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

/***************************************/
/*       bignumber  functions          */
/***************************************/
export const DECIMAL_DEFAULT = 18;
function getEthUnit(accuracy)
{
  let mapping = Web3.utils.unitMap;
  let valuePrecision = "";
  for (var i = 0; i < accuracy; i++) {
    valuePrecision = valuePrecision + "0";
  }
  let unitMapValue = 1 + valuePrecision;

  for (const key in mapping) {
    if (mapping[key] === unitMapValue) {
      return key;
    }
  }
  return null;
}

export function weiToEth(wei, decimals, precision) {
  let ethVal;
  if (typeof decimals === 'undefined')
    ethVal = Web3.utils.fromWei(wei, 'ether');
  else if (typeof decimals === 'string') {
    ethVal = Web3.utils.fromWei(wei, decimals);
  }
  else
  {
    const unitEth = getEthUnit(decimals);
    ethVal = Web3.utils.fromWei(wei, unitEth);
  }

  const v = parseFloat(ethVal);
  if (typeof precision == 'undefined') {
    if (v < 1)
      precision = 8;
    else
      precision = 4;
  }

  ethVal = v.toFixed(precision).replace(/\.?0*$/,'');
  return parseFloat(ethVal);
}

export function ethToWei(eth, decimals) {
  let weiVal;

  if (typeof eth === 'undefined')
    return 0;

  if (typeof decimals === 'undefined') {
    weiVal = Web3.utils.toWei(parseFloat(eth).toFixed(18), 'ether');
  }
  else
  {
    const unitEth = getEthUnit(decimals);
    weiVal = Web3.utils.toWei(parseFloat(eth).toFixed(decimals), unitEth);
  }

  return weiVal;
}
