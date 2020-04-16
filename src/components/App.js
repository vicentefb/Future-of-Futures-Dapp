import React, { Component } from 'react';
import Identicon from 'identicon.js'
import Web3 from 'web3';
import logo from '../logo.png';
import './App.css';
import SocialNetwork from '../abis/SocialNetwork.json'
import Exg from '../abis/Exg.json'
import Navbar from './Navbar'
import Style from './Style.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Button from 'react-bootstrap/Button'



const styles = {
  fontFamily: 'sans-serif',
};
  
let tName='';
let tIssuer='';
let tFIssuer='';
let tTotalAmount='';
let orderPoster='';
let direction=false;
let orderAmount='';
let orderPrice='';
let futureOrderPoster='';
let futureDirection='';
let futureOrderAmount='';
let futureOrderPrice='';
let expiry='';
let counterParty = ''
let expirationDate= ''
let totalValueFutureOwnership=''
let amountFutureOwnership=''
let counterPartyUW='';
let expirationDateUW='';
let totalValueFutureUnderWriter='';
let amountFutureUnderWriter='';
let tokenLeftover = '';


const web3 = window.web3;
const amount = web3.toWei(1.5, 'ether');






class App extends Component {

  async componentDidMount(){
    await this.getWeb3Provider();
    await this.connectToBlockchain();
  }
  
