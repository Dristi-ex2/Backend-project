//code for connecting database

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB=async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MONGODB connected !! DB HOST: ${connectionInstance.connection.host}`) //it will show kaun 
        // se host mai coonect ho rhi hu because aisa ho skta h mai glti se kahi aur connect ho jaye
        
    } catch (error) {
        console.log("MONGODB connection error",error);
        process.exit(1); //exit is a method in nodejs
        
    }
}

export default connectDB;