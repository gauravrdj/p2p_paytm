const express=require('express');
const {user,account}=require('../db');
const { authMiddleware } = require('../middleware');
const mongoose=require('mongoose');
const router=express.Router();

router.get('/balance',authMiddleware,async (req,res)=>{
// const id=req.userId;
const userAccount=await account.findOne({
    userId: req.userId,
});

// console.log(userAccount);
res.status(200).json({
    balance: userAccount.balance,
});

});

router.post('/transfer', authMiddleware ,async (req,res)=>{
   

   //start a mongoose session to prevent a same time transaction conflict
   const session=await mongoose.startSession();

   session.startTransaction();
     const {amount, to}=req.body;
     //fetching the account detail of user
     const userAccount=await account.findOne({
        userId: req.userId,
     }).session(session);

     //checking the sufficient balance 
     if(!userAccount || userAccount.balance<amount || amount<=0){
        await session.abortTransaction();
        if(amount<=0){
            res.status(422).json({
                msg :"Please Enter Some Real Amount",
            });
        }
        else{
        res.status(422).json({
            msg: "Insufficient Balance!",
        });
    }
          return;
     }
     //checking the existance of the receiver's account
     const toAccount=await account.findOne({
        userId:to,
     }).session(session);
     if(!toAccount){
        await session.abortTransaction();
        res.status(422).json({
            msg: "Invalid account",
        });
        return;
     }
     //every thing is fine untill than perform the transaction

     //deducting the amount from sender
     await account.updateOne({
        userId: req.userId,
     }, {
        $inc : {
            balance: -amount,
        }
     }).session(session);

//adding the amount to receiver
 await account.updateOne({
    userId: to,
 }, {
    $inc: {
        balance: amount,
    }
 }).session(session);

//commit the transaction
await session.commitTransaction();
res.status(200).json({
    msg: "Transfer Successful",
});

});


module.exports={
    accountRouter:router,
};