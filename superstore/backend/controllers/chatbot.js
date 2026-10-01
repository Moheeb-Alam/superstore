// Rule-based chatbot that ONLY answers from live database data.
const db=require('../db');
const STOP=new Set('a an the is are do does did you your have has any me my i we of for in on at to it this that what which how much many show tell about price prices cost costs available availability stock there with can get want need please products product items item currently now got sell selling'.split(' '));
const has=(q,...w)=>w.some(x=>q.includes(x));
const card=p=>({id:p.id,name:p.name,price:db.final(p),original:p.price,discount:p.discount,stock:p.stock,category:p.category});
const status=p=>p.stock<=0?'❌ Out of stock':p.stock<=10?`⚠️ Low stock (${p.stock} left)`:'✅ In stock';
const line=p=>`${p.name} — Rs. ${db.final(p)}${p.discount?` (${p.discount}% off, was Rs. ${p.price})`:''} · ${status(p)}`;
const list=(r,title,arr,n=6)=>({reply:`${title}\n`+arr.slice(0,n).map(p=>'• '+line(p)).join('\n')+(arr.length>n?`\n…and ${arr.length-n} more.`:''),products:arr.slice(0,n).map(card)});
function match(q,P){
 const toks=q.replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(t=>t&&!STOP.has(t)&&!/^\d+$/.test(t));
 const stem=t=>t.replace(/(es|s)$/,'');
 const scored=P.map(p=>{const n=p.name.toLowerCase();return{p,s:toks.filter(t=>n.includes(t)||n.includes(stem(t))).length};}).filter(x=>x.s>0);
 if(!scored.length)return[];const max=Math.max(...scored.map(x=>x.s));
 if(max<Math.ceil(toks.length/2))return[];
 return scored.filter(x=>x.s===max).map(x=>x.p);
}
exports.answer=msg=>{
 const D=db.get(),P=D.products,C=D.categories,S=D.settings,q=String(msg||'').toLowerCase().trim().slice(0,300);
 if(!q)return{reply:'Please type a question and I will do my best to help.'};
 if(/^(hi|hello|hey|salam|assalam)/.test(q))return{reply:'Hello! 👋 Welcome to FreshMart. Ask me about prices, availability, offers, delivery or orders.'};
 if(has(q,'deliver','shipping'))return{reply:'🚚 '+S.delivery};
 if(has(q,'timing','open','close','hours'))return{reply:'🕒 Store timings: '+S.timings};
 if(has(q,'payment','pay ','card','cash','easypaisa','jazzcash'))return{reply:'💳 We accept: '+S.payment};
 if(has(q,'return','refund','exchange'))return{reply:'↩️ '+S.returns};
 if(has(q,'place an order','how can i order','how to order','how do i order','how can i place'))return{reply:'🛍️ To order: 1) Browse or search products, 2) tap “Add to cart”, 3) open your cart and press Checkout, 4) log in, enter your address and choose a payment method.'};
 if(has(q,'track','my order','order status'))return{reply:'📦 Open Profile → My Orders to see the status of your orders. For other help: '+S.contact};
 if(has(q,'contact','phone','support','complain'))return{reply:'📞 '+S.contact};
 const m=q.match(/(?:under|below|less than|within|upto|up to|max)\s*(?:rs\.?|₹)?\s*(\d+)/);
 if(m){const r=P.filter(p=>db.final(p)<=+m[1]&&p.stock>0).sort((a,b)=>db.final(a)-db.final(b));
  return r.length?list(0,`Available products under Rs. ${m[1]}:`,r):{reply:`I couldn't find any in-stock products under Rs. ${m[1]}.`};}
 if(has(q,'discount','offer','sale','deal')){const r=P.filter(p=>p.discount>0&&p.stock>0).sort((a,b)=>b.discount-a.discount);
  return r.length?list(0,'🔥 Current offers:',r,8):{reply:'There are no active discounts right now.'};}
 if(/categor/.test(q))return{reply:'We have: '+C.map(c=>c.emoji+' '+c.name).join(', ')+'. Ask e.g. “Which snacks are available?”'};
 const cheap=has(q,'cheapest','lowest','least expensive');
 const hit=match(q,P);
 const cat=C.find(c=>c.name.toLowerCase().split(/\W+/).filter(w=>w.length>2&&w!=='and').some(w=>q.includes(w)||q.includes(w.replace(/s$/,''))));
 if(hit.length){
  if(cheap){const r=hit.filter(p=>p.stock>0).sort((a,b)=>db.final(a)-db.final(b));return r.length?{reply:'Cheapest available option: '+line(r[0]),products:[card(r[0])]}:{reply:'Those items are currently out of stock.'};}
  if(hit.length===1){const p=hit[0];
   if(p.stock<=0){const alt=P.filter(x=>x.category===p.category&&x.stock>0&&x.id!==p.id).slice(0,3);
    return{reply:`Sorry, ${p.name} is currently out of stock.`+(alt.length?'\nSimilar available items:\n'+alt.map(a=>'• '+line(a)).join('\n'):''),products:alt.map(card)};}
   return{reply:`${line(p)}\n${p.description}`,products:[card(p)]};}
  return list(0,'I found these matches:',hit);}
 if(cat){let r=P.filter(p=>p.category===cat.name);if(cheap)r=r.sort((a,b)=>db.final(a)-db.final(b));
  const av=r.filter(p=>p.stock>0);return av.length?list(0,`${cat.emoji} Available in ${cat.name}:`,av):{reply:`All ${cat.name} items are currently out of stock.`};}
 return{reply:`I'm sorry, I couldn't find that information. Please contact the store: ${S.contact}`};
};
