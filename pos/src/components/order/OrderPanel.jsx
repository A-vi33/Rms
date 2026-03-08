import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Trash2, Minus, Plus } from 'lucide-react'

export default function OrderPanel({ cart, onInc, onDec, onRemove, gstRate=0.05, serviceChargeRate=0, onAction, orderId, diningType, onDiningChange, table, onTableChange, onPlaceOrder }){
  const subTotal = cart.reduce((s,i)=>s+i.qty*i.price,0)
  const serviceCharge = Math.round((subTotal*serviceChargeRate)*100)/100
  const gst = Math.round(((subTotal+serviceCharge)*gstRate)*100)/100
  const total = Math.round(subTotal + serviceCharge + gst)
  const tableDisabled = diningType !== 'Dine-in'

  const handleAction = (type) => {
    // type: 'kot', 'draft', 'bill', 'print'
    onPlaceOrder && onPlaceOrder(type)
  }

  return (
    <aside className="w-full lg:w-96 h-screen bg-white border-l border-gray-200 p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{orderId ? `Order #${orderId}` : 'Order'}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Select value={diningType} onChange={e=>onDiningChange?.(e.target.value)}>
          <option value="" disabled>Select Dining</option>
          <option value="Dine-in">Dine-in</option>
          <option value="Takeaway">Takeaway (Parcel)</option>
        </Select>
        <Select value={table} onChange={e=>onTableChange?.(e.target.value)} disabled={tableDisabled}>
          <option value="" disabled>Select Table</option>
          <option value="T1">T1</option>
          <option value="T2">T2</option>
          <option value="T3">T3</option>
        </Select>
      </div>
      <div className="flex-1 overflow-auto space-y-2">
        {cart.map(line=>(
          <div key={line.id} className="border rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{line.name}</div>
              <div className="text-sm text-gray-500">₹{line.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={()=>onDec(line.id)}><Minus size={16}/></Button>
              <div className="w-8 text-center">{line.qty}</div>
              <Button size="sm" variant="outline" onClick={()=>onInc(line.id)}><Plus size={16}/></Button>
              <Button size="sm" variant="outline" onClick={()=>onRemove(line.id)}><Trash2 size={16}/></Button>
            </div>
          </div>
        ))}
        {cart.length===0 && <div className="text-sm text-gray-500">No items yet</div>}
      </div>
      <div className="border-t pt-3 space-y-1">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
        {serviceChargeRate>0 && <div className="flex justify-between text-sm"><span>Service charge</span><span>₹{serviceCharge.toFixed(2)}</span></div>}
        <div className="flex justify-between text-sm"><span>GST ({(gstRate*100).toFixed(0)}%)</span><span>₹{gst.toFixed(2)}</span></div>
        <div className="flex justify-between text-lg font-semibold pt-1"><span>Total</span><span>₹{total.toFixed(0)}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Button variant="secondary" onClick={()=>handleAction('kot')}>KOT Print</Button>
        <Button variant="outline" onClick={()=>handleAction('draft')}>
          {diningType === 'Dine-in' ? 'Save Table' : 'Draft Order'}
        </Button>
        <Button className="bg-primary hover:brightness-110" onClick={()=>handleAction('bill')}>Bill & Payment</Button>
        <Button className="bg-green-600 text-white hover:bg-green-500" onClick={()=>handleAction('print')}>Bill & Print</Button>
      </div>
    </aside>
  )
}
