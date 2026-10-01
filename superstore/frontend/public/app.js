const $=s=>document.querySelector(s),E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rs=n=>'Rs. '+Number(n).toLocaleString();
let cats=[],products=[],cart=JSON.parse(localStorage.getItem('cart')||'[]'),token=localStorage.getItem('token'),user=null,deb;
async function api(p,o={}){const r=await fetch('/api'+p,{...o,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:o.body?JSON.stringify(o.body):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong');return d;}
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.remove('hidden');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),2200);};
const emoji=c=>(cats.find(x=>x.name===c)||{}).emoji||'🛍️';
const img=(p,cls='h-32')=>p.image?`<img src="${E(p.image)}" alt="${E(p.name)}" loading="lazy" class="${cls} w-full object-cover">`:`<div class="${cls} w-full grid place-items-center text-6xl bg-gradient-to-br from-brand-50 to-slate-100">${emoji(p.category)}</div>`;
const badge=p=>p.stock<=0?'<span class="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Out of stock</span>':p.stock<=10?`<span class="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Only ${p.stock} left</span>`:'<span class="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">In stock</span>';
function pcard(p,w=''){return`<div class="card bg-white rounded-2xl overflow-hidden shadow-sm fade ${w} ${p.stock<=0?'opacity-70':''}"><div class="relative cursor-pointer" onclick="openProduct('${p.id}')">${img(p)}${p.discount?`<span class="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">${p.discount}% OFF</span>`:''}</div>
 <div class="p-3"><p class="text-xs text-slate-400">${E(p.category)}</p><h3 class="font-semibold text-sm h-10 line-clamp-2 cursor-pointer" onclick="openProduct('${p.id}')">${E(p.name)}</h3><div class="my-1">${badge(p)}</div>
 <div class="flex items-end justify-between mt-2"><div><b class="text-brand-700">${rs(p.finalPrice)}</b>${p.discount?`<div class="text-xs line-through text-slate-400">${rs(p.price)}</div>`:''}</div>
 <button ${p.stock<=0?'disabled':''} onclick="addCart('${p.id}')" class="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white w-9 h-9 rounded-full text-xl transition" aria-label="Add to cart">+</button></div></div></div>`;}
async function loadProducts(){const g=$('#grid');g.innerHTML='<div class="sk h-64 rounded-2xl"></div>'.repeat(5);
 const q=new URLSearchParams({q:$('#search').value.trim(),category:$('#fCat').value,min:$('#fMin').value,max:$('#fMax').value,sort:$('#fSort').value,inStock:$('#fStock').checked});
 try{products=await api('/products?'+q);$('#resCount').textContent=products.length+' product(s) found';
  g.innerHTML=products.length?products.map(p=>pcard(p)).join(''):'<div class="col-span-full text-center py-16 text-slate-500"><p class="text-5xl mb-2">🔍</p><p class="font-semibold">No products found</p><p class="text-sm">Try a different search or reset filters.</p></div>';
  const off=products.filter(p=>p.discount>0&&p.stock>0).sort((a,b)=>b.discount-a.discount).slice(0,8);
  if(!$('#search').value&&!$('#fCat').value)$('#offerGrid').innerHTML=off.map(p=>pcard(p,'w-44 shrink-0')).join('');}
 catch(e){g.innerHTML=`<p class="col-span-full text-center text-red-600 py-10">${E(e.message)}</p>`;}}
async function init(){$('#yr').textContent=new Date().getFullYear();cats=await api('/categories');
 $('#fCat').innerHTML='<option value="">All categories</option>'+cats.map(c=>`<option>${E(c.name)}</option>`).join('');
 $('#cats').innerHTML=cats.map(c=>`<button onclick="pickCat('${E(c.name)}')" class="shrink-0 bg-white hover:bg-brand-50 hover:border-brand-500 border rounded-2xl px-5 py-3 text-center transition min-w-[110px]"><div class="text-3xl">${c.emoji}</div><div class="text-xs font-semibold mt-1">${E(c.name)}</div></button>`).join('');
 if(token)try{user=await api('/auth/me');}catch{token=null;localStorage.removeItem('token');}
 setAcc();await loadProducts();renderCart();}
