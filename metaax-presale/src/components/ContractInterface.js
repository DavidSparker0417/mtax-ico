import ico_abi from 'contracts/MetaAxPresale.json';
import mtax_abi from 'contracts/MetaAX.json';
import {DECIMAL_DEFAULT, ethToWei, web3GetContract, weiToEth} from '../ds-web3'
import { truncateDecimals } from 'utils';

export const RPC_NODES = {
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
  },
};

export const TARGET_NET = RPC_NODES.bsc_test;
const MTAX_CONTRACT = "0x5334E7aA4089866a76D7CAA010b256b3CfC18aEF";
const ICO_CONTRACT = "0x120309bd9472b87d14211220F5E6A3ddb48939c3";

export function mtaxICOGetContract(provider) {
  const contract = web3GetContract(provider, ICO_CONTRACT, ico_abi.abi);
  return contract;
}

export async function mtaxDecimals() {
  const contract = web3GetContract(TARGET_NET.url, MTAX_CONTRACT, mtax_abi.abi);
  const decimals = await contract.methods.decimals().call();
  return parseInt(decimals);
}

/**
 * Get information of MTAX pre-staking
 * @param account wallet address of querying MTAX presale state  
 * @returns general state information of presale state
 */
export async function mtaxGetPresaleState(account) {
  const contract = web3GetContract(TARGET_NET.url, ICO_CONTRACT, ico_abi.abi);
  const decimals = await mtaxDecimals();
  let state;

  if (typeof account === 'undefined' || account === null)
    state = await contract.methods.queryState().call();
  else
    state = await contract.methods.queryState().call({from:account});
  // console.log(state);
  return {
    preasleEndingTime : state.presaleRemainTime,
    totalInvestors    : state.totalInvestors,
    totalStatkedToken : weiToEth(state.totalStakedToken, decimals),
    totalSuppliedLp   : weiToEth(state.totalSuppliedLp, 'ether'),
    publishPrice      : truncateDecimals(parseInt(state.pubPriceN)/parseInt(state.pubPriceD), 4),
    currentPrice      : weiToEth(state.currentPrice),
    discountPercent   : state.discountPercent,
    userTokenAmount   : weiToEth(state.amount, decimals),
    userBnbAmount     : weiToEth(state.bnbAmount, 'ether'),
    userLp            : weiToEth(state.lp),
    userReservedLP    : weiToEth(state.reservedLP),
    userRemainTime    : parseInt(state.remainTime),
  }
}

/**
 * Add liquidity
 * @param bnbAmount Amount of BNB to add liquidity
 * @param tokenAmount Amount of MTAX token to add liquidity
 * @returns Amount of LP token or error string
 */
export async function mtaxAddLiquidity(provider, bnbAmount, tokenAmount, lockout) {
  const contract = mtaxICOGetContract(provider);
  const decimals = await mtaxDecimals();
  const mtax = ethToWei(tokenAmount, decimals);
  // ask contract if is enable to add liquidity
  const abnb = await contract.methods.lookupPreStake(mtax, lockout.toString()).call();
  if (abnb === 0) {
    return undefined;
  }

  // add liquidity
  const  transaction = contract.methods
    .requestPreStake(mtax, lockout)
    .send({from:provider.selectedAddress, value:abnb});
  return transaction;
}

/**
 * Reclaim to receive LP tokens
 */
export function mtaxReclaim(provider) {
  const contract = mtaxICOGetContract(provider);
  const transaction = contract.methods
    .withdrawLP()
    .send({from:provider.selectedAddress})
  
  return transaction;
}