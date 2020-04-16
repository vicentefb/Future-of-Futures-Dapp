const Exg = artifacts.require("Exg");
require('chai')
.use(require('chai-as-promised'))
.should();

contract(Exg,([customer1, customer2,customer3,customer4])=>{
    let exg;
    before(async () =>{
        exg = await Exg.deployed({from: customer1})
    })

    describe('test issue token', async()=>{
        it('issue 1000 corn tokens',async() =>{
          await exg.issueToken('corn', 1000, {from: customer1,value: web3.utils.toWei('0.01','Ether')});
        })


    })

    describe('test spot order', async()=>{
        it('post a sell order of 10 tokens, from account 1 ',async() =>{
          await exg.postSpotorder(10, customer1,web3.utils.toWei('0.1','Ether'),false, {from: customer1});
        })

        it('take the sell order of 10 tokens, from account 2 ',async() =>{
          await exg.takeSpotorder(customer1,customer1, {from: customer2,value: web3.utils.toWei('1.5','Ether')});
          let balanceIssuer = await exg.ownershipBook.call(customer1,customer1);
          let balanceBuyer = await exg.ownershipBook.call(customer1,customer2);
          console.log('token balance of account1',balanceIssuer['words'][0]);
          console.log('token balance of account2',balanceBuyer['words'][0]);
        })

        it('post a buy order of 10 tokens, from account 2 ',async() =>{
          await exg.postSpotorder(10, customer1,web3.utils.toWei('0.1','Ether'),true, {from: customer2,value: web3.utils.toWei('1.3','Ether')});
        })

        it('take the buy order of 10 tokens, from account 1 ',async() =>{
          await exg.takeSpotorder(customer1,customer2, {from: customer1,value: web3.utils.toWei('0.1','Ether')});
          let balanceSeller = await exg.ownershipBook.call(customer1,customer1);
          let balanceBuyer = await exg.ownershipBook.call(customer1,customer2);
          console.log('token balance of account1',balanceSeller['words'][0]);
          console.log('token balance of account2',balanceBuyer['words'][0]);
        })

        it('post a buy order of 10 tokens, from account 2 ',async() =>{
          await exg.postSpotorder(10, customer1,web3.utils.toWei('0.1','Ether'),true, {from: customer2,value: web3.utils.toWei('1.3','Ether')});
        })

        it('cancel the order, from account 2 ',async() =>{
          await exg.cancelSpotorder(customer1, {from: customer2});
        })

    })

    describe('test future order', async()=>{



      it('post a sell order of 10 tokens, from account 1 ',async() =>{
        let block = await web3.eth.getBlock("latest")
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,block.number+10, {from: customer1});
      })
      it('take the sell order of 10 tokens, from account 2 ',async() =>{
        await exg.takeFutureorder(customer1,customer1, {from: customer2,value:web3.utils.toWei('1.3','Ether')});
      })

      it('post a buy order of 10 tokens, from account 1 ',async() =>{
        let block = await web3.eth.getBlock("latest")
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),true,block.number+10, {from: customer1,value:web3.utils.toWei('1.3','Ether')});
      })

      it('take the buy order of 10 tokens, from account 2 ',async() =>{
        await exg.takeFutureorder(customer1,customer1, {from: customer2,value:web3.utils.toWei('0.3','Ether')});
      })

      it('post a sell order of 10 tokens, from account 1 ',async() =>{
        let block = await web3.eth.getBlock("latest")
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,block.number+10, {from: customer1});
      })

      it('cancel the order that was posted',async() =>{
        await exg.cancelFutureorder(customer1, {from: customer1});
      })

      it('execute the contract owned by account 2 prematurely, from account 2, should fail because the expiry block number has not reached yet ',async() =>{
        await exg.executeFuturecontract({from: customer1}).should.be.rejected;
      })

      it('execute the contract owned by account 2, from account 1, should fail because account 1 is not the owner ',async() =>{
        await exg.executeFuturecontract(customer1,{from: customer1}).should.be.rejected;
      })

      it('execute the contract owned by account 2, from account 2 ',async() =>{
        let prebalanceBuyer = await exg.ownershipBook.call(customer1,customer2);
        console.log('token balance of account2,pre-execution',prebalanceBuyer['words'][0]);

        console.log('do something in order to add more blocks, so we are after the expiry');
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,999, {from: customer1});
        await exg.cancelFutureorder(customer1, {from: customer1});
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,999, {from: customer1});
        await exg.cancelFutureorder(customer1, {from: customer1});
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,999, {from: customer1});
        await exg.cancelFutureorder(customer1, {from: customer1});
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,999, {from: customer1});
        await exg.cancelFutureorder(customer1, {from: customer1});
        await exg.postFutureorder(10, customer1,web3.utils.toWei('0.1','Ether'),false,999, {from: customer1});
        await exg.cancelFutureorder(customer1, {from: customer1});
        console.log('10 blocks passed, so we are after the expiry');
        await exg.executeFuturecontract(customer1,{from: customer2});

        let postbalanceBuyer = await exg.ownershipBook.call(customer1,customer2);
        console.log('token balance of account2,post-execution',postbalanceBuyer['words'][0]);
      })
    })

    describe('test withdraw exchange fees', async()=>{

        it('should fail because sender is not owner of the exchange',async() =>{
          await exg.transfer2Owner({from: customer2}).should.be.rejected;
        })

        it('should succeed',async() =>{
          await exg.transfer2Owner({from: customer1});
        })

    })

});
