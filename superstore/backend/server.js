require('dotenv').config({path:require('path').join(__dirname,'../.env')});
const express=require('express'),helmet=require('helmet'),cors=require('cors'),rate=require('express-rate-limit'),path=require('path'),bcrypt=require('bcryptjs');
const db=require('./db'),{errorHandler}=require('./middleware/auth');
const app=express();
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'","'unsafe-inline'","https://cdn.tailwindcss.com"],styleSrc:["'self'","'unsafe-inline'"],imgSrc:["'self'","data:"],connectSrc:["'self'"]}}}));
app.use(cors({origin:false}));app.use(express.json({limit:'100kb'}));
app.use('/api',rate({windowMs:60000,limit:200}));
app.use('/api/auth',rate({windowMs:900000,limit:30}));
app.use('/api',require('./routes/api'));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));
app.use(express.static(path.join(__dirname,'../frontend/public')));
app.use('/api',(q,r)=>r.status(404).json({error:'Not found'}));
app.use(errorHandler);
const D=db.get(),email=(process.env.ADMIN_EMAIL||'admin@freshmart.pk').toLowerCase();
if(!D.users.some(u=>u.email===email)){D.users.push({id:db.uid('u'),name:'Store Admin',email,password:bcrypt.hashSync(process.env.ADMIN_PASSWORD||'Admin@12345',10),role:'admin',phone:'',address:''});db.save();}
app.listen(process.env.PORT||3000,()=>console.log('FreshMart running on http://localhost:'+(process.env.PORT||3000)));
