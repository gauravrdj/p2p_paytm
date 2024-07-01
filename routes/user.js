const express=require('express');
const {user, account, black}=require('../db');
const jwt=require('jsonwebtoken');
const {JWT_SECRET}=require('../config');
const {signupMiddleware, signinMiddleware, authMiddleware} = require('../middleware/index');
const zod=require('zod');
const router=express.Router();
// router.use(express.json());

//signup route
router.post('/signup', signupMiddleware, async (req,res)=>{
    try{
 const userData= await user.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
 });
 //initialising the account with some random balance
 const userId=userData._id;
     await account.create({
      userId:userId,
      balance: 1+Math.random()*1000,
     });
 const jwtToken= jwt.sign({
    userId: userData._id ,
 }, JWT_SECRET);
 res.status(200).json({
    msg:"user created successfully!",
    token:jwtToken,
    //change
    username: req.body.username,
    firstName: req.body.firstName,
 });
}
catch(e){
   // console.log(e);
    res.status(411).json({
        msg: "Some error occured while creating user, please check inputs",
    });
}


});

//sign in route
router.post('/signin', signinMiddleware, async (req,res)=>{
    const userdata=await user.findOne({
        username:req.body.username,
    });
       const signinToken=await jwt.sign({
        userId: userdata._id,
       }, JWT_SECRET);
       
       res.status(200).json({
        token: signinToken,
        //changes
        firstName : userdata.firstName,
        username:userdata.username,
       });
});

//updating firstName, lastName, password: optionally by user
router.put('/', authMiddleware, async (req,res)=>{
  const updatingDataSchema=zod.object({
   password: zod.string().min(8).optional(),
   firstName: zod.string().optional(),
   lastName: zod.string().optional(),
  });

const dataToUpdate=req.body;
const parsedDataToUpdate=await updatingDataSchema.safeParse(dataToUpdate);
if(!parsedDataToUpdate.success){
   res.status(403).json({
      msg: "invalid inputs",
   });
}
 await user.findOneAndUpdate({
   //error point
   _id:req.userId,
 }, 
 {
   $set : dataToUpdate
 })
 res.status(200).json({
   msg: "Updated successfully",
 });
});

//getting friend list on app to send payment
//review the syntax 
router.get('/bulk', async (req,res)=>{ 
   // console.log(req.query.filter);
const newFilter=req.query.filter || "";
 const allUsers=await user.find({
   $or: [{
      firstName:{
         "$regex": newFilter,
         "$options" : "i",
      }
   },{
      lastName: {
         "$regex": newFilter,
         "$options" : "i",
      }
   }]
 });
//  console.log(allUsers);
 res.json({
   user: allUsers.map((ele)=>({ 
      username:ele.username,
      firstName:ele.firstName,
     lastName: ele.lastName,
     _id: ele._id,
   }))
 });
});

router.post('/black', async (req,res)=>{
   try{
       await black.create({
         token: req.body.token,
       });
       res.json({
         msg: "token-black listed",
       });
   }
   catch(e){
        console.log("Error while black-listing token");
   }
})

module.exports={
   userRouter: router,
};