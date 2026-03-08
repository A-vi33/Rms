import { useState, useEffect } from 'react'
import Sidebar from '../layout/Sidebar'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { io } from 'socket.io-client'

export default function KitchenDisplay() {
  const [menu, setMenu] = useState([])
  const [orders, setOrders] = useState([])
  const [socket, setSocket] = useState(null)
  const [view, setView] = useState('availability') // 'availability' or 'live-orders'

  useEffect(() => {
    // Fetch initial data
    fetch('http://localhost:5180/api/menu').then(res=>res.json()).then(d=>setMenu(d.menu))
    fetch('http://localhost:5180/api/orders?status=kot').then(res=>res.json()).then(d=>setOrders(d.orders))

    const newSocket = io('http://localhost:5180')
    setSocket(newSocket)

    newSocket.on('menu:update', setMenu)
    newSocket.on('orders:update', (allOrders) => {
       // Only show orders that are 'kot' status (sent to kitchen)
       // AND are NOT 'delivered' (safety check)
       setOrders(allOrders.filter(o => o.status === 'kot'))
    })

    return () => newSocket.close()
  }, [])

  const toggleAvailability = (item) => {
    // ... existing toggle logic ...
    const updatedItem = { ...item, available: !item.available }
    setMenu(prev => prev.map(i => i.id === item.id ? updatedItem : i))
    fetch(`http://localhost:5180/api/menu/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: updatedItem.available })
    }).catch(err => {
      console.error(err)
      setMenu(prev => prev.map(i => i.id === item.id ? item : i))
    })
  }

  // Filter only Kitchen items for availability view
  const kitchenItems = menu.filter(m => m.destination === 'kitchen')

  const markDelivered = (orderId) => {
    fetch(`http://localhost:5180/api/orders/${orderId}/deliver`, {
      method: 'POST'
    }).then(res => res.json())
      .then(() => {
        // Optimistic update
        setOrders(prev => prev.filter(o => o.id !== orderId))
      })
      .catch(err => console.error(err))
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
      <Sidebar />
      <main className="p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kitchen Display System</h1>
          <div className="flex gap-2">
            <Button variant={view==='live-orders'?'default':'outline'} onClick={()=>setView('live-orders')}>Live KOTs</Button>
            <Button variant={view==='availability'?'default':'outline'} onClick={()=>setView('availability')}>Manage Stock</Button>
          </div>
        </div>

        {view === 'live-orders' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {orders.length === 0 && <div className="text-gray-500">No pending kitchen orders</div>}
             {orders.map(order => (
               <Card key={order.id} className={`border-l-4 ${order.type === 'takeaway' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-lg">#{order.id}</span>
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <span className={`uppercase font-bold px-3 py-1 rounded text-white ${order.type === 'takeaway' ? 'bg-yellow-500' : 'bg-blue-600'}`}>
                        {order.type === 'takeaway' ? 'PARCEL' : (order.table || 'DINE-IN')}
                      </span>
                    </div>
                    <div className="space-y-1 mt-3">
                     {order.items.filter(i => i.destination === 'kitchen').map((item, idx) => (
                       <div key={idx} className="flex justify-between border-b border-dashed py-1">
                         <span>{item.name}</span>
                         <span className="font-bold">x{item.qty}</span>
                       </div>
                     ))}
                     {order.items.some(i => i.destination !== 'kitchen') && (
                       <div className="text-xs text-gray-400 mt-2 italic">
                         + {order.items.filter(i => i.destination !== 'kitchen').length} non-kitchen items
                       </div>
                     )}
                   </div>
                   <div className="mt-4 pt-2 border-t text-xs text-gray-500 flex justify-end items-center">
                      <Button size="sm" className="bg-green-600 hover:bg-green-500 w-full" onClick={() => markDelivered(order.id)}>
                        Mark Delivered
                      </Button>
                    </div>
                  </CardContent>
               </Card>
             ))}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kitchenItems.map(item => (
              <Card key={item.id} className={`transition-colors ${!item.available ? 'bg-gray-100 opacity-75' : 'bg-white'}`}>
                <CardContent className="p-4 flex flex-col items-center gap-4">
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-200">
                     {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                     )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <Button 
                    variant={item.available ? "default" : "destructive"}
                    className="w-full"
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.available ? 'Mark Unavailable' : 'Mark Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
