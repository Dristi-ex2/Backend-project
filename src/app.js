//creating and export app
import cookieParser from "cookie-parser"
import express from "express"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"})) 
//1.Parses incoming JSON requests.
//2.Limits request body size to 16 kilobytes.


app.use(express.urlencoded({extended:true,limit:"16kb"})) 
//1.Parses URL-encoded data (from HTML forms).
//2.extended: true allows nested objects and arrays.
//3.Limits size to 16 kilobytes.


app.use(express.static("public"))
//Serves static files (like HTML, CSS, images) from the public folder.

app.use(cookieParser()) //This line allows your app to read cookies sent by the user’s browser.

//Think of it like this:
// When someone visits your website, their browser might send cookies (small pieces of data).
// cookieParser() unpacks those cookies, so you can easily use them in your code.

export {app}