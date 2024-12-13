import prisma from "./../prisma/index.js"
import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import upload from "../middleware/multer.js"
import { fileURLToPath } from "url";
import path from "path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config()

const router = express.Router()

const jwt_token = process.env.JWT_SECRET; 
if(!jwt_token){
    console.log("jwtSecrety is not provided")
} 

router.post("/signup",upload.single('profileImg'), async(req, res) => {
    try {
        const {userName, fullName, password} = req.body;

        const profileImg = req.file ? `${req.file.filename}` : null
        

        if(!userName || !password) {
            return res.status(400).json({error:"required field"})
        }
        
        const existingUser = await prisma.user.findUnique({where:{userName}})

        if(existingUser){
            return res.status(401).json({ error: "User already exists" });
        }

        const hassedPasword = await bcrypt.hash(password,10)
        
        const newUser = await prisma.user.create({
            data:{
                userName,
                fullName,
                password:hassedPasword,
                profileImg,
            }
        })

        const token = jwt.sign({ userId: newUser.id }, jwt_token, {
          expiresIn: "7d",
        });

         res.status(201).json({user:{
              id: newUser.id,
              fullName: newUser.fullName,
              userName: newUser.userName,
              profileImg:newUser.profileImg || null,
              token:token
            }});
        
        
    } catch (error) {
          console.error("Error creating user:", error);
          return res.status(500).json({ error: "internal server error" });
    }
})

router.post("/login",async(req,res) => {
    try {
        const {userName,password} = req.body;
        
        const existingUser = await prisma.user.findFirst({
            where:{
                userName
            }
        })

        if(!existingUser){return res.status(401).json({error:"user Not found"})}

        const isValidPassword = await bcrypt.compare(password,existingUser.password)

        if(!isValidPassword){return res.status(401).json({ error: "wrong password" });}

        const token = jwt.sign({ userId: existingUser.id }, jwt_token,{expiresIn:"7d"});
       
        res.status(201).json({user:{
            id:existingUser.id,
            userName:existingUser.userName,
            fullName:existingUser.fullName,
            profileImg:existingUser.profileImg,
            token:token
        }})

    } catch (error) {
         console.error("Error creating user:", error);
         return res.status(500).json({ error: "internal server error" });
    }
})


export default router 