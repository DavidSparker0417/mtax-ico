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
import { DECIMAL_DEFAULT, weiToEth } from './ds-web3';
import { truncateDecimals } from 'utils';

const REFRESH_INTERVAL = 1000;
const brandIcon = 'images/brand.png';

function App() {
  // wallet
  const wallet = useWallet();
  // refresh timer
  const refreshTimer = useRef();
  // presale info
  const [presaleInfo, setPresaleInfo] = useState({
    remainTime: 0,
    investors: 0,
    stakedToken: 0,
    suppliedLP: 0,
  })
  // user's personal pre-staking info
  const [userInfo, setUserInfo] = useState({
    balance: 0,
    remainTime: 0,
    ownLP: 0,
    reservedLP: 0,
  })
  // price info
  const [priceInfo, setPriceInfo] = useState({
    publish : {
      mtaxPerBNB : 0,
      bnbPerMtax : 0,
    },
    current : {
      mtaxPerBNB : 0,
      bnbPerMtax : 0,
    },
    dicountRate : 0
  })

  // refresh function
  const refresh = useCallback(async () => {
    // get presale state
    const state = await mtaxGetPresaleState(wallet.account);
    // console.log(state);

    // refresh presale info
    setPresaleInfo({
      remainTime: state.preasleEndingTime,
      investors: state.totalInvestors,
      stakedToken: state.totalStatkedToken,
      suppliedLP: state.totalSuppliedLp,
    });

    // refresh user info
    setUserInfo(t => {
      return {
        ...t,
        remainTime  : state.userRemainTime,
        ownLP       : state.userLp,
        reservedLP  : state.userReservedLP
      }
    })

    // refresh price info 
    setPriceInfo({
      publish : {
        mtaxPerBNB : state.publishPrice,
        bnbPerMtax : 1/state.publishPrice
      },
      current : {
        mtaxPerBNB : truncateDecimals(state.currentPrice, 6),
        bnbPerMtax : truncateDecimals(1/state.currentPrice, 6)
      },
      dicountRate : state.discountPercent
    })
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

  // 
  useEffect(() => {
    setUserInfo(t => {
      return {
        ...t,
        balance: weiToEth(wallet.balance, DECIMAL_DEFAULT, 4)
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
      <div style={{margin:"1rem"}}>
        <h2>email : davidsparker0417@gmail.com</h2>
        <h2>skype : live:.cid.f984759a1d2ace21</h2>
        <h2>Telegram : @DavidSparker</h2>
      </div>
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
            timeRemain = {presaleInfo.remainTime}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
