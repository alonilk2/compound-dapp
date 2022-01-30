import '../CSS/Supplier.css'

import { useCallback, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import abiJson from '../Utils/abi.json'
import DaiLogo from '../Images/dai.png'
const {
  cEthAbi,
  comptrollerAbi,
  priceFeedAbi,
  cErcAbi,
  erc20Abi
} = require('../contracts.json')
const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643' // cDai
let cToken = ''
function CompoundReturnBorrow (props) {
  const [borrowAmount, setBorrowAmount] = useState(0)
  const [currentAccount, setCurrentAccount] = useState(null)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [currentCETHBalance, setCurrentCETHBalance] = useState(0)
  const [currentRate, setCurrentRate] = useState(0)
  const [metaMaskInstalled, setmetaMaskInstalled] = useState(true)
  const [cEthContract, setcEthContract] = useState(null)
  const [LoadingText, setLoadingText] = useState(null)
  const [liquidity, setLiquidity] = useState(null)
  const [collateralFactor, setCollateralFactor] = useState(null)
  const [underlyingPrice, setUnderlyingPrice] = useState(null)
  const [borrowRate, setBorrowRate] = useState(null)
  const [borrowBalance, setBorrowBalance] = useState(null)
  const [priceFeed, setPriceFeed] = useState(null)
  const cTokenAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643' // cDai
  const contractAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5'
  const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')
  const ethDecimals = 18
  const assetName = 'DAI'
  const underlyingDecimals = 18 // Number of decimals defined in this ERC20 token's contract

  const connectWalletHandler = async () => {
    const { ethereum } = window

    if (!ethereum) {
      setmetaMaskInstalled(false)
      console.log('Make sure you have Metamask installed!')
      return
    } else {
      console.log("Wallet exists! We're ready to go!")
    }
    try {
      const provider1 = new ethers.providers.Web3Provider(window.ethereum, 'any')
      let res = await provider1.send('eth_requestAccounts', [])
      const signer = provider1.getSigner()

      let address = await signer.getAddress()
      setCurrentAccount(address)

      let contract = new ethers.Contract(contractAddress, abiJson, signer)
      setcEthContract(contract)

      // Mainnet Contract for the Compound Protocol's Comptroller
      let comptrollerAddress = '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'
      let comptroller = new ethers.Contract(
        comptrollerAddress,
        comptrollerAbi,
        signer
      )

      // Mainnet Contract for the Open Price Feed
      const priceFeedAddress = '0x6d2299c48a8dd07a872fdd0f8233924872ad1071'
      const priceFeed = new ethers.Contract(
        priceFeedAddress,
        priceFeedAbi,
        signer
      )
      setPriceFeed(priceFeed)

      // Mainnet address of underlying token (like DAI or USDC)
      console.log('B')
      cToken = new ethers.Contract(cTokenAddress, cErcAbi, signer)
      console.log(cToken)
      console.log('B')

      let ethBalance =
        +(await provider1.getBalance(address)) / Math.pow(10, ethDecimals)
      setCurrentBalance(ethBalance.toFixed(4))

      let cTokenBalance = +(await contract.callStatic.balanceOf(address)) / 1e8
      setCurrentCETHBalance(cTokenBalance.toFixed(4))

      let exchangeRateCurrent = await contract.callStatic.exchangeRateCurrent()
      exchangeRateCurrent =
        exchangeRateCurrent / Math.pow(10, 18 + ethDecimals - 8)
      setCurrentRate(exchangeRateCurrent.toFixed(6))

      let markets = [contractAddress] // This is the cToken contract(s) for your collateral
      let enterMarkets = await comptroller.enterMarkets(markets)
      await enterMarkets.wait(1)

      let { 1: liquidity } = await comptroller.callStatic.getAccountLiquidity(
        address
      )
      liquidity = liquidity / 1e18
      setLiquidity(liquidity)

      let { 1: collateralFactor } = await comptroller.callStatic.markets(
        contractAddress
      )
      collateralFactor = (collateralFactor / 1e18) * 100 // Convert to percent
      setCollateralFactor(collateralFactor)

      let underlyingPriceInUsd = await priceFeed.callStatic.price(assetName)
      underlyingPriceInUsd = underlyingPriceInUsd / 1e6 // Price feed provides price in USD with 6 decimal places
      setUnderlyingPrice(underlyingPriceInUsd)

      let borrowRate = await cToken.callStatic.borrowRatePerBlock()
      borrowRate = borrowRate / 1e18
      setBorrowRate(borrowRate)

      const underlyingAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F' // Dai
      const underlying = new ethers.Contract(
        underlyingAddress,
        erc20Abi,
        signer
      )
      const underlyingToRepay = (
        borrowAmount * Math.pow(10, underlyingDecimals)
      ).toString()
      const approve = await underlying.approve(cTokenAddress, underlyingToRepay)
      await approve.wait(1)

      const repayBorrow = await cToken.repayBorrow(underlyingToRepay)
      const repayBorrowResult = await repayBorrow.wait(1)

      const failure = repayBorrowResult.events.find(_ => _.event === 'Failure')
      if (failure) {
        const errorCode = failure.args.error
        console.error(`repayBorrow error, code ${errorCode}`)
        process.exit(1)
      }

      props.update()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className='servicebox-container'>
        <div className='row'>
          <h2 className='title'>{props.title}</h2>
        </div>
        <div className='row'>
          <div class='input-group mb-3'>
            <input
              type='numbers'
              value={borrowAmount}
              onChange={val => setBorrowAmount(val.target.value)}
              class='form-control input-amount'
              placeholder='0.00'
              aria-label='ETH To Supply'
              aria-describedby='basic-addon2'
            ></input>
            <img
              src={DaiLogo}
              className='input-group-text'
              alt='Dai logo'
              height={90}
            ></img>
          </div>
        </div>
        <div className='row'>
          <button onClick={() => connectWalletHandler()} class='supply'>
            Return
          </button>
        </div>
      </div>
    </>
  )
}

export default CompoundReturnBorrow
