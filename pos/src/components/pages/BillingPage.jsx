import { useState, useEffect } from 'react'
import Sidebar from '../layout/Sidebar'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { io } from 'socket.io-client'

export default function BillingPage() {
  const [orders, setOrders] = useState([])
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    // Fetch active orders
    fetch('http://localhost:5180/api/orders')
      .then(res => res.json())
      .then(data => {
        // Filter out 'draft' orders, keep 'billed', 'kot', 'paid'
        const activeOrders = data.orders.filter(o => o.status !== 'draft')
        setOrders(activeOrders)
      })
      .catch(err => console.error('Error fetching orders:', err))

    // Setup socket connection
    const newSocket = io('http://localhost:5180')
    setSocket(newSocket)

    newSocket.on('orders:update', (updatedOrders) => {
      // Filter out 'draft' orders
      const activeOrders = updatedOrders.filter(o => o.status !== 'draft')
      setOrders(activeOrders)
    })

    return () => newSocket.close()
  }, [])

  const markAsPaid = (orderId) => {
    // Call API to mark order as paid
    fetch(`http://localhost:5180/api/orders/${orderId}/pay`, {
      method: 'POST',
    }).then(() => {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid' } : o))
    }).catch(err => console.error('Failed to mark as paid:', err))
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'billed': return 'bg-blue-100 text-blue-800'
      case 'kot': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[16rem_1fr]">
      <Sidebar />
      <main className="p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-6">Billing Counter</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    {order.type === 'takeaway' ? 'Parcel' : (order.table || 'Dine-in')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} uppercase`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {order.status !== 'paid' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => markAsPaid(order.id)}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