window.pickCat=c=>{$('#fCat').value=c;loadProducts();$('#shop').scrollIntoView({behavior:'smooth'});};
['fCat','fMin','fMax','fSort','fStock'].forEach(i=>$('#'+i).addEventListener('change',loadProducts));
$('#search').addEventListener('input',()=>{clearTimeout(deb);deb=setTimeout(loadProducts,300);});
$('#fReset').onclick=()=>{['fCat','fMin','fMax','fSort','search'].forEach(i=>$('#'+i).value='');$('#fStock').checked=false;loadProducts();};
$('#menuBtn').onclick=()=>$('#mnav').classList.toggle('hidden');
// modal
const modal=h=>{$('#modalBox').innerHTML='<button onclick="closeModal()" class="absolute top-3 right-4 text-2xl">×</button>'+h;$('#modal').classList.replace('hidden','flex');$('#overlay').classList.remove('hidden');};
window.closeModal=()=>{$('#modal').classList.replace('flex','hidden');if($('#drawer').classList.contains('translate-x-full'))$('#overlay').classList.add('hidden');};
$('#overlay').onclick=()=>{closeModal();closeCart();};
window.openProduct=id=>{const p=products.find(x=>x.id===id);if(!p)return;
 modal(`<div class="rounded-xl overflow-hidden mb-4">${img(p,'h-56')}</div><p class="text-xs text-slate-400">${E(p.category)}</p><h2 class="text-2xl font-bold">${E(p.name)}</h2><div class="my-2 flex items-center gap-3"><b class="text-2xl text-brand-700">${rs(p.finalPrice)}</b>${p.discount?`<s class="text-slate-400">${rs(p.price)}</s><span class="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">${p.discount}% OFF</span>`:''}</div>${badge(p)}
 <p class="mt-3 text-slate-600">${E(p.description)}</p><div class="mt-3 bg-slate-50 rounded-xl p-3 text-sm"><b>Product details</b><p>${E(p.details)}</p><p class="text-slate-500 mt-1">Availability: ${p.stock>0?p.stock+' units':'Out of stock'}</p></div>
 <button ${p.stock<=0?'disabled':''} onclick="addCart('${p.id}');closeModal()" class="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl">${p.stock>0?'Add to Cart':'Currently Unavailable'}</button>`);};
// cart
const save=()=>{localStorage.setItem('cart',JSON.stringify(cart));renderCart();};
window.addCart=id=>{const p=products.find(x=>x.id===id);if(!p||p.stock<=0)return;const i=cart.find(x=>x.id===id);
 if(i){if(i.qty>=p.stock)return toast('Maximum stock reached');i.qty++;}else cart.push({id,qty:1});save();toast('Added to cart ✓');};
window.chg=(id,d)=>{const i=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);i.qty+=d;if(p&&i.qty>p.stock){i.qty=p.stock;toast('Maximum stock reached');}if(i.qty<=0)cart=cart.filter(x=>x.id!==id);save();};
window.rem=id=>{cart=cart.filter(x=>x.id!==id);save();};
const lines=()=>cart.map(c=>({c,p:products.find(x=>x.id===c.id)})).filter(x=>x.p);
function renderCart(){const L=lines();$('#cartCount').textContent=cart.reduce((s,c)=>s+c.qty,0);
 $('#cartItems').innerHTML=L.length?L.map(({c,p})=>`<div class="flex gap-3 items-center fade"><div class="w-16 h-16 rounded-lg overflow-hidden shrink-0">${img(p,'h-16')}</div><div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate">${E(p.name)}</p><p class="text-sm text-brand-700">${rs(p.finalPrice)}</p>
  <div class="flex items-center gap-2 mt-1"><button onclick="chg('${p.id}',-1)" class="w-7 h-7 rounded-full bg-slate-100">−</button><b>${c.qty}</b><button onclick="chg('${p.id}',1)" class="w-7 h-7 rounded-full bg-slate-100">+</button><button onclick="rem('${p.id}')" class="ml-auto text-red-500 text-sm">Remove</button></div></div></div>`).join(''):'<div class="text-center text-slate-500 mt-20"><p class="text-5xl">🛒</p><p class="mt-2">Your cart is empty</p></div>';
 const sub=L.reduce((s,{c,p})=>s+c.qty*p.finalPrice,0),del=sub>=3000||!sub?0:150;
 $('#cartFoot').innerHTML=L.length?`<div class="text-sm space-y-1"><div class="flex justify-between"><span>Subtotal</span><span>${rs(sub)}</span></div><div class="flex justify-between"><span>Delivery</span><span>${del?rs(del):'FREE'}</span></div><div class="flex justify-between font-bold text-lg"><span>Total</span><span>${rs(sub+del)}</span></div></div><button onclick="checkout()" class="mt-3 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl">Checkout</button>`:'';}
