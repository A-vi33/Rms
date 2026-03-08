import React from 'react'
import tw, { styled } from 'twin.macro'
import { Bell, Menu as MenuIcon, CheckCircle, ChevronDown } from 'lucide-react'

const SectionHeader = tw.div`flex items-center justify-between mb-4`
const SectionTitle = tw.h3`text-lg font-bold text-slate-800`
const FilterBtn = tw.button`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50`

const OrderCard = tw.div`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow mb-4 relative overflow-hidden`
const OrderHeader = tw.div`flex items-center justify-between mb-4`
const OrderSource = styled.span(({ type }) => [
  tw`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2`,
  type === 'reception'
    ? tw`bg-rose-100 text-rose-700`
    : tw`bg-emerald-100 text-emerald-700`,
])
const OrderTime = tw.span`text-xs font-medium text-slate-400`
const OrderItems = tw.div`space-y-2 mb-4`
const ItemRow = tw.div`flex items-start justify-between text-sm`
const ItemName = tw.span`font-medium text-slate-700`
const ItemQty = tw.span`font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded`
const OrderFooter = tw.div`flex items-center justify-between pt-4 border-t border-slate-50`
const OrderId = tw.span`text-xs font-bold text-slate-400`
const ActionBtn = styled.button(({ variant }) => [
  tw`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors`,
  variant === 'primary'
    ? tw`bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200`
    : tw`bg-slate-100 text-slate-600 hover:bg-slate-200`,
])

export default function OrderList({ orders }) {
  return (
    <div>
      <SectionHeader>
        <SectionTitle>Orders #1235</SectionTitle>
        <FilterBtn>
          All Orders <ChevronDown size={14} />
        </FilterBtn>
      </SectionHeader>

      {orders.map((order, i) => (
        <OrderCard key={i} className="group">
          <OrderHeader>
            <div className="flex items-center gap-3">
              <OrderSource type={order.type}>
                {order.type === 'reception' ? <Bell size={12} /> : <MenuIcon size={12} />}
                {order.source}
              </OrderSource>
              {order.type === 'reception' && (
                  <span className="text-xs font-mono text-slate-400 border border-slate-200 px-1.5 rounded bg-slate-50">=-1</span>
              )}
            </div>
            <OrderTime>{order.time}</OrderTime>
          </OrderHeader>

          <OrderItems>
            {order.items.map((item, j) => (
              <ItemRow key={j}>
                <div className="flex items-center gap-2">
                  <ItemQty>{item.qty}x</ItemQty>
                  <ItemName>{item.name}</ItemName>
                </div>
              </ItemRow>
            ))}
          </OrderItems>

          <OrderFooter>
            <OrderId>{order.id}</OrderId>
            <ActionBtn variant="primary">
              <CheckCircle size={14} className="inline mr-1" /> Finished
            </ActionBtn>
          </OrderFooter>
        </OrderCard>
      ))}
    </div>
  )
}
