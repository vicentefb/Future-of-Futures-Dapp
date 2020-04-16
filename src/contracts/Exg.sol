pragma solidity ^0.5.0;

contract Exg {
    address payable admin;
    uint256 exchangeFee;

    struct spotOrder {
        bool buy;//else sell order
        bool filled;//whether the order is filled
        bool posted;
        address payable poster;//whoever posted the order
        uint256 price;//ask/bid depending on direction
        uint256 amount;
    }

    struct futureOrder {
        bool buy;//else sell order
        bool filled;//whether the order is filled
        bool posted;
        address payable poster;//whoever posted the order
        uint256 price;//ask/bid depending on direction
        uint256 amount;
        uint256 expiry;
    }

    struct futureContract{
        address payable underwriter;
        address payable owner;
        bool posted;
        bool executed;
        uint256 expiry;
        uint256 amount;
        uint256 value;
    }

    function postFutureorder(uint256 amount, address tokenIssuer, uint256 price, bool buy, uint256 expiry) public payable{
      //poster cannot have another existing order
      if(futureorderBook[tokenIssuer][address(msg.sender)].posted ==true) revert();
      if (buy==false){
        //poster want to underwrite a future contract, meaning the poster wants to sell the underlying commodity
        //poster must not have already underwritten a future contract
        //if(futureunderwriterBook[tokenIssuer][address(msg.sender)].posted ==true) revert();
        //we don't have to check if seller has enough commodity, because if the seller does not have enough commodity, the buyer won't
        //be able to take the order, thus no funds is transferred to the seller
        futureorderBook[tokenIssuer][address(msg.sender)]=futureOrder(buy,false,true,address(msg.sender),price,amount,expiry);
      }
      else{
        //poster want to buy a future tokenContract
        //poster must not have already owned a future contract
        //if(futureownershipBook[tokenIssuer][address(msg.sender)].posted ==true) revert();
        //poster must send enough Ether
        require(msg.value>=price*amount);
        futureorderBook[tokenIssuer][address(msg.sender)]=futureOrder(buy,false,true,address(msg.sender),price,amount,expiry);
      }
    }

    function takeFutureorder(address tokenIssuer,address payable orderPoster) public payable{
      futureOrder memory orderTofill;
      futureContract memory contractSpecified;
      uint256 orderValue;
      orderTofill=futureorderBook[tokenIssuer][orderPoster];
      orderValue=orderTofill.price*orderTofill.amount;

      if(orderTofill.posted ==false) revert();
      if(orderTofill.filled ==true) revert();
      if (orderTofill.buy==false){
        //order taker wants to buy the future contract
        //check if the underwritter has already underwritten a future contract
        //check if the order taker already owns a future contract
        if(futureunderwriterBook[tokenIssuer][orderPoster].posted ==true) revert();
        if(futureownershipBook[tokenIssuer][address(msg.sender)].posted ==true) revert();
        //all clear, order poster is the underwriter, order taker is the prospective owner of this future contract
        contractSpecified=futureContract(orderPoster,address(msg.sender),true,false,orderTofill.expiry,orderTofill.amount,orderValue);
        //order taker must have sent the order value to the smart contract, as the smart contract acts as an escrow account
        //underwriter must transfer the token to a special address in the ownershipbook, as this special address acts as an escrow account for the token
        require(msg.value >= exchangeFee+orderValue);
        transferToken(tokenIssuer,address(0),orderPoster,orderTofill.amount);
        futureunderwriterBook[tokenIssuer][orderPoster]=contractSpecified;
        futureownershipBook[tokenIssuer][address(msg.sender)]=contractSpecified;
        futureorderBook[tokenIssuer][orderPoster].filled=true;
        futureorderBook[tokenIssuer][orderPoster].posted=false;
      }
      else{
        //order taker wants to sell the future contract
        //check if the order taker  has already underwritten a future contract
        //check if the order poster already owns a future contract
        if(futureownershipBook[tokenIssuer][orderPoster].posted ==true) revert();
        if(futureunderwriterBook[tokenIssuer][address(msg.sender)].posted ==true) revert();
        contractSpecified=futureContract(orderPoster,address(msg.sender),true,false,orderTofill.expiry,orderTofill.amount,orderValue);
        //order taker must have sent the order value to the smart contract, as the smart contract acts as an escrow account
        //underwriter must transfer the token to a special address in the ownershipbook, as this special address acts as an escrow account for the token
        require(msg.value >= exchangeFee);
        transferToken(tokenIssuer,address(0),address(msg.sender),orderTofill.amount);
        futureunderwriterBook[tokenIssuer][address(msg.sender)]=contractSpecified;
        futureownershipBook[tokenIssuer][orderPoster]=contractSpecified;
        futureorderBook[tokenIssuer][orderPoster].filled=true;
        futureorderBook[tokenIssuer][orderPoster].posted=false;
      }

    }

    function executeFuturecontract(address tokenIssuer) public payable{
      futureContract memory contractToexecute;
      contractToexecute=futureownershipBook[tokenIssuer][address(msg.sender)];
      require(contractToexecute.posted==true,'contract is not valid');
      require(contractToexecute.executed==false,'contract is executed');
      require(block.number>=contractToexecute.expiry,'expiry block not reached yet');

      contractToexecute.underwriter.transfer(contractToexecute.value);
      transferToken(tokenIssuer,address(msg.sender),address(0),contractToexecute.amount);

      futureownershipBook[tokenIssuer][address(msg.sender)].posted=false;
      futureownershipBook[tokenIssuer][address(msg.sender)].executed=false;
      futureunderwriterBook[tokenIssuer][contractToexecute.underwriter].posted=false;
      futureunderwriterBook[tokenIssuer][contractToexecute.underwriter].executed=false;

    }

    function cancelFutureorder(address tokenIssuer) public payable{
      futureOrder memory orderTocancel;
      orderTocancel=futureorderBook[tokenIssuer][address(msg.sender)];
      require(orderTocancel.posted==true,'order is not valid');
      require(orderTocancel.filled==false,'order is filled');
      if (orderTocancel.buy==true){
        address(msg.sender).transfer(orderTocancel.amount*orderTocancel.price);
      }
      futureorderBook[tokenIssuer][address(msg.sender)].posted=false;
      futureorderBook[tokenIssuer][address(msg.sender)].filled=false;
    }



    struct Token {
        bool issued;
        string tokenName;
        address payable issuer;
        uint256 issueAmount;
    }

    mapping(address => Token) public TokenBook;//where address implies each address could only issue one token at a time
    //in real life, each address would correspond to a "holding company"/SPV that is used to issue stocks
    //need to fix, add a counter for accumulated exchange fee
    mapping(address => mapping (address => spotOrder)) public spotorderBook;//issuer:poster
    mapping(address => mapping (address => futureOrder)) public futureorderBook;//issuer:poster
    mapping(address => mapping (address => futureContract)) public futureunderwriterBook;//issuer:underwritter
    mapping(address => mapping (address => futureContract)) public futureownershipBook;//issuer:owner


    mapping(address => mapping (address => uint256)) public ownershipBook;
    mapping(address => uint256) public lastPrice;
    //first address specify which token
    //second address specify which account

    constructor() public {
       admin = msg.sender;
       exchangeFee = 0.01 ether;
    }

    modifier onlyOwner() {
      require(msg.sender == admin, "message sender is not the admin");
      _;
    }

    function issueToken(string memory tokenName, uint256 issueAmount) public payable {
      if(TokenBook[address(msg.sender)].issued == true) revert();//check if there is already a token issued by this address
      require(msg.value >= exchangeFee);
      TokenBook[address(msg.sender)]=Token(true,tokenName,address(msg.sender),issueAmount);
      ownershipBook[address(msg.sender)][address(msg.sender)]=issueAmount;
    }

    function postSpotorder (uint256 amount, address tokenIssuer, uint256 price, bool buy) public payable{
      if(spotorderBook[tokenIssuer][address(msg.sender)].posted ==true) revert();//check if there is already an order posted by this address
      if (buy==false){
        spotorderBook[tokenIssuer][address(msg.sender)]=spotOrder(buy,false,true,address(msg.sender),price,amount);
      }
      else{
        require(msg.value>=price*amount);
        spotorderBook[tokenIssuer][address(msg.sender)]=spotOrder(buy,false,true,address(msg.sender),price,amount);
      }
    }

    function takeSpotorder(address tokenIssuer, address payable orderPoster) public payable{
      spotOrder memory orderTofill;
      uint256 orderValue;
      orderTofill=spotorderBook[tokenIssuer][orderPoster];
      orderValue=orderTofill.price*orderTofill.amount;

      if(orderTofill.posted ==false) revert();
      if(orderTofill.filled ==true) revert();

      if (orderTofill.buy==false) {//order poster is selling, order taker is buying
      require(msg.value >= exchangeFee+orderValue);//taker has sent enough found
      require(ownershipBook[tokenIssuer][orderPoster]>=orderTofill.amount);//seller has enough token
      transferToken(tokenIssuer,address(msg.sender),orderPoster,orderTofill.amount);
      admin.transfer(exchangeFee);
      orderPoster.transfer(orderValue);
    }
      else{//order taker is selling, order poster is buying
        require(msg.value >= exchangeFee);//
        require(ownershipBook[tokenIssuer][address(msg.sender)]>=orderTofill.amount);//seller must have enough token
        transferToken(tokenIssuer,orderPoster,address(msg.sender),orderTofill.amount);
        address(msg.sender).transfer(orderValue);
      }
      lastPrice[tokenIssuer]=orderTofill.price;
      spotorderBook[tokenIssuer][orderPoster].filled=true;
      spotorderBook[tokenIssuer][orderPoster].posted=false;
    }

    function transferToken(address tokenIssuer,address credit, address debit, uint256 amount) private {
      ownershipBook[tokenIssuer][debit]-=amount;
      ownershipBook[tokenIssuer][credit]+=amount;
    }

    function transferToken_pub(address tokenIssuer,address credit, uint256 amount) public {
      ownershipBook[tokenIssuer][address(msg.sender)]-=amount;
      ownershipBook[tokenIssuer][credit]+=amount;
    }

    function cancelSpotorder(address tokenIssuer) public payable{
      spotOrder memory orderTocancel;
      orderTocancel=spotorderBook[tokenIssuer][address(msg.sender)];
      require(orderTocancel.filled==false);
      require(orderTocancel.posted==true);
      if (orderTocancel.buy==true){
        address(msg.sender).transfer(orderTocancel.amount*orderTocancel.price);
      }

      spotorderBook[tokenIssuer][address(msg.sender)].posted=false;
      spotorderBook[tokenIssuer][address(msg.sender)].filled=false;

    }

    function changeExchangefee(uint256 fee) public onlyOwner{
      exchangeFee=fee;
    }

    function transfer2Owner() public onlyOwner{
      address self = address(this); //address(this).balance gives invald opcode, use this workaround
      uint256 balance = self.balance;
      //require(msg.sender == admin, "message sender is not the admin");
      admin.transfer(balance);
    }

}