const openCart=()=>{$('#drawer').classList.remove('translate-x-full');$('#overlay').classList.remove('hidden');};
const closeCart=()=>{$('#drawer').classList.add('translate-x-full');if($('#modal').classList.contains('hidden'))$('#overlay').classList.add('hidden');};
$('#cartBtn').onclick=openCart;$('#cartClose').onclick=closeCart;
// checkout
window.checkout=async()=>{if(!user){closeCart();return authModal('Please log in to checkout');}
 try{var t=await api('/cart/price',{method:'POST',body:{items:cart}});}catch(e){return toast(e.message);}
 closeCart();modal(`<h2 class="text-xl font-bold mb-3">Checkout</h2><div class="bg-slate-50 rounded-xl p-3 text-sm mb-4">${t.lines.map(l=>`<div class="flex justify-between"><span>${l.qty} × ${E(l.name)}</span><span>${rs(l.qty*l.unit)}</span></div>`).join('')}<hr class="my-2"><div class="flex justify-between"><span>Delivery</span><span>${t.delivery?rs(t.delivery):'FREE'}</span></div><div class="flex justify-between font-bold"><span>Total</span><span>${rs(t.total)}</span></div></div>
 <form id="coForm" class="space-y-3"><input id="coPhone" required pattern="[0-9+\\-\\s]{7,15}" placeholder="Phone number" value="${E(user.phone)}" class="w-full border rounded-lg p-3"><textarea id="coAddr" required minlength="8" placeholder="Delivery address" class="w-full border rounded-lg p-3">${E(user.address)}</textarea>
 <select id="coPay" class="w-full border rounded-lg p-3"><option>Cash on Delivery</option><option>Credit/Debit Card (on delivery)</option><option>Easypaisa/JazzCash</option></select><p id="coErr" class="text-red-600 text-sm"></p><button class="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl">Place Order · ${rs(t.total)}</button></form>`);
 $('#coForm').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button');b.disabled=true;b.textContent='Placing order…';
  try{const o=await api('/orders',{method:'POST',body:{items:cart,address:$('#coAddr').value,phone:$('#coPhone').value,payment:$('#coPay').value}});cart=[];save();
   modal(`<div class="text-center py-6"><p class="text-6xl">🎉</p><h2 class="text-2xl font-bold mt-2">Order placed!</h2><p class="text-slate-600 mt-1">Order ID: <b>${E(o.id)}</b></p><p class="text-sm text-slate-500">Total ${rs(o.total)} · ${E(o.payment)}</p></div>`);loadProducts();}
  catch(err){$('#coErr').textContent=err.message;b.disabled=false;b.textContent='Place Order';}};};
// auth & profile
function setAcc(){$('#accLabel').textContent=user?user.name.split(' ')[0]:'Login';}
const accClick=()=>user?profile():authModal();$('#accBtn').onclick=accClick;$('#accBtn2').onclick=accClick;
function authModal(msg='',signup=false){modal(`<h2 class="text-xl font-bold mb-1">${signup?'Create account':'Welcome back'}</h2><p class="text-sm text-slate-500 mb-4">${E(msg)}</p><form id="auForm" class="space-y-3">${signup?'<input id="auName" required placeholder="Full name" class="w-full border rounded-lg p-3">':''}<input id="auEmail" type="email" required placeholder="Email" class="w-full border rounded-lg p-3"><input id="auPass" type="password" required minlength="8" placeholder="Password (8+ characters)" class="w-full border rounded-lg p-3"><p id="auErr" class="text-red-600 text-sm"></p><button class="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl">${signup?'Sign up':'Log in'}</button></form><p class="text-sm text-center mt-4">${signup?'Have an account?':'New here?'} <button class="text-brand-600 font-semibold" onclick="authModal('',${!signup})">${signup?'Log in':'Create account'}</button></p>`);
 $('#auForm').onsubmit=async e=>{e.preventDefault();try{const d=await api(signup?'/auth/signup':'/auth/login',{method:'POST',body:{name:signup?$('#auName').value:undefined,email:$('#auEmail').value,password:$('#auPass').value}});
  token=d.token;user=d.user;localStorage.setItem('token',token);setAcc();closeModal();toast('Welcome, '+user.name.split(' ')[0]+'!');}catch(err){$('#auErr').textContent=err.message;}};}