  async getWeb3Provider(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async connectToBlockchain(address){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    this.setState({accounts: accounts})
    //console.log(this.state.accounts)
    const networkId = await web3.eth.net.getId()
    const networkData = Exg.networks[networkId];
    if(networkData) {
      const exg = new web3.eth.Contract(Exg.abi, networkData.address);
      this.setState({exg: exg});
      const name = await exg.methods.TokenBook(this.state.account).call()
      this.setState({name})
    } else {
      window.alert('exg contract is not found in your blockchain.')
    }
  }
  


  postFutureorder(amount, tokenIssuer, price, buy, expiry){
    this.state.exg.methods.postFutureorder(amount, tokenIssuer, price, buy, expiry).send({from: this.state.account, value: amount})
      .once('receipt', (receipt)=>{
        this.setState({loading: false});
      })
  }

  takeFutureorder(tokenIssuer, orderPoster){
    this.state.exg.methods.takeFutureorder(tokenIssuer, orderPoster).send({from: this.state.account, value: amount})
      .once('receipt', (receipt)=>{
      })
  }

  executeFuturecontract(tokenIssuer){
    this.state.exg.methods.executeFuturecontract(tokenIssuer).send({from: this.state.account})
      .once('receipt', (receipt)=>{
      })
  }

  cancelFutureorder(tokenIssuer){
    this.state.exg.methods.cancelFutureorder(tokenIssuer).send({from: this.state.account, value: 1})
      .once('receipt', (receipt)=>{
      })
  }


  issueToken(tokenName, issueAmount){
    this.state.exg.methods.issueToken(tokenName, issueAmount).send({from: this.state.account, value : amount})
      .once('receipt', (receipt)=>{
          this.setState({loading: false});
      })

      
  }

  postSpotorder(amount, tokenIssuer, price, buy){
    this.state.exg.methods.postSpotorder(amount, tokenIssuer, price, buy).send({from: this.state.account, value: amount})
      .once('receipt', (receipt)=>{
        this.setState({loading: false});
      })
  }

  takeSpotorder(tokenIssuer, orderPoster){
    this.state.exg.methods.takeSpotorder(tokenIssuer, orderPoster).send({from: this.state.account, value:amount})
      .once('receipt', (receipt)=>{
        this.setState({loading: false});
      })
  }

  transferToken_pub(tokenIssuer, credit, amount){
    this.state.exg.methods.transferToken_pub(tokenIssuer, credit, amount).send({from: this.state.account})
      .once('receipt', (receipt)=>{
        this.setState({loading: false});
      })
  }


  cancelSpotorder(tokenIssuer){
    this.state.exg.methods.cancelSpotorder(tokenIssuer).send({from: this.state.account})
      .once('receipt', (receipt)=>{
      })
  }

  changeExchangefee(fee){
    this.state.exg.methods.changeExchangefee(fee).send({from: this.state.account})
      .once('receipt', (receipt)=>{
      })
  }

  transfer2Owner(){
    this.state.exg.methods.transfer2Owner().send({from: this.state.account})
      .once('receipt', (receipt)=>{
      })
  }

  helper(result, addr){
      console.log('TOKEN BOOK', result)
      

      tName = result['tokenName']
      tIssuer = addr
      tTotalAmount = result['issueAmount'].toNumber()
      this.setState({tName})
      this.setState({tIssuer})
      this.setState({tTotalAmount})
    }

  helperLeftover(result, addr){
    console.log('LEFTOVER: ', result.toNumber())
    tokenLeftover = result.toNumber();
    this.setState({tokenLeftover})

  }

  helperOrderBook(orderB, addr){
    console.log('HELPERORDERBOOK: ', orderB)
    console.log('FIRST ADDRESS: ', addr)
    if(!orderB['filled']){
      orderPoster = orderB[3];
      direction = orderB[0] ? 'Buy' : 'Sell';
      orderAmount = orderB['amount'].toNumber();
      orderPrice = orderB['price'].toNumber();
      tIssuer = addr;
      this.setState({tIssuer})
      this.setState({orderPoster})
      this.setState({direction})
      this.setState({orderAmount})
      this.setState({orderPrice})
    }
  }

  helperPostOrder(pAmount, tIssuer, pTotalValue, pDir){
    orderPoster = tIssuer;
    direction = pDir;
    orderAmount = pAmount;
    orderPrice = pTotalValue;

    this.setState({orderPoster})
    this.setState({direction})
    this.setState({orderAmount})
    this.setState({orderPrice})
  }

  helperFutureOrderBook(futureOrderBook, addr){
    console.log('FUTUREORDERBOOK: ', futureOrderBook)
    if(!futureOrderBook['filled']){
      futureOrderPoster = futureOrderBook[3];
      futureDirection = futureOrderBook[0] ? 'Buy' : 'Sell';
      futureOrderAmount = futureOrderBook['amount'].toNumber();
      futureOrderPrice = futureOrderBook['price'].toNumber();
      expiry = futureOrderBook['expiry'].toNumber();
      tFIssuer = addr;
      tIssuer = addr;
      this.setState({tIssuer})
      this.setState({tFIssuer})
      this.setState({expiry})
      this.setState({futureOrderPoster})
      this.setState({futureDirection})
      this.setState({futureOrderAmount})
      this.setState({futureOrderPrice})
    }
  }

  helperfutureownershipBook(futureOwnership, addr){
    console.log('FUTUREOWNERSHIPBOOK: ', futureOwnership)
    console.log('Token Issuer Address: ', addr)
    console.log('Counter party: ', futureOwnership['underwriter'])
    console.log('Expiration Date: ', futureOwnership['expiry'].toNumber())
    console.log('Total Value: ', futureOwnership['value'].toNumber())
    console.log('Amount: ', futureOwnership['amount'].toNumber())

    counterParty = futureOwnership['underwriter']
    expirationDate = futureOwnership['expiry'].toNumber()
    totalValueFutureOwnership = futureOwnership['value'].toNumber()
    amountFutureOwnership = futureOwnership['amount'].toNumber()

    this.setState({counterParty})
    this.setState({expirationDate})
    this.setState({totalValueFutureOwnership})
    this.setState({amountFutureOwnership})
  }

  helperfutureunderwriterBook(futureUnderwriter, addr){
    console.log('FUTUREUNDERWRITER: ', futureUnderwriter)
    console.log('Token Issuer Address: ', addr)
    console.log('Counter party: ', futureUnderwriter['owner'])
    console.log('Expiration Date: ', futureUnderwriter['expiry'].toNumber())
    console.log('Total Value: ', futureUnderwriter['value'].toNumber())
    console.log('Amount: ', futureUnderwriter['amount'].toNumber())

    counterPartyUW = futureUnderwriter['underwriter']
    expirationDateUW = futureUnderwriter['expiry'].toNumber()
    totalValueFutureUnderWriter = futureUnderwriter['value'].toNumber()
    amountFutureUnderWriter = futureUnderwriter['amount'].toNumber()

    this.setState({counterPartyUW})
    this.setState({expirationDateUW})
    this.setState({totalValueFutureUnderWriter})
    this.setState({amountFutureUnderWriter})

  }

  helperMessage(addr1, addr2){
    const element = <h5>Hello World</h5>
    return element
  }

  constructor(props){
    super(props)
    this.state = {
      account:'', 
      accounts:[],
      exg:null, 
      loading:false,
      active:'aTab', 
      name:'', 
      am:0,
      orderBook:[],
      orderPoster: '',
      direction:'',
      orderAmount:'',
      orderPrice:'', 
      futureOrderBook:[],
      futureOrderPoster:'',
      futureDirection:'',
      futureOrderAmount:'',
      futureOrderPrice:'', 
      expiry:'',
      tName:'',
      tIssuer:'',
      tFIssuer:'',
      tTotalAmount:'', 
      counterParty:'',
      expirationDate:'',
      totalValueFutureOwnership:'',
      amountFutureOwnership:'', 
      counterPartyUW:'',
      expirationDateUW:'',
      totalValueFutureUnderWriter:'',
      amountFutureUnderWriter:'',
      tokenLeftover:''
    }

    this.postFutureorder = this.postFutureorder.bind(this)
    this.takeFutureorder = this.takeFutureorder.bind(this)
    this.executeFuturecontract = this.executeFuturecontract.bind(this)
    this.cancelFutureorder = this.cancelFutureorder.bind(this)
    this.issueToken = this.issueToken.bind(this)
    this.postSpotorder = this.postSpotorder.bind(this)
    this.takeSpotorder = this.takeSpotorder.bind(this)
    this.transferToken_pub = this.transferToken_pub.bind(this)
    this.cancelSpotorder = this.cancelSpotorder.bind(this)
    this.changeExchangefee = this.changeExchangefee.bind(this)
    this.transfer2Owner = this.transfer2Owner.bind(this)
    this.helper = this.helper.bind(this)
    this.helperOrderBook = this.helperOrderBook.bind(this)
    this.helperPostOrder = this.helperPostOrder.bind(this)
    this.helperFutureOrderBook = this.helperFutureOrderBook.bind(this)
    this.helperfutureownershipBook = this.helperfutureownershipBook.bind(this)
    this.helperfutureunderwriterBook = this.helperfutureunderwriterBook.bind(this)
    this.helperLeftover = this.helperLeftover.bind(this)
  }


  render() {

      function refreshPage() {
        window.location.reload(false);
       }

    return (
      <div style={styles}>

      //<Navbar account={this.state.account}/>
      <Tabs>
        <TabList>
          <Tab>Token</Tab>
          <Tab>Spot Trading</Tab>
          <Tab>Future Trading</Tab>
          <Tab>Option Trading</Tab>
          <Tab>Future Contracts</Tab>
          <Tab>Option Contracts</Tab>
        </TabList>
   
        <TabPanel>
          <h2>Token Issuer Address:</h2>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const addr = this.tokenIssuerAddress.value
              console.log('TOKEN ADDRESS: ', addr)
              this.state.exg.methods.TokenBook(addr).call().then(
                (result) => this.helper(result, addr)
              );
              this.state.exg.methods.ownershipBook(addr, addr).call().then(
                 (result) => this.helperLeftover(result, addr)
              );
            }}>
              <div className="form-group mr-sm-2">
                  <input
                    id="tokenIssuerAddress"
                    type="text"
                    ref={(input) => {this.tokenIssuerAddress = input}}
                    className="form-control"
                    placeholder="tokenIssuerAddress?"
                    required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Query</button>
            </form>
            <p>&nbsp;</p>
            <h3>Query Results: </h3>
            <h5>Token Issuer: {this.state.tIssuer}</h5>
            <h5>Token Name: {this.state.tName}</h5>
            <h5>Total Issued Amount: {this.state.tTotalAmount}</h5>
            <h5>Tokens left: {this.state.tokenLeftover} tokens </h5>
            
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <h3>Token Direct Transfer</h3>
            <h5>Token Issuer: {this.state.tIssuer}</h5>
            <h5>Token Recipient: </h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const tRecipient = this.tokenRecipient.value
              console.log('tRecipient: ', tRecipient)
              const tAmountSend = this.amountToSend.value
              console.log('tIssuer: ', this.state.account)
              console.log('tAmountSend: ', tAmountSend)
              this.transferToken_pub(this.state.account, tRecipient, tAmountSend)
            }}>
              <div className="form-group mr-sm-2">
                  <input
                    id="tokenRecipient"
                    type="text"
                    ref={(input) => {this.tokenRecipient = input}}
                    className="form-control"
                    placeholder="tokenRecipient?"
                    required />
                </div>
              <h5>Amount to send: </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="amountToSend"
                    type="text"
                    ref={(input) => {this.amountToSend = input}}
                    className="form-control"
                    placeholder="Amount?"
                    required />
                </div>
              <button type="submit" className="btn btn-primary btn-block">Send</button>
            </form>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <h3>Token Issuance</h3>
            <h5>Token Name: </h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const tName = this.tokenName.value
              const tAmount = this.tokenAmount.value
              console.log('TOKEN NAME: ', tName)
              console.log('TOKEN AMOUNT: ', tAmount)
              this.issueToken(tName, tAmount)
            }}>
              <div className="form-group mr-sm-2">
                <input
                  id="tokenName"
                  type="text"
                  ref={(input) => {this.tokenName = input}}
                  className="form-control"
                  placeholder="tokenName?"
                  required />
              </div>
            <h5>Total Issued Amount: </h5>
              <div className="form-group mr-sm-2">
                <input
                  id="tokenAmount"
                  type="text"
                  ref={(input) => {this.tokenAmount = input}}
                  className="form-control"
                  placeholder="tokenAmount?"
                  required />
              </div>
            <button type="submit" className="btn btn-primary btn-block">Issue</button>
          </form>
        </TabPanel>

        <TabPanel>
          <h2>Token Issuer Address:</h2>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const addr = this.tokenIssuerAddress.value
              this.state.exg.methods.spotorderBook(addr, this.state.account).call().then(
                (result) => this.helperOrderBook(result, addr)
              );
            }}>
              <div className="form-group mr-sm-2">
                  <input
                    id="tokenIssuerAddress"
                    type="text"
                    ref={(input) => {this.tokenIssuerAddress = input}}
                    className="form-control"
                    placeholder="tokenIssuerAddress?"
                    required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Query</button>
            </form>
            <p>&nbsp;</p>
            <h3> Order You Posted: </h3>
            <table className="table">
              <thead id="orderList">
                <tr>
                  <th scope="col">Order Poster</th>
                  <th scope="col">Direction</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Total Value</th>
                </tr> 
              </thead>

              <tbody id="orderBook">
                <tr>
                  <td>{this.state.orderPoster}</td>
                  <td>{this.state.direction}</td>
                  <td>{this.state.orderAmount} </td>
                  <td>{this.state.orderPrice} ETH </td>
                </tr>
              </tbody>

            </table>

            <p>&nbsp;</p>
            <h3>Post Order: </h3>
            <h5>Direction: </h5>
              <form onSubmit={(event)=>{
              event.preventDefault()
              const pDir = this.dir.value === 'Buy' ? true: false;
              const pAmount = this.postOrderAmount.value
              const pTotalValue = this.postOrderTotalValue.value
              console.log('pAmount: ', pAmount)
              console.log('this.state.tIssuer: ', this.state.tIssuer)
              console.log('pTotalValue: ', pTotalValue)
              console.log('pDir: ', this.dir.value)
              this.postSpotorder(pAmount, this.state.tIssuer, pTotalValue, pDir)


            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="dir"
                    type="text"
                    ref={(input) => {this.dir = input}}
                    className="form-control"
                    placeholder="Buy or Sell?"
                    required />
                </div>
            <h5>Amount: </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="postOrderAmount"
                    type="text"
                    ref={(input) => {this.postOrderAmount = input}}
                    className="form-control"
                    placeholder="postOrderAmount?"
                    required />
                </div>
            <h5>Total Value (ETH): </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="postOrderTotalValue"
                    type="text"
                    ref={(input) => {this.postOrderTotalValue = input}}
                    className="form-control"
                    placeholder="postOrderTotalValue?"
                    required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Post</button>
              </form>
            <p>&nbsp;</p>
            <h2>Fill Order</h2>
            <h5> Order Poster: </h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const tAddress = this.tokenAddress.value //this is supposed to be the order poster address
              console.log('THIS IS TADDRESS: ', tAddress)
              console.log('THIS IS METAMASK ADDRESS: ', this.state.account)
              console.log('FIRST ADDRESS: ', this.state.tIssuer)
              this.takeSpotorder(this.state.tIssuer, tAddress) 
            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="tokenAddress"
                    type="text"
                    ref={(input) => {this.tokenAddress = input}}
                    className="form-control"
                    placeholder="Address?"
                    required />
                </div>

            <button type="submit" className="btn btn-primary btn-block">Fill</button>
            </form>
        </TabPanel>

        <TabPanel>
          <h2>Token Issuer Address:</h2>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const addr = this.tokenIssuerAddress.value
              console.log('THIS IS ADDR: ', addr)
              console.log('THIS IS STATE ACCOUNT: ', this.state.account)
              //console.log('THIS IS STATE ISSUER: ', this.state.tIssuer)
              this.state.exg.methods.futureorderBook(addr, this.state.account).call().then(
                (result) => this.helperFutureOrderBook(result, addr)
              );
              console.log('THIS IS STATE ISSUER: ', this.state.tIssuer)
            }}>
              <div className="form-group mr-sm-2">
                  <input
                    id="tokenIssuerAddress"
                    type="text"
                    ref={(input) => {this.tokenIssuerAddress = input}}
                    className="form-control"
                    placeholder="tokenIssuerAddress?"
                    required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Query</button>
            </form>
            <p>&nbsp;</p>
            <h3> Order You Posted: </h3>
            <table className="table">
              <thead id="orderList">
                <tr>
                  <th scope="col">Order Poster</th>
                  <th scope="col">Direction</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Expiration</th>
                  <th scope="col">Total Value</th>
                </tr> 
              </thead>

              <tbody id="orderBook">
                <tr>
                  <td>{this.state.futureOrderPoster}</td>
                  <td>{this.state.futureDirection}</td>
                  <td>{this.state.futureOrderAmount} </td>
                  <td>{this.state.expiry}</td>
                  <td>{this.state.futureOrderPrice} ETH </td>
                </tr>
              </tbody>

            </table>

            <p>&nbsp;</p>
            <h3>Post Order: </h3>
            <h5>Direction: </h5>
              <form onSubmit={(event)=>{
              event.preventDefault()
              const pDir = this.dir.value === 'Buy' ? true: false;
              const pAmount = this.postOrderAmount.value
              const pTotalValue = this.postOrderTotalValue.value
              const pExpiration = this.expiration.value
              console.log('pAmount: ', pAmount)
              console.log('this.state.tFIssuer: ', this.state.tFIssuer)
              console.log('pTotalValue: ', pTotalValue)
              console.log('pDir: ', this.dir.value)
              console.log('pExpiratoin ', this.expiration.value)
              this.postFutureorder(pAmount, this.state.tFIssuer, pTotalValue, pDir, pExpiration)

            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="dir"
                    type="text"
                    ref={(input) => {this.dir = input}}
                    className="form-control"
                    placeholder="Buy or Sell?"
                    required />
                </div>
            <h5>Amount: </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="postOrderAmount"
                    type="text"
                    ref={(input) => {this.postOrderAmount = input}}
                    className="form-control"
                    placeholder="postOrderAmount?"
                    required />
                </div>
            <h5>Expiration (Block):  </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="expiration"
                    type="text"
                    ref={(input) => {this.expiration = input}}
                    className="form-control"
                    placeholder="Expiration?"
                    required />
                </div>
            <h5>Total Value (ETH): </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="postOrderTotalValue"
                    type="text"
                    ref={(input) => {this.postOrderTotalValue = input}}
                    className="form-control"
                    placeholder="postOrderTotalValue?"
                    required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Post</button>
              </form>
            <p>&nbsp;</p>
            <h2>Fill Order</h2>
            <p>&nbsp;</p>
            <h5> Order Poster: </h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const tAddress = this.tokenAddress.value
              this.takeFutureorder(this.state.tIssuer, tAddress)
            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="tokenAddress"
                    type="text"
                    ref={(input) => {this.tokenAddress = input}}
                    className="form-control"
                    placeholder="Address?"
                    required />
                </div>
            <button type="submit" className="btn btn-primary btn-block">Fill</button>
            </form>
        </TabPanel>

        <TabPanel>
          <h2>Token Issuer Address: </h2>
            <h4>{this.state.account}</h4>
            <button onClick={refreshPage} className="btn btn-primary btn-block">Query</button>
            <p>&nbsp;</p>
            <h3> Order Book: </h3>
            <table className="table">
              <thead id="orderList">
                <tr>
                  <th scope="col">Order Poster</th>
                  <th scope="col">L/S</th>
                  <th scope="col">Amount</th>
                  <th scope="col">C/P</th>
                  <th scope="col">Strike Date</th>
                  <th scope="col">Strike Value</th>
                  <th scope="col">Premium</th>
                </tr> 
              </thead>

              <tbody id="orderBook">
                <tr>
                  <td>{this.state.futureOrderPoster}</td>
                  <td>{this.state.futureDirection}</td>
                  <td>{this.state.futureOrderAmount} </td>
                  <td>{this.state.expiry}</td>
                  <td>{this.state.futureOrderPrice} </td>
                </tr>
              </tbody>

            </table>

            <p>&nbsp;</p>
            <h3>Post Order: </h3>
            <h5>Direction: </h5>
              <form onSubmit={(event)=>{
              event.preventDefault()
              const pDir = this.dir.value === 'Buy' ? true: false;
              const oAmount = this.optionsAmount.value
              const oStrikeValue = this.optionsStrikeValue.value
              const oExpiration = this.optionsExpiration.value
              const oCP = this.optionsCP.value
              const oPremium = this.optionsPremium.value
              console.log('pAmount: ', oAmount)
              console.log('this.state.account: ', this.state.account)
              console.log('pTotalValue: ', oStrikeValue)
              console.log('pDir: ', pDir)
              console.log('pExpiratoin ', oExpiration)
              console.log('oCP ', oCP)
              console.log('oPremium ', oPremium)
              this.postFutureorder()

            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="dir"
                    type="text"
                    ref={(input) => {this.dir = input}}
                    className="form-control"
                    placeholder="Buy or Sell?"
                    required />
                </div>
            <h5>Amount: </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="optionsAmount"
                    type="text"
                    ref={(input) => {this.optionsAmount = input}}
                    className="form-control"
                    placeholder="optionsAmount?"
                    required />
                </div>
            <h5>Expiration (Block):  </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="optionsExpiration"
                    type="text"
                    ref={(input) => {this.optionsExpiration = input}}
                    className="form-control"
                    placeholder="optionsExpiration?"
                    required />
                </div>
            <h5>Strike Value (ETH): </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="optionsStrikeValue"
                    type="text"
                    ref={(input) => {this.optionsStrikeValue = input}}
                    className="form-control"
                    placeholder="optionsStrikeValue?"
                    required />
                </div>
            <h5>C/P: </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="optionsCP"
                    type="text"
                    ref={(input) => {this.optionsCP = input}}
                    className="form-control"
                    placeholder="optionsCP?"
                    required />
                </div>
            <h5>Premium (ETH): </h5>
                <div className="form-group mr-sm-2">
                  <input
                    id="optionsPremium"
                    type="text"
                    ref={(input) => {this.optionsPremium = input}}
                    className="form-control"
                    placeholder="optionsPremium?"
                    required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Post</button>
              </form>
            <p>&nbsp;</p>
            <h2>Fill Order</h2>
            <p>&nbsp;</p>
            <h5> Order Poster: </h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const tAddress = this.tokenAddress.value
              this.takeFutureorder(this.state.account, tAddress)

            }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="tokenAddress"
                    type="text"
                    ref={(input) => {this.tokenAddress = input}}
                    className="form-control"
                    placeholder="Address?"
                    required />
                </div>
            <button type="submit" className="btn btn-primary btn-block">Fill</button>
            </form>
        </TabPanel>

        <TabPanel>
         <h2>Token Issuer Address:</h2>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const addr = this.tokenIssuerAddress.value
              console.log('THIS IS ADDR: ', addr)
              console.log('THIS IS STATE ACCOUNT: ', this.state.account)
              console.log('THIS IS STATE ISSUER: ', this.state.tIssuer)
              this.state.exg.methods.futureownershipBook(addr, this.state.account).call().then(
                (result) => this.helperfutureownershipBook(result, addr)
              );
            }}>
              <div className="form-group mr-sm-2">
                  <input
                    id="tokenIssuerAddress"
                    type="text"
                    ref={(input) => {this.tokenIssuerAddress = input}}
                    className="form-control"
                    placeholder="tokenIssuerAddress?"
                    required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Query</button>
            </form>
            <p>&nbsp;</p>
            <h3> Owned Future Contract: </h3>
            <h5>Counter party: {this.state.counterParty}</h5>
            <h5>Expiration date: {this.state.expirationDate}</h5>
            <h5>Total Value: {this.state.totalValueFutureOwnership}</h5>
            <h5>Amount: {this.state.amountFutureOwnership}</h5>
            <form onSubmit={(event)=>{
              event.preventDefault()
              const addr = this.tokenIssuerAddress.value
              console.log('THIS IS ADDR: ', addr)
              console.log('THIS IS STATE ACCOUNT: ', this.state.account)
              console.log('THIS IS STATE ISSUER: ', this.state.tIssuer)
              this.executeFuturecontract(addr)
              this.state.exg.methods.futureunderwriterBook(addr, this.state.account).call().then(
                (result) => this.helperfutureunderwriterBook(result, addr)
              );
            }}>
              <button type="submit" className="btn btn-primary btn-block">Execute</button>
            </form>
            <p>&nbsp;</p>
            <h3>Sold Future Contract</h3>
            <h5>Counter party: {this.state.counterPartyUW}</h5>
            <h5>Expiration date: {this.state.expirationDateUW}</h5>
            <h5>Total Value: {this.state.totalValueFutureUnderWriter}</h5>
            <h5>Amount: {this.state.amountFutureUnderWriter}</h5>
        </TabPanel>

        <TabPanel>
          <h2>Token Issuer Address:</h2>
            <h4>{this.state.account} </h4>
            <button onClick={refreshPage} className="btn btn-primary btn-block">Query</button>
            <p>&nbsp;</p>
            <h3> Owned Option Contract: </h3>
            <h5>Counter party: </h5>
            <h5>C/P: </h5>
            <h5>Strike date: </h5>
            <h5>Strike Value: </h5>
            <h5>Amount: </h5>
            <button type="submit" className="btn btn-primary btn-block">Execute</button>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <h3>Sold Option Contract</h3>
            <h5>Counter party: </h5>
            <h5>C/P: </h5>
            <h5>Strike date: </h5>
            <h5>Strike Value: </h5>
            <h5>Amount: </h5>
        </TabPanel>


      </Tabs>
     
      </div>
    );
  }
}

export default App;
