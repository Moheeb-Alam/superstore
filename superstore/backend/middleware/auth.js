const jwt=require('jsonwebtoken'),db=require('../db');
const secret=()=>process.env.JWT_SECRET||'dev-secret-change-me';
exports.sign=u=>jwt.sign({id:u.id,role:u.role},secret(),{expiresIn:'7d'});
exports.auth=(req,res,next)=>{try{const t=(req.headers.authorization||'').replace('Bearer ','');const p=jwt.verify(t,secret());const u=db.get().users.find(x=>x.id===p.id);if(!u)throw 0;req.user=u;next();}catch{res.status(401).json({error:'Please log in.'});}};
exports.admin=(req,res,next)=>req.user&&req.user.role==='admin'?next():res.status(403).json({error:'Admin access required.'});
exports.errorHandler=(err,req,res,next)=>{console.error(err);res.status(err.status||500).json({error:err.message||'Server error'});};