window.authModal=authModal;
async function profile(){let os=[];try{os=await api('/orders/mine');}catch{}
 modal(`<h2 class="text-xl font-bold mb-3">My Profile</h2><form id="prForm" class="space-y-3"><input id="prName" required value="${E(user.name)}" class="w-full border rounded-lg p-3"><input disabled value="${E(user.email)}" class="w-full border rounded-lg p-3 bg-slate-100"><input id="prPhone" value="${E(user.phone)}" placeholder="Phone" class="w-full border rounded-lg p-3"><textarea id="prAddr" placeholder="Address" class="w-full border rounded-lg p-3">${E(user.address)}</textarea><button class="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold">Save</button></form>
 <h3 class="font-bold mt-5 mb-2">My Orders</h3>${os.length?os.map(o=>`<div class="border rounded-xl p-3 mb-2 text-sm"><div class="flex justify-between"><b>${E(o.id)}</b><span class="text-brand-700 font-semibold">${E(o.status)}</span></div><p class="text-slate-500">${new Date(o.createdAt).toLocaleString()} · ${rs(o.total)}</p></div>`).join(''):'<p class="text-sm text-slate-500">No orders yet.</p>'}
 <button id="lo" class="mt-3 w-full border border-red-300 text-red-600 py-2 rounded-xl">Log out</button>`);
 $('#prForm').onsubmit=async e=>{e.preventDefault();try{user=await api('/users/me',{method:'PUT',body:{name:$('#prName').value,phone:$('#prPhone').value,address:$('#prAddr').value}});setAcc();toast('Profile saved');}catch(x){toast(x.message);}};
 $('#lo').onclick=()=>{token=null;user=null;localStorage.removeItem('token');setAcc();closeModal();};}
// chatbot
const QR=[['🛍️ Products','Which categories do you have?'],['🔥 Offers','Which products are on discount?'],['💰 Prices','Show me products under Rs. 500'],['✅ Availability','Which snacks are available?'],['📂 Categories','Show categories'],['❓ Help','__help']];
$('#quick').innerHTML=QR.map(([l,q])=>`<button data-q="${E(q)}" class="shrink-0 border border-brand-500 text-brand-700 rounded-full px-3 py-1 hover:bg-brand-50">${l}</button>`).join('');
const bubble=(t,me,ps=[])=>{const d=document.createElement('div');d.className='fade flex flex-col '+(me?'items-end':'items-start');
 d.innerHTML=`<div class="msg max-w-[85%] px-3 py-2 rounded-2xl ${me?'bg-brand-600 text-white rounded-br-sm':'bg-white shadow-sm rounded-bl-sm'}">${E(t)}</div>`+(ps.length?`<div class="flex gap-2 overflow-x-auto mt-1 max-w-full">${ps.map(p=>`<button data-p="${p.id}" class="shrink-0 bg-white border rounded-xl p-2 text-left text-xs w-32 hover:border-brand-500"><b class="line-clamp-1">${E(p.name)}</b><br>${rs(p.price)}<br>${p.stock>0?'<span class="text-brand-600">In stock</span>':'<span class="text-red-600">Out of stock</span>'}</button>`).join('')}</div>`:'');
 $('#chatLog').appendChild(d);$('#chatLog').scrollTop=1e9;return d;};
async function ask(q){if(!q)return;bubble(q,true);
 if(q==='__help'||/^help$/i.test(q))return bubble('I can help with: product prices, availability, discounts, categories, delivery charges, store timings, payments, returns and placing orders.\nTry: “Is milk available?”, “Cheapest shampoo?” or “Products under Rs. 500”.');
 const t=bubble('Typing…',false);try{const d=await api('/chat',{method:'POST',body:{message:q}});t.remove();bubble(d.reply,false,d.products||[]);}catch{t.remove();bubble('Sorry, I could not reach the store right now. Please try again or contact the store.',false);}}
$('#quick').onclick=e=>{const b=e.target.closest('button');if(b)ask(b.dataset.q);};
$('#chatLog').onclick=async e=>{const b=e.target.closest('[data-p]');if(!b)return;try{const p=await api('/products/'+b.dataset.p);if(!products.find(x=>x.id===p.id))products.push(p);openProduct(p.id);}catch(x){toast(x.message);}};
$('#chatForm').onsubmit=e=>{e.preventDefault();const v=$('#chatIn').value.trim();$('#chatIn').value='';ask(v);};
$('#chatBtn').onclick=()=>{$('#chat').classList.replace('hidden','flex');if(!$('#chatLog').children.length)bubble('Hi! 👋 I\'m the FreshMart assistant. Ask me about products, prices, stock, offers, delivery or orders.',false);};
$('#chatClose').onclick=()=>$('#chat').classList.replace('flex','hidden');
init();
