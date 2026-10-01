// Simple file-based database. Swap this module for MongoDB/Supabase without touching routes.
const fs=require('fs'),path=require('path');
const FILE=path.join(__dirname,'data.json');
const cats=[['Grocery','🛒'],['Beverages','🥤'],['Snacks','🍿'],['Dairy','🥛'],['Bakery','🥖'],['Fruits & Vegetables','🍎'],['Personal Care','🧴'],['Household Items','🧽'],['Electronics','🔌']];
const items=[ // name,category,price,discount,stock,description
['Basmati Rice 5kg','Grocery',1850,10,40,'Premium aged long-grain basmati rice.'],['Sunflower Cooking Oil 3L','Grocery',2100,5,25,'Light, heart-friendly cooking oil.'],['Tapal Danedar Tea 430g','Grocery',690,0,60,'Strong, rich black tea blend.'],
['Coca Cola 1.5L','Beverages',220,0,120,'Chilled-ready classic cola.'],['Pepsi 1.5L','Beverages',210,5,0,'Refreshing cola drink.'],['Nestle Pure Life Water 1.5L','Beverages',90,0,200,'Purified drinking water.'],
['Lays Classic Chips','Snacks',60,0,150,'Crispy salted potato chips.'],['Oreo Biscuits','Snacks',80,15,90,'Chocolate sandwich cookies.'],['Kurkure Masala','Snacks',50,0,8,'Spicy crunchy corn snack.'],
['Nestle Milk Pack 1L','Dairy',290,0,80,'UHT full-cream milk.'],['Olpers Butter 200g','Dairy',480,10,30,'Creamy salted butter.'],['Nestle Yogurt 400g','Dairy',210,0,0,'Fresh set yogurt.'],
['White Bread Large','Bakery',140,0,35,'Soft sliced sandwich bread.'],['Chocolate Cake Slice','Bakery',250,20,12,'Moist chocolate sponge cake.'],['Butter Croissant','Bakery',120,0,20,'Freshly baked flaky croissant.'],
['Red Apples 1kg','Fruits & Vegetables',360,10,50,'Crisp, sweet Kashmiri apples.'],['Bananas 1 Dozen','Fruits & Vegetables',190,0,45,'Naturally ripened bananas.'],['Fresh Tomatoes 1kg','Fruits & Vegetables',120,0,70,'Farm-fresh tomatoes.'],
['Sunsilk Shampoo 400ml','Personal Care',620,15,40,'Smooth & silky hair shampoo.'],['Head & Shoulders Shampoo 360ml','Personal Care',780,0,22,'Anti-dandruff shampoo.'],['Lifebuoy Soap 3-Pack','Personal Care',270,0,100,'Germ-protection soap.'],
['Surf Excel Detergent 1kg','Household Items',560,10,55,'Tough stain removal powder.'],['Harpic Toilet Cleaner 500ml','Household Items',340,0,0,'Powerful toilet cleaner.'],['Dishwash Liquid 750ml','Household Items',310,5,48,'Grease-cutting dishwash liquid.'],
['USB-C Fast Charger 20W','Electronics',1500,20,18,'Fast wall charger with cable.'],['Wireless Earbuds','Electronics',3500,25,10,'Bluetooth 5.3 earbuds.'],['LED Bulb 12W (2-Pack)','Electronics',450,0,75,'Energy-saving LED bulbs.']];
let d;
function seed(){return{
 categories:cats.map((c,i)=>({id:'c'+(i+1),name:c[0],emoji:c[1]})),
 products:items.map((p,i)=>({id:'p'+(i+1),name:p[0],category:p[1],price:p[2],discount:p[3],stock:p[4],description:p[5],details:'Brand-quality item. Check packaging for expiry/warranty details.',image:''})),
 users:[],orders:[],
 settings:{timings:'Daily 8:00 AM – 11:00 PM',delivery:'Delivery charge Rs. 150. Free delivery on orders above Rs. 3,000. Delivery within 2–4 hours.',payment:'Cash on Delivery, Credit/Debit Card and Easypaisa/JazzCash.',returns:'Unopened items can be returned within 7 days; perishable items must be reported within 24 hours of delivery.',contact:'Call 051-1234567 or email support@freshmart.pk'}};}
function save(){fs.writeFileSync(FILE,JSON.stringify(d,null,1));}
function load(){d=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE,'utf8')):seed();save();return d;}
load();
module.exports={get:()=>d,save,uid:p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6),final:p=>Math.round(p.price*(1-(p.discount||0)/100))};
