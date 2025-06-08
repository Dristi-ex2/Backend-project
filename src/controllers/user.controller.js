import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

//we have created asyncHandler in utils so that we dont need 
//to write try-catch and promises again andagain we use call 
//it as we call it in this controller file and use it

//code to register a user
const registerUser= asyncHandler(async (req,res)=>{

    // Step 1: get user details from frontend
    const {fullName,email,username,password}=req.body
    // console.log("email:",email)

    //Step 2: validation-not empty
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"FullName is required")
    }

    //Step 3: check if user already exists: username,email
    const existedUser=await User.find({
        $or:[{ username },{ email }]
    })
    if(existedUser.length>0){
        throw new ApiError(409,"User with email or username already exist");
    }

    // console.log(req.files)
    //Step 4:check for images,check for avatar
    const avatarLocalPath=req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if(req.files&&Array.isArray(req.files.coverImage)&&req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    //Step 5: upload them to cloudinary,avatar is uploaded or not
   const avatar=await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    //Step 6: create user object-create entry in db
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
 
    //Step 7: remove password and refresh token filed from response
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    ) //to check user is created or not

    //Step 8: check for user creation
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

   //Step 9: if user created return res else return error
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered sucessfully")
   )

})

export {registerUser}


   // Step 1: get user details from frontend
    //Step 2: validation-not empty
    //Step 3: check if user already exists: username,email
    //Step 4:check for images,check for avatar
    //Step 5: upload them to cloudinary,avatar is uploaded or not
    //Step 6: create user object-create entry in db
    //Step 7: remove password and refresh token filed from response
    //Step 8: check for user creation
    //Step 9: if user created return res else return error