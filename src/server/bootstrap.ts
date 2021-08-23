import { ServerApp } from "./server-app";
import DotEnv from "dotenv";

DotEnv.config();


new ServerApp({
    port:7000
});

process.on("uncaughtException",(err)=>{
    console.error("uncaughtException",err);
})
process.on("unhandledRejection",(err)=>{
    console.error("unhandledRejection",err);
})
