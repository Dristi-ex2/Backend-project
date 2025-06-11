import mongoose,{ Schema } from "mongoose";

const subscriptionSchema=new Schema({
    subscription:{
        //one who is subscribing
        type:Schema.Types.ObjectId, //schema ek type dena aur woh type object ho
        ref:"User"
},

   channel:{
    type:Schema.Types.ObjectId,
    ref:"User"  //one to whom 'subscriber' is subscribing
}
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)