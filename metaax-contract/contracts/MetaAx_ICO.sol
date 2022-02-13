//SPDX-License-Identifier: Unlicense
pragma solidity ^0.6.12;
import "./MetaAx.sol";
import "./pair.sol";

contract MetaAxPresale is Ownable {
  using SafeMath for uint256;
  using Address for address;
  bool private constant TESTING = true;
  struct Investor {
    uint256 amount;   // acmount of pre-staked MetaAx
    uint256 lp;       // acmount of LP token for investor
    uint256 regTime;  // registration timestamp
    uint256 lockout;  // lock period
  }

  // The token to be pre staked
  MetaAX public metaAx; 
  // investor registration info
  mapping(address => Investor) private investors;
  mapping(uint => address) private investorList;
  uint public investorCount;
  // max amount of token that can able to be presaled
  uint256 public prCap = 10000000000000000;
  // staked token amount by presale
  uint256 public staked;
  uint256 public stakedLp;
  // discount price of pre-staking token
  uint256 public discountRate = 50;
  // Publish price of token. (BNB per MetaAx)
  uint256 public publishPriceNumerator = 1;
  uint256 public publishPriceDenominator = 10000;
  // limit of lock period
  uint256 public maxLockPeriod = 0;
  uint256 public minLockPeriod = 0;
  // time duration to publishment 
  uint256 public lifetime = 86400;
  // timestamp of start/end of pre-staking epoch
  uint256 private startTime;
  uint256 public endTime;
  // router & pair for liquidity
  IUniswapV2Router02 public immutable uniswapV2Router;
  IPancakePair public immutable pair;
  

  constructor (address payable tokenAddr) public {
    metaAx = MetaAX(tokenAddr);
    uniswapV2Router = metaAx.uniswapV2Router();
    pair = IPancakePair(metaAx.uniswapV2Pair());
    investorCount = 0;
    // time duration of pre staking epoch
    startTime = block.timestamp;
    endTime = startTime.add(lifetime);
  }

  /**
  * @dev Set the presale policy.
  * @param _lifetime pre-staking duratation, on ellapsed this time, token will be published
  * @param _publishPriceNumerator discount price of pre-staking tokens to set.(numerator)
  * @param _publishPriceDenominator discount price of pre-staking tokens to set.(denominator)
  * @param _discountRate Indicates what percentage of the expected publication price will be set as the discount price
  * @param cap max amount of tokens that can be presaled.
  * @param lockMin investors can lock only more than this period.
  */
  function setPresalePolicy(
    uint256 _lifetime,
    uint256 _publishPriceNumerator,
    uint256 _publishPriceDenominator,
    uint256 _discountRate,
    uint256 cap, 
    uint256 lockMin
  ) public onlyOwner {
    prCap = cap;
    publishPriceNumerator = _publishPriceNumerator;
    publishPriceDenominator = _publishPriceDenominator;
    discountRate = _discountRate;
    minLockPeriod = lockMin;
    lifetime = _lifetime;
    // time duration of pre staking epoch
    startTime = block.timestamp;
    endTime = startTime.add(lifetime);
  }

  /**
  * @dev Check pre-stake validation
  * @return return true if it is possible to pre-stake.
  */
  function validPreStake(uint256 amount, uint256 lockPeriod) private view returns(bool) {
    // check if estamating amount of pre-staking token exceeds the limit
    uint256 weiAmount = staked.add(amount);
    if (amount == 0 || weiAmount > prCap)
      return false;
    
    // lockPeriod should greater then minimum lock period and not exeeds lifetime
    if (lockPeriod < minLockPeriod 
      /*|| lockPeriod > getPresaleRemainTime()*/)
      return false;
    return true;
  }

  /**
  * @dev Calculate BNB for pre-staking
  * @return calculated BNB amount.
  */
  function _calcEthForPreStaking(uint256 amount) private view returns(uint256) {    
    (uint256 curStakedToken, uint256 curStakedBNB, ) = pair.getReserves();
    if (curStakedToken == 0)
    {
      // calculate by percentage mode
      return amount
        .mul(publishPriceNumerator)
        .div(publishPriceDenominator)
        .mul(discountRate)
        .div(100)
        .mul(10**18)
        .div(10**9);
    }
    else {
      // calculate by liquidity rate
      return amount
        .mul(curStakedBNB)
        .div(curStakedToken);
    }
  }

  /**
  * @dev Shows the possibility of pre-staking a certain amount of tokens and the BNB required for it..
  * @param amount Amount of token to pre-stake.
  * @param lockPeriod Period of time of releasing locked LP tokens.
  * @return Amount of BNB proper to adding liquidity token.
  */
  function lookupPreStake(uint256 amount, uint256 lockPeriod) external view returns(uint256) {
    // Check pre-stake validation
    if (!validPreStake(amount, lockPeriod))
      return 0;
    // caculate BNB for pre-staking
    uint256 amoutOfBNB = _calcEthForPreStaking(amount);
    return amoutOfBNB;
  }

  /**
  * @dev Accept request of pre-stake and add liquidity.
  * @param amount Amount of token to pre-stake.
  * @param lockPeriod Period of time of releasing locked LP tokens.
  * @return Amount of liquidity for pre-staking
  */
  function requestPreStake(uint256 amount, uint256 lockPeriod) external payable returns(uint256) {
    // Check pre-stake validation
    require(validPreStake(amount, lockPeriod), "Cannot pre-stake with this required parameters.");
    // caculate BNB for pre-staking
    uint256 amountOfBNB = _calcEthForPreStaking(amount);
    // check payment
    require(msg.value >= amountOfBNB, "Out of request BNB!");
    // add liquidity
    (uint256 stakedToken, uint256 liquidity) = addLiquidity(amount, amountOfBNB);
    // register investor
    if (investors[msg.sender].amount == 0) // check if already request befor
    {
      investorList[investorCount] = msg.sender;
      investorCount = investorCount.add(1);
    }
    investors[msg.sender].amount = investors[msg.sender].amount.add(amount);
    investors[msg.sender].lp = investors[msg.sender].lp.add(liquidity);
    investors[msg.sender].regTime = block.timestamp;
    investors[msg.sender].lockout = lockPeriod;
    // return remaining funds back to the investor
    if (msg.value > amountOfBNB)
      payable(msg.sender).transfer(msg.value);
      // payable(msg.sender).transfer(msg.value.sub(amountOfBNB));
    // accumlate staked amount
    staked = staked.add(stakedToken);
    stakedLp = stakedLp.add(liquidity);
    return liquidity;
  }

  /**
  * @dev check if an investor ready to withdraw lp token
  */
  function _isReadyToWithdraw(address who) private view returns(bool) {
    return (investors[who].amount != 0 && investors[who].lp != 0 &&
      investors[who].regTime != 0 && 
      block.timestamp.sub(investors[who].regTime) >= investors[who].lockout);
  }

  /**
  * @dev send lp tokens to investor's wallet
  */
  function _sendLpToInvestor(address to) private returns(uint256) {
    // transfer LP token from this contract to the investor's wallet
    pair.transfer(to, investors[to].lp);
    // Release the investor from register list
    uint256 lp = investors[to].lp;
    investors[to].amount = 0;
    investors[to].regTime = 0;
    investors[to].lockout = 0;
    investors[to].lp = 0;
    return lp;
  }

  /**
  * @dev Investor will actually be the onwer of LP tokens.
  */
  function withdrawLP() external returns(uint256) {
    // check if this account is registerd
    require(_isReadyToWithdraw(msg.sender), "Cannot become to LP owner!");
    uint256 lp = _sendLpToInvestor(msg.sender);
    return lp;
  }

  /**
  * @dev add liquidity with certain amount paire of tokens
  * @param tokenAmount MetaAx token amount
  * @param ethAmount BNB amount
  */
  function addLiquidity(uint256 tokenAmount, uint256 ethAmount) private returns(uint256 stakedToken, uint256 liquidity) {
    // approve token transfer to cover all possible scenarios
    metaAx.approve(address(uniswapV2Router), tokenAmount);
    // add the liquidity
    (stakedToken,,liquidity) = uniswapV2Router.addLiquidityETH{value: ethAmount}(
        address(metaAx),
        tokenAmount,
        0, // slippage is unavoidable
        0, // slippage is unavoidable
        address(this),
        block.timestamp
    );
  }

  /**
  * @dev Get the state of investor
  */
  function queryState() external view returns(
    uint256 presaleRemainTime,  // remain time to end the presale epoch
    uint    pubPriceN,          // publish price numberator
    uint    pubPriceD,          // publish price denominator
    uint    discountPercent,    // Percenteage of discount price
    uint256 currentPrice,       // bnb per 1 MTAX ether in wei
    uint256 totalInvestors,     // total investors
    uint256 totalStakedToken,   // total amount of staked token
    uint256 totalSuppliedLp,    // total amount of supplied lp token 
    uint256 amount,             // amount of token that this account has staked
    uint256 bnbAmount,          // amount of bnb that this account has staked
    uint256 lp,                 // lp token of this account
    uint256 reservedLP,         // reserved lp token of this account
    uint256 remainTime          // remain lockout time
  ) {

    if (block.timestamp > endTime)
      presaleRemainTime = 0;
    else 
      presaleRemainTime = endTime.sub(block.timestamp);
    pubPriceN = publishPriceNumerator;
    pubPriceD = publishPriceDenominator;
    discountPercent = discountRate;
    totalInvestors = investorCount;
    totalStakedToken = staked;
    totalSuppliedLp = stakedLp;
    currentPrice = _calcEthForPreStaking(10**9);
    amount = investors[msg.sender].amount;
    lp = pair.balanceOf(msg.sender);
    if (amount == 0) {
      // this account din't prestake yet
      bnbAmount = 0;
      remainTime = 0;
      reservedLP = 0;
    } else {
      bnbAmount = _calcEthForPreStaking(investors[msg.sender].amount);
      reservedLP = investors[msg.sender].lp;
      uint256 elapsedTime = block.timestamp.sub(investors[msg.sender].regTime);
      if (elapsedTime >= investors[msg.sender].lockout)
        remainTime = 0;
      else
        remainTime = investors[msg.sender].lockout.sub(elapsedTime);
    }
  }

  /**
  * @dev Get the remaining time until the end of pre-staking period
  */
  function getPresaleRemainTime() public view returns(uint256) {
    if (endTime < block.timestamp)
      return 0;
    return endTime.sub(block.timestamp);
  }

  /**
  * @dev Send all LP tokents to every proper owner.
  */
  function withdrawAll() external onlyOwner {
    for(uint i = 0; i < investorCount; i ++) {
      address investor = investorList[i];
      if (_isReadyToWithdraw(investor))
        _sendLpToInvestor(investor);
    }
  }
}