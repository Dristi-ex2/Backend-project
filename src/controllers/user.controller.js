import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//we have created asyncHandler in utils so that we dont need
//to write try-catch and promises again and again we just call
//it as we have called it in this controller file and use it

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId); //user is getting based on userId
    const accessToken = user.generateAccessToken(); //getting access token by calling generateAccessToken() method from user as user
    // contains all data
    const refreshToken = user.generateRefreshToken(); //getting refresh token by calling generateRefreshToken() method from user

    user.refreshToken = refreshToken; //extracting refreshToken from database using user and making it equal to the user refreshToken
    await user.save({ validateBeforeSave: false }); //in this step refreshToken gets saved in database

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong  while generating refersh and access Token"
    );
  }
};

//code to register a user
const registerUser = asyncHandler(async (req, res) => {
  // Step 1: get user details from frontend
  const { fullName, email, username, password } = req.body;
  // console.log("email:",email)

  //Step 2: validation-not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(
      400,
      "All fields (fullName, email, username, password) are required"
    );
  }

  //Step 3: check if user already exists: username,email
  const existedUser = await User.find({
    $or: [{ username }, { email }],
  });
  if (existedUser.length > 0) {
    throw new ApiError(409, "User with email or username already exist");
  }

  // console.log(req.files)
  //Step 4:check for images,check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath= req.files?.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Step 5: upload them to cloudinary,avatar is uploaded or not
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  //    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Step 6: create user object-create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  //Step 7: remove password and refresh token filed from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //to check user is created or not

  //Step 8: check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  //Step 9: if user created return res else return error
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered sucessfully"));
});

//code to login user
const loginUser = asyncHandler(async (req, res) => {
  //Step 1: bring data from req body:req body->data
  const { username, password, email } = req.body;

  //Step 2: username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  //Step 3: find the user
  const user = await User.findOne({
    $or: [{ username }, { email }], //find user by either email or username
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //Step 4: if user then check password

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //Step 5: access and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  //Step 6: send cookie
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //optional step
  //select m woh field likho jo nhi chahiye

  const options = {
    httpOnly: true,
    secure: true,
  };
  //while writing options,only modify by server not frontend

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//code to logged out user
//Step 1:update user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  //Step 2:
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

//code for refreshaccessToken
const refreshAccessToken=asyncHandler(async(req,res)=>{
    //Step1 
   const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
   }

   //Step2 :verify whether user refreshtoken is same as refreshtoken stored in out db
  try {
     const decodedToken=jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
     )
  
     const user= await User.findById(decodedToken?._id);
  
     if(!user){
      throw new ApiError(401,"Invalid refresh token")
     }
  
     if(incomingRefreshToken!==user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
     }
  
     const options={
      httpOnly:true,
      secure:true
     }
  
     const {accessToken,newrefreshToken}=await generateAccessTokenAndRefreshToken(user._id)
     return res
     .status
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
      new ApiResponse(
          200,
          {accessToken,refreshToken:newrefreshToken},
          "AccessToken refreshed"
      )
     )
  } catch (error) {
    throw new ApiError(401,error?.message|| "Invalid refresh Token")
  }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };














//regiterUser

// Step 1: get user details from frontend
//Step 2: validation-not empty
//Step 3: check if user already exists: username,email
//Step 4:check for images,check for avatar
//Step 5: upload them to cloudinary,avatar is uploaded or not
//Step 6: create user object-create entry in db
//Step 7: remove password and refresh token filed from response
//Step 8: check for user creation
//Step 9: if user created return res else return error

//Loginregister

//Step 1: bring data from req body:req body->data
//Step 2: username or email
//Step 3: find the user
//Step 4: is user then check password
//Step 5: access and refresh token
//Step 6: send cookie
