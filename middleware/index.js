const zod=require('zod');
const {user, black} = require('../db');
const {JWT_SECRET}=require('../config');
const jwt=require('jsonwebtoken');


//signup middleware

const signupZodSchema=zod.object({
        username: zod.string().email(),
        password: zod.string().min(8),
        firstName: zod.string(),
        lastName: zod.string(),
});

async function signupMiddleware(req,res,next){
    // console.log(req.body);
    const parsedData=await signupZodSchema.safeParse({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    });
    if(!parsedData.success){
        // console.log(parsedData.error);
        res.status(411).json({
            msg: "Invalid Input",
            
        });

    }
    else{
        //check whether user already exist or not
        const alreadyRegistered = await user.findOne({
            username: req.body.username,
        });
        if(alreadyRegistered){
            res.status(411).json({
                msg : "User already exists",
            });
            // alert('User Already Exists');
            // return;
        }
        else{
            next();
        }
    }
}

//signin middleware
const signinZodSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(8),
})
async function signinMiddleware(req,res,next){
      
    
    const parsedData=await signinZodSchema.safeParse({
        username: req.body.username,
        password: req.body.password,
    });
    if(!parsedData.success){
        res.status(411).json({
            msg: "Invalid Inputs",
            // error: parsedData.error,
        });

    }
    else{

    
   const checkUserData=await user.findOne({
    username: req.body.username,
    // password: req.body.password,
   });
   if(!checkUserData){
    res.status(411).json({
        msg: "User Not Exists, Please SignUp",
    });
   }
   else if(!checkUserData.password || checkUserData.password!==req.body.password){
    res.status(411).json({
        msg: "Wrong Credentials!",
    });
   }
   else{
    next();
   }
//    else{
//    const checkAlongPass=await user.findOne({
//     username:req.body.username,
//     password: req.body.password,
//    });
//      if(!checkAlongPass){
//         res.status(404).json({
//             msg: "Wrong Credentials!",
//         });
//      }
//    else{
//     next();
//    }
// }
} 
}
 
//auth middleware

async function authMiddleware(req, res, next){
       const authHeader=req.headers.authorization;
     if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(403).json({
            msg: "token not found!",
        });
     }
     authToken=authHeader.split(' ')[1];
     try{
      const isBlack=await black.findOne({
        token: authToken,
      });
      if(isBlack){
        res.status(411).json({
            msg: "Unauthorized Access"
        });
    }
    else{
        try{
        
            const verifiedToken=await jwt.verify(authToken, JWT_SECRET);
            //    res.status(200).json({
            //     userId: verifiedToken.userId,
            //    });
            req.userId=verifiedToken.userId;
               next();
         }
         catch(e){
            // console.log(e);
             res.status(403).json({
                msg: "Authentication failed",
             });
         }
    }
    
      }
      catch(e){
        // console.log(e);
               res.status(411).json({
                msg: "Some error occured while Authenticating",
               });
          }

    //  try{
        
    //     const verifiedToken=await jwt.verify(authToken, JWT_SECRET);
    //     //    res.status(200).json({
    //     //     userId: verifiedToken.userId,
    //     //    });
    //     req.userId=verifiedToken.userId;
    //        next();
    //  }
    //  catch(e){
    //     console.log(e);
    //      res.status(403).json({
    //         msg: "Authentication failed",
    //      });
    //  }
}


module.exports = {
    signupMiddleware,
   signinMiddleware,
   authMiddleware,
};