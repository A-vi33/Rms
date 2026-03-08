import { useMemo, useState, useEffect } from 'react'
import Sidebar from '../layout/Sidebar'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Button } from '../ui/button'
import MenuGrid from '../menu/MenuGrid'
import OrderPanel from '../order/OrderPanel'
import { io } from 'socket.io-client'

export default function POSPage(){
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [cart, setCart] = useState([])
  const [orderId, setOrderId] = useState(()=>String(Date.now()).slice(-6))
  const [diningType, setDiningType] = useState('')
  const [table, setTable] = useState('')
  const [menuItems, setMenuItems] = useState([])
  const [drafts, setDrafts] = useState([])
  const [showDrafts, setShowDrafts] = useState(false)

  useEffect(() => {
    // Fetch initial menu
    fetch('http://localhost:5180/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data.menu))
      .catch(err => console.error('Error fetching menu:', err))

    fetch('http://localhost:5180/api/orders?status=draft')
      .then(res => res.json())
      .then(data => setDrafts(data.orders))

    // Setup socket connection
    const newSocket = io('http://localhost:5180')

    newSocket.on('menu:update', (updatedMenu) => {
      setMenuItems(updatedMenu)
    })

    newSocket.on('orders:update', (orders) => {
      setDrafts(orders.filter(o => o.status === 'draft'))
    })

    return () => newSocket.close()
  }, [])

  const categories = useMemo(()=>['All', ...Array.from(new Set(menuItems.map(m=>m.category)))],[menuItems])
  const brands = ['All','Food','Drinks']
  const filtered = menuItems.filter(m => 
    (category && category!=='All'? m.category===category:true) &&
    (brand && brand!=='All'? m.brand===brand : true) &&
    m.name.toLowerCase().includes(query.toLowerCase())
  )

  function addItem(item){
    setCart(prev=>{
      const idx = prev.findIndex(x=>x.id===item.id)
      if (idx>-1){ const copy=[...prev]; copy[idx] = {...copy[idx], qty: copy[idx].qty+1}; return copy }
      return [...prev, { id:item.id, name:item.name, price:item.price, qty:1 }]
    })
  }
  function inc(id){ setCart(prev=>prev.map(x=>x.id===id?{...x,qty:x.qty+1}:x)) }
  function dec(id){ setCart(prev=>prev.map(x=>x.id===id?{...x,qty:Math.max(1,x.qty-1)}:x)) }
  function removeItem(id){ setCart(prev=>prev.filter(x=>x.id!==id)) }
  function newOrder(){
    setCart([])
    setQuery('')
    setCategory('All')
    setBrand('All')
    setDiningType('')
    setTable('')
    setOrderId(String(Date.now()).slice(-6))
  }
  function onDiningChange(val){
    setDiningType(val)
    if (val !== 'Dine-in') setTable('')
  }

  function onPlaceOrder(actionType) {
    if (cart.length === 0) return alert('Cart is empty')
    if (!diningType) return alert('Select dining type')
    if (diningType === 'Dine-in' && !table) return alert('Select a table')

    // Determine status based on action
    let status = 'received'
    if (actionType === 'draft') status = 'draft'
    else if (actionType === 'kot') status = 'kot'
    else if (actionType === 'bill') status = 'billed'
    else if (actionType === 'print') status = 'paid' // simplified for "Bill & Print"

    const orderPayload = {
      items: cart,
      type: diningType.toLowerCase(), // 'dine-in' or 'takeaway'
      status,
      table: diningType === 'Dine-in' ? table : undefined
    }

    fetch('http://localhost:5180/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
    .then(res => res.json())
    .then(data => {
      console.log('Order placed:', data)
      newOrder() // Reset UI
      if (actionType === 'kot') alert('KOT Printed (Sent to Kitchen)')
      if (actionType === 'draft') alert('Order Saved to Drafts')
      if (actionType === 'print') alert('Bill Printed & Paid')
    })
    .catch(err => console.error(err))
  }

  function loadDraft(order) {
    setCart(order.items)
    setOrderId(order.id)
    setDiningType(order.type === 'dine-in' ? 'Dine-in' : 'Takeaway')
    setTable(order.table || '')
    setShowDrafts(false)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr_24rem]">
      <Sidebar/>
      <main className="p-4 relative">
        <div className="flex flex-col sm:flex-row gap-2 items-stretch justify-between mb-4">
          <Input placeholder="Search in products" value={query} onChange={e=>setQuery(e.target.value)} className="sm:max-w-xs" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={()=>setShowDrafts(!showDrafts)}>
              Active Tables ({drafts.length})
            </Button>
            <Select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.slice(1).map(c=><option key={c}>{c}</option>)}</Select>
            <Select value={brand} onChange={e=>setBrand(e.target.value)}><option>All</option>{brands.slice(1).map(b=><option key={b}>{b}</option>)}</Select>
            <Button variant="secondary" onClick={newOrder}>New Order</Button>
          </div>
        </div>

        {showDrafts && (
          <div className="absolute top-16 right-4 left-4 bg-white shadow-xl border rounded-xl z-10 p-4 max-h-[80vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Active Table Orders (Drafts)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.length===0 && <div className="text-gray-500">No active drafts</div>}
              {drafts.map(d => (
                <div key={d.id} className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={()=>loadDraft(d)}>
                  <div className="font-bold flex justify-between">
                    <span>{d.table || 'Takeaway'}</span>
                    <span>#{d.id}</span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {d.items.length} items • ₹{d.total}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(d.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <MenuGrid items={filtered} onAdd={addItem}/>
      </main>
      <OrderPanel 
        orderId={orderId} 
        cart={cart} 
        onInc={inc} 
        onDec={dec} 
        onRemove={removeItem} 
        gstRate={0.05} 
        serviceChargeRate={0} 
        diningType={diningType} 
        onDiningChange={onDiningChange} 
        table={table} 
        onTableChange={setTable}
        onPlaceOrder={onPlaceOrder}
      />
    </div>
  )
}
