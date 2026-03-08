import React from 'react'
import tw, { styled } from 'twin.macro'
import { Plus, MoreVertical, Search, ChevronDown, Edit2, Trash2 } from 'lucide-react'

const SectionTitle = tw.h3`text-lg font-bold text-slate-800`
const SearchInput = tw.div`relative mb-6`
const SearchField = tw.input`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all`

const MenuList = tw.div`space-y-4 overflow-y-auto flex-1 pr-2`
const MenuItemCard = tw.div`flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 relative`
const MenuImg = tw.img`w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform`
const MenuInfo = tw.div`flex-1`
const MenuTitle = tw.h4`font-bold text-slate-800 text-sm mb-1`
const MenuMeta = tw.div`flex items-center gap-3 text-xs text-slate-500`
const PendingBadge = tw.span`text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold`
const MenuActions = tw.div`absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`
const MenuActionBtn = tw.button`p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200`

export default function MenuManagement({ menuItems, onAddDish, onDeleteDish, onUpdateQuantity }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Menu Management</SectionTitle>
        <div className="flex gap-2">
            <button 
            onClick={onAddDish}
            className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
            title="Add Dish"
            >
            <Plus size={18} />
            </button>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <SearchInput>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <SearchField type="text" placeholder="Search Item..." />
      </SearchInput>

      <div className="flex items-center justify-between mb-4 text-sm font-medium text-slate-500">
        <span>All Categories</span>
        <ChevronDown size={14} />
      </div>

      <MenuList>
        {menuItems.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No items found. <br/> Click + to add a dish.
          </div>
        )}
        {menuItems.map((item) => (
          <MenuItemCard key={item.id} className="group">
            <MenuImg src={item.image_url} alt={item.name} />
            <MenuInfo>
              <MenuTitle>{item.name}</MenuTitle>
              <MenuMeta>
                <PendingBadge>{item.pending_orders_count || 0} Pending</PendingBadge>
                <span>• {item.daily_quantity} left</span>
              </MenuMeta>
            </MenuInfo>
            
            <MenuActions>
              <MenuActionBtn onClick={() => onUpdateQuantity(item.id, item.daily_quantity)}>
                <Edit2 size={14} />
              </MenuActionBtn>
              <MenuActionBtn onClick={() => onDeleteDish(item.id)}>
                <Trash2 size={14} />
              </MenuActionBtn>
            </MenuActions>
          </MenuItemCard>
        ))}
      </MenuList>
    </>
  )
}
