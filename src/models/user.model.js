import mongoose,{Schema} from mongoose;


const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
        lowercase:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true
    },

    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },

    avator:{
        type:String, //cloudinary url
        required:true
    },

    coverImage:{
        type:String, //cloudinary url

    },

    watchHistory:[
        {
            type:Schema.Type.ObjectId,  //since we have to store the history from videos thats why we are 
            // taking it in the form of array and we have to take id of obect from "video" model
            ref:"Video" //this means from Video we have to take 
        }
    ],

    password:{
        type:String,
        required:[true,'Password is required'] //if pass is not available then 'Password is required' should come
    },

    refreshToken:{
        type:String
    },

    
},

    {
        timestamps:true  //gives the createdAt and UpdatedAt
    }
)
//logic to encrypt the password:

// userSchema.pre("save",()=>{})  //in arrow function we cannot have access to this keyword that's why will write function
userSchema.pre("save",async function(next){
    if(!this.isModified('password')) return next();
    this.password=bcrypt.hash(this.password,10)  //save password
    next()
})

//to check pwd is correct or not
userSchema.methods.isPasswordCorrect=async function (password){
   return await bcrypt.compare(password,this.password)
}


//method to generate tokens
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//to generate refreh token
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this.id,
        
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}




export const User=mongoose.model("User",userSchema)
//Now notice that we are using "const User"..User is capital letter because it will go to refernce so necessary to keep in capital letter
//then its telling mongoose ek model bnake dena User mai from "userSchema"
