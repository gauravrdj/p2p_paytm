require('dotenv').config();
const mongoose=require('mongoose');
// const { Schema } = require('zod');

mongoose.connect(process.env.DATABASE_URL);

const userSchema=new mongoose.Schema({
    username: {
       type: String,
       required: true,
       unique: true,
       trim: true,
       lowercase: true,

    }, 
    
    password: {
      type: String,
      required: true,
   },

    firstName:{
       type: String,
       required:true,
       trim:true,
    },
    lastName: {
        type: String,
        required:true,
        trim:true,
    },
   

});

const accountSchema=new mongoose.Schema({
   balance: {
      type: Number,
      required: true,
    },
    userId :{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
});

//schema for black-listed-tokens
const blackSchema=new mongoose.Schema({
   token :{
      type:String,
 }
})
const user=mongoose.model('user', userSchema);
const account=mongoose.model('account', accountSchema);
const black=mongoose.model('black', blackSchema);
module.exports={user, account, black};