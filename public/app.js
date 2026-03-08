const state = {
  menu: [],
  categories: [],
  settings: { gstRate: 0.05, intraState: true, serviceChargeRate: 0, roundOff: true, currency: 'INR' },
  cart: []
};

const els = {
  grid: document.getElementById('menuGrid'),
  search: document.getElementById('search'),
  category: document.getElementById('categoryFilter'),
  refresh: document.getElementById('refreshBtn'),
  cartList: document.getElementById('cartList'),
  clearOrder: document.getElementById('clearOrder'),
  discount: document.getElementById('discountInput'),
  subTotal: document.getElementById('subTotal'),
  serviceCharge: document.getElementById('serviceCharge'),
  cgst: document.getElementById('cgst'),
  sgst: document.getElementById('sgst'),
  igst: document.getElementById('igst'),
  roundOff: document.getElementById('roundOff'),
  grandTotal: document.getElementById('grandTotal'),
  payBtn: document.getElementById('payBtn'),
  printBtn: document.getElementById('printBtn'),
  modal: document.getElementById('paymentModal'),
  closePay: document.getElementById('closePay'),
  amountDue: document.getElementById('amountDue'),
  payMode: document.getElementById('payMode'),
  paidAmount: document.getElementById('paidAmount'),
  changeAmt: document.getElementById('changeAmt'),
  completePay: document.getElementById('completePay'),
  printArea: document.getElementById('printArea')
};

async function init(){
  await Promise.all([loadMenu(), loadSettings()]);
  setupSocket();
  mountHandlers();
  renderMenu();
  restoreCart();
  renderCart();
}

function setupSocket(){
  const socket = io();
  socket.on('menu:update', data => {
    state.menu = data.filter(x => x.available !== false);
    state.categories = [...new Set(state.menu.map(x => x.category))];
    populateCategories();
    renderMenu();
  });
}

async function loadMenu(){
  const res = await fetch('/api/menu'); const data = await res.json();
  state.menu = data.menu.filter(x => x.available !== false);
  state.categories = [...new Set(state.menu.map(x => x.category))];
  populateCategories();
}
async function loadSettings(){
  const res = await fetch('/api/settings'); state.settings = await res.json();
}

function populateCategories(){
  els.category.innerHTML = '<option value="">All Categories</option>' + state.categories.map(c=>`<option>${c}</option>`).join('');
}

function renderMenu(){
  const q = (els.search.value || '').toLowerCase();
  const cat = els.category.value;
  const list = state.menu.filter(m => (cat ? m.category === cat : true) && m.name.toLowerCase().includes(q));
  els.grid.innerHTML = list.map(item => `
    <div class="card">
      <h4>${item.name}</h4>
      <div class="tag">${item.category}</div>
      <div class="price">₹${fmt2(item.price)}</div>
      <button data-id="${item.id}">Add</button>
    </div>`).join('');
  els.grid.querySelectorAll('button').forEach(btn => btn.onclick = () => addToCart(btn.dataset.id));
}

function addToCart(id){
  const m = state.menu.find(x => x.id === id); if(!m) return;
  const line = state.cart.find(x => x.id === id);
  if (line) line.qty += 1; else state.cart.push({ id, name: m.name, rate: m.price, qty: 1 });
  persistCart();
  renderCart();
}

function renderCart(){
  els.cartList.innerHTML = state.cart.map(line => `
    <div class="cart-item">
      <div>
        <div>${line.name}</div>
        <div class="tag">₹${fmt2(line.rate)} x ${line.qty} = ₹${fmt2(line.rate * line.qty)}</div>
      </div>
      <div class="qty">
        <button data-id="${line.id}" data-act="-">−</button>
        <input data-id="${line.id}" type="number" min="1" value="${line.qty}"/>
        <button data-id="${line.id}" data-act="+">+</button>
        <button class="danger" data-id="${line.id}" data-act="x">X</button>
      </div>
    </div>`).join('');
  els.cartList.querySelectorAll('button').forEach(b=>b.onclick=qtyAction);
  els.cartList.querySelectorAll('input').forEach(i=>i.oninput = e => setQty(e.target.dataset.id, Number(e.target.value||1)));
  recalcSummary();
}

function qtyAction(e){
  const id = e.target.dataset.id; const act = e.target.dataset.act;
  const line = state.cart.find(x => x.id === id); if (!line) return;
  if (act === '+') line.qty += 1;
  if (act === '-') line.qty = Math.max(1, line.qty - 1);
  if (act === 'x') state.cart = state.cart.filter(x => x.id !== id);
  persistCart();
  renderCart();
}

function setQty(id, qty){
  const line = state.cart.find(x => x.id === id); if(!line) return;
  line.qty = Math.max(1, qty);
  persistCart();
  renderCart();
}

