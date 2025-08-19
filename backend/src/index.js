import connectDB from "./db/index.js";
import dotenv from "dotenv";
import app from "./app.js"


dotenv.config()


connectDB()
    .then(() => {
        app.on("Error", (Error) => {
            console.log("Error :", Error);

        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((error) => {
        console.log(`Database Connection failed:${error} `);
    })








// require('dotenv').config({path:'/.env'});
// import mongoose from "mongoose";
// import {DB_NAME} from "./constants"
// import express from "express";
// const app = express();

// (async() =>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on("error", (error)=>{
//         console.log("Error:",error);
//         throw error;
//        })
//        app.listen(process.env.PORT, ()=>{
//         console.log(`Server is running on port ${process.env.PORT}`)
//        })
//     } catch (error) {
//         throw error
//     }
// })()