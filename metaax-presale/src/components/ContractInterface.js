import ico_abi from 'contracts/MetaAxPresale.json';
import mtax_abi from 'contracts/MetaAX.json';
import config from '../config.json';
import { truncateDecimals, toHumanizeFixed } from '../dslib/ds-utils';
import { 
  dsBnWeiToEth, 
  dsBnEthToWei,
  dsWeb3IsAddrValid,
  dsWeb3GetContract } from '../dslib/ds-web3';

export const TARGET_NET = config[config.target];
const MTAX_CONTRACT = config.contracts.mtax
const ICO_CONTRACT = config.contracts.ico

export function mtaxICOGetContract(provider) {
  const contract = dsWeb3GetContract(provider, ICO_CONTRACT, ico_abi.abi);
  return contract;
}

export async function mtaxDecimals() {
  const contract = dsWeb3GetContract(TARGET_NET.url, MTAX_CONTRACT, mtax_abi.abi);
  const decimals = await contract.methods.decimals().call();
  return parseInt(decimals);
}

/**
 * Get information of MTAX pre-staking
 * @param account wallet address of querying MTAX presale state  
 * @returns general state information of presale state
 */
export async function mtaxGetPresaleState(account) {
  const contract = mtaxICOGetContract(TARGET_NET.url)
  let state;

  try {
    if (typeof account === 'undefined' || account === null)
      state = await contract.methods.queryState().call();
    else
      state = await contract.methods.queryState().call({from:account});
  } catch (e) {
    return undefined
  }
  const decimals = await mtaxDecimals();
  return {
    icoStat : {
      remaining: state.prsStat.remaining,
      investorCount: state.prsStat.investorCount,
      amountLimit: dsBnWeiToEth(state.prsStat.amountLimit, decimals),
      curPrice: dsBnWeiToEth(state.prsStat.curPrice),
      stakedMtax: dsBnWeiToEth(state.prsStat.stakedMtax, decimals),
      stakedBNB: toHumanizeFixed(dsBnWeiToEth(state.prsStat.stakedBNB)),
      stakedLP: dsBnWeiToEth(state.prsStat.stakedLP),
      spentBonus: dsBnWeiToEth(state.prsStat.spentBonus)
    },
    userStat: {
      amount: dsBnWeiToEth(state.investor.amount, decimals),
      bnb: dsBnWeiToEth(state.investor.bnb),
      lp: dsBnWeiToEth(state.investor.lp),
      reservedAmount: dsBnWeiToEth(state.investor.reservedAmount),
      reservedLP: dsBnWeiToEth(state.investor.reservedLP),
      lockout: parseInt(state.investor.lockout)
    },
    pricePolicy: {
      publish: truncateDecimals(parseInt(state.price.publishN)/parseInt(state.price.publishD), 9),
      discount: parseFloat(state.price.discount),
      discountL: parseFloat(state.price.discountL),
      discountH: parseFloat(state.price.discountH),
    },
    lockPolicy: {
      lockL : parseInt(state.lockout.lockL),
      lockM : parseInt(state.lockout.lockM),
      lockH : parseInt(state.lockout.lockH),
    }
  }
}

/**
 * Add liquidity
 * @param bnbAmount Amount of BNB to add liquidity
 * @param tokenAmount Amount of MTAX token to add liquidity
 * @returns Amount of LP token or error string
 */
export async function mtaxAddLiquidity(provider, bnbAmount, tokenAmount, lockout, agent) {
  const contract = mtaxICOGetContract(provider);
  const decimals = await mtaxDecimals();
  const mtax = dsBnEthToWei(tokenAmount, decimals);
  // ask contract if is enable to add liquidity
  const abnb = (await contract.methods
    .lookupPreStake(mtax, lockout.toString()).call()).totalBnb;
  if (dsBnWeiToEth(abnb) === 0) {
    return undefined;
  }
  // add liquidity
  const agentAddress = dsWeb3IsAddrValid(agent) ? agent : "0x0000000000000000000000000000000000000000";
  contract.handleRevert = true;
  const gas = await contract.methods
    .requestPreStake(mtax, lockout, agentAddress)
    .estimateGas({from:provider.selectedAddress, value:abnb})
  const  transaction = contract.methods
    .requestPreStake(mtax, lockout, agentAddress)
    .send({
      from:provider.selectedAddress, 
      value:abnb,
      gas: gas
    })
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