function recalcSummary(){
  const subTotal = round2(state.cart.reduce((s,l)=>s+l.qty*l.rate,0));
  const discount = round2(Number(els.discount.value||0));
  const discounted = Math.max(0, subTotal - discount);
  const service = round2(discounted * state.settings.serviceChargeRate);
  const taxable = round2(discounted + service);
  let cgst=0, sgst=0, igst=0;
  if (state.settings.intraState) {
    cgst = round2(taxable * (state.settings.gstRate/2));
    sgst = round2(taxable * (state.settings.gstRate/2));
  } else {
    igst = round2(taxable * state.settings.gstRate);
  }
  let total = taxable + cgst + sgst + igst;
  let roundOff = 0;
  if (state.settings.roundOff) {
    const r = Math.round(total); roundOff = round2(r - total); total = r;
  }
  els.subTotal.textContent = money(subTotal);
  els.serviceCharge.textContent = money(service);
  els.cgst.textContent = money(cgst);
  els.sgst.textContent = money(sgst);
  els.igst.textContent = money(igst);
  els.roundOff.textContent = money(roundOff);
  els.grandTotal.textContent = money(total);
  return { subTotal, discount, service, cgst, sgst, igst, roundOff, total };
}

async function createOrder(){
  if (state.cart.length === 0) return null;
  const payload = {
    items: state.cart.map(x => ({ id: x.id, qty: x.qty })),
    discount: Number(els.discount.value||0)
  };
  const res = await fetch('/api/orders',{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)});
  if (!res.ok) { alert('Order error'); return null; }
  return await res.json();
}

function showPayment(total){
  els.amountDue.textContent = money(total);
  els.paidAmount.value = '';
  els.changeAmt.textContent = money(0);
  els.modal.classList.remove('hidden');
}

function printInvoice(order){
  const area = els.printArea;
  const rows = order.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align:right">₹${fmt2(i.rate)}</td><td style="text-align:right">₹${fmt2(i.amount)}</td></tr>`).join('');
  area.innerHTML = `
  <div style="font-family:Arial;padding:12px;width:300px">
    <div style="text-align:center;font-weight:700">Restaurant Invoice</div>
    <div style="font-size:12px">Order: ${order.id}<br/>Time: ${order.time}</div>
    <hr/>
    <table style="width:100%;font-size:12px">
      <thead><tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amt</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <hr/>
    <div style="display:flex;justify-content:space-between"><span>Sub total</span><span>₹${fmt2(order.subTotal)}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Discount</span><span>₹${fmt2(order.discount)}</span></div>
    <div style="display:flex;justify-content:space-between"><span>Service</span><span>₹${fmt2(order.serviceCharge)}</span></div>
    ${order.cgst?`<div style="display:flex;justify-content:space-between"><span>CGST</span><span>₹${fmt2(order.cgst)}</span></div>`:''}
    ${order.sgst?`<div style="display:flex;justify-content:space-between"><span>SGST</span><span>₹${fmt2(order.sgst)}</span></div>`:''}
    ${order.igst?`<div style="display:flex;justify-content:space-between"><span>IGST</span><span>₹${fmt2(order.igst)}</span></div>`:''}
    ${order.roundOff?`<div style="display:flex;justify-content:space-between"><span>Round off</span><span>₹${fmt2(order.roundOff)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span>₹${fmt2(order.total)}</span></div>
    <hr/>
    <div style="text-align:center;font-size:12px">Thank you! Visit again.</div>
  </div>`;
  const w = window.open('', '_blank'); w.document.write(area.innerHTML); w.print(); w.close();
}

function mountHandlers(){
  els.search.oninput = renderMenu;
  els.category.onchange = renderMenu;
  els.refresh.onclick = async () => { await loadMenu(); renderMenu(); };
  els.clearOrder.onclick = () => { state.cart = []; persistCart(); renderCart(); };
  els.discount.oninput = recalcSummary;
  els.payBtn.onclick = async () => {
    const order = await createOrder(); if(!order) return;
    showPayment(order.total);
    els.completePay.onclick = () => {
      const paid = Number(els.paidAmount.value||0); const change = Math.max(0, paid - order.total);
      els.changeAmt.textContent = money(change);
      alert(`Payment ${els.payMode.value} received. Change: ${money(change)}`);
      printInvoice(order);
      state.cart = []; persistCart(); renderCart();
      els.modal.classList.add('hidden');
    };
  };
  els.closePay.onclick = () => els.modal.classList.add('hidden');
  els.printBtn.onclick = async () => {
    const order = await createOrder(); if(!order) return;
    printInvoice(order);
  };
}

function persistCart(){ localStorage.setItem('rms_cart', JSON.stringify(state.cart)); }
function restoreCart(){ try { state.cart = JSON.parse(localStorage.getItem('rms_cart')||'[]'); } catch { state.cart=[]; } }

function money(n){ return '₹' + fmt2(n); }
function fmt2(n){ return Number(n||0).toFixed(2); }
function round2(n){ return Math.round((Number(n)+Number.EPSILON)*100)/100; }

init();

