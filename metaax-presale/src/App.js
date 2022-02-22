import './css/App.css';
import './css/input.scss';
import './css/button.scss';
import MainTitle from './components/MainTitle';
import PresaleState from "./components/PresaleState"
import BalanceStateCard from './components/BalanceStateCard';
import AddLiquidity from './components/AddLiquidity';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet } from 'use-wallet';
import { mtaxGetPresaleState } from './components/ContractInterface';
import { truncateDecimals } from './dslib/ds-utils';
import { dsBnWeiToEth } from './dslib/ds-web3';

const REFRESH_INTERVAL = 1000;
const brandIcon = 'images/brand.png';

function App() {
  // wallet
  const wallet = useWallet();
  // refresh timer
  const refreshTimer = useRef();
  // presale info
  const [presaleInfo, setPresaleInfo] = useState({
    remaining: 0,
    investorCount: 0,
    amountLimit: 0,
    curPrice: 0,
    stakedMtax: 0,
    stakedBNB: 0,
    stakedLP: 0,
    spentBonus: 0
  })
  // user's personal pre-staking info
  const [userInfo, setUserInfo] = useState({
    balance: 0,
    amount: 0,
    bnb: 0,
    lp: 0,
    reservedAmount:0,
    reservedLP:0,
    lockout:0
  })
  // price info
  const [priceInfo, setPriceInfo] = useState({
    publish : 0,
    current : 0,
    discount : 0,
    discountL: 0,
    discountH: 0,
  })
  // lockout policy
  const [lockPolicy, setLockPolicy] = useState({
    lockL : 0,
    lockM : 0,
    lockH : 0,
  })

  // refresh function
  const refresh = useCallback(async () => {
    // get presale state
    const state = await mtaxGetPresaleState(wallet.account);
    if (typeof state === 'undefined')
      return
    // refresh presale info
    setPresaleInfo(state.icoStat);
    // refresh user info
    setUserInfo(t => {
      return {
        balance: t.balance,
        ...state.userStat
      }
    })
    // refresh price info 
    setPriceInfo({
      publish : state.pricePolicy.publish,
      current : truncateDecimals(state.icoStat.curPrice, 6),
      discount : state.pricePolicy.discount,
      discountL: state.pricePolicy.discountL,
      discountH: state.pricePolicy.discountH,
    })
    //refresh lockout policy
    setLockPolicy(state.lockPolicy)
  }, [wallet.account]);

  // refresh page every a certain period
  useEffect(() => {
    console.log("+++++++++++ Initial Loading ++++++++++++");
    let ac = new AbortController();

    const callRefresh = async () => {
      refresh().then(() => {
        if (ac.signal.aborted === false) {
          setTimeout(() => callRefresh(), REFRESH_INTERVAL);
        }
      })
    }

    callRefresh();
    return () => ac.abort();
  }, [refresh])

  // wallet balance event
  useEffect(() => {
    setUserInfo(t => {
      return {
        ...t,
        balance: dsBnWeiToEth(wallet.balance)
      }
    })
  }, [wallet.balance])

  return (
    <div className="App">
      <MainTitle
        brandIcon={brandIcon}
        brandText="MetaAX"
        title="Welcome to MTAX Pre-Staking"
      />
      {/* <div style={{margin:"1rem"}}>
        <h2>email : davidsparker0417@gmail.com</h2>
        <h2>skype : live:.cid.f984759a1d2ace21</h2>
        <h2>Telegram : @DavidSparker</h2>
      </div> */}
      <div className='container'>
        <div className="status-panel">
          <div className="presale-state">
            <PresaleState info={presaleInfo} />
          </div>
          <div className="balance-state">
            <BalanceStateCard info={userInfo} />
          </div>
        </div>
        <div className='liquidity-panel'>
          <AddLiquidity 
            priceInfo={priceInfo} 
            balance={userInfo.balance}
            timeRemain={presaleInfo.remainTime}
            lockPolicy={lockPolicy}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
