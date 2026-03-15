// server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(helmet());
app.use(morgan("dev"));

app.use(cors({
  origin: "*",
  methods: ["GET","POST","DELETE"]
}));

app.use(express.json({limit:"10kb"}));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/",(req,res)=>{
  res.json({message:"Wedding RSVP API running"});
});

/* ================= LOGIN LIMIT ================= */

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message:{
    error:"Too many login attempts. Try later."
  }
});

/* ================= ADMIN LOGIN ================= */

app.post("/admin/login", loginLimiter, async (req,res)=>{

  const {username,password} = req.body;

  if(!username || !password){
    return res.status(400).json({error:"Username and password required"});
  }

  try{

    const {data,error} = await supabase
      .from("admins")
      .select("*")
      .eq("username",username);

    if(error) throw error;

    if(!data.length){
      return res.status(401).json({error:"Invalid login"});
    }

    const admin = data[0];

    const validPassword = await bcrypt.compare(password,admin.password);

    if(!validPassword){
      return res.status(401).json({error:"Invalid login"});
    }

    const token = jwt.sign({
      admin_id:admin.id,
      username:admin.username
    },JWT_SECRET,{
      expiresIn:"2h"
    });

    res.json({
      message:"Login success",
      token
    });

  }catch(err){

    console.error(err);

    res.status(500).json({
      error:"Server error"
    });

  }

});

/* ================= AUTH ================= */

function verifyToken(req,res,next){

  const authHeader = req.headers.authorization;

  if(!authHeader){
    return res.status(403).json({error:"Token required"});
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token,JWT_SECRET,(err,decoded)=>{

    if(err){
      return res.status(401).json({error:"Invalid token"});
    }

    req.admin = decoded;

    next();

  });

}

/* ================= RSVP ================= */

app.post("/rsvp", async (req,res)=>{

  const {name,phone,guest_count,message} = req.body;

  if(!name || !phone || !guest_count){
    return res.status(400).json({
      error:"Missing fields"
    });
  }

  try{

    const {error} = await supabase
      .from("guests")
      .insert([{
        name,
        phone,
        guest_count,
        message
      }]);

    if(error) throw error;

    res.json({
      message:"RSVP submitted"
    });

  }catch(err){

    console.error(err);

    res.status(500).json({
      error:"Failed to save RSVP"
    });

  }

});

/* ================= GET RESPONSES ================= */

app.get("/responses",verifyToken,async(req,res)=>{

  try{

    const {data,error} = await supabase
      .from("guests")
      .select("*")
      .order("id",{ascending:false});

    if(error) throw error;

    res.json(data);

  }catch(err){

    res.status(500).json({
      error:"Failed to fetch"
    });

  }

});

/* ================= DELETE ================= */

app.delete("/guest/:id",verifyToken,async(req,res)=>{

  const {id} = req.params;

  try{

    const {error} = await supabase
      .from("guests")
      .delete()
      .eq("id",id);

    if(error) throw error;

    res.json({
      message:"Guest deleted"
    });

  }catch(err){

    res.status(500).json({
      error:"Delete failed"
    });

  }

});

/* ================= STATS ================= */

app.get("/stats",verifyToken,async(req,res)=>{

  try{

    const {count,error} = await supabase
      .from("guests")
      .select("*",{count:"exact",head:true});

    if(error) throw error;

    res.json({
      total_rsvp:count
    });

  }catch(err){

    res.status(500).json({
      error:"Stats error"
    });

  }

});

app.listen(PORT,()=>{
  console.log(`Server running on ${PORT}`);
});