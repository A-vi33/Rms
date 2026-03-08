import React from 'react'
import tw, { styled } from 'twin.macro'
import {
  Home,
  ClipboardList,
  Archive,
  Menu as MenuIcon,
  Settings,
  HelpCircle,
  ChefHat,
  LogOut
} from 'lucide-react'

const Aside = styled.aside(() => [
  tw`w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-6 px-4 shadow-sm z-20`,
])

const LogoArea = tw.div`flex items-center gap-3 px-2 mb-10`
const LogoText = tw.h1`text-2xl font-bold text-rose-800 tracking-tight font-serif`

const Nav = tw.nav`flex-1 space-y-2`

const NavItem = styled.div(({ active }) => [
  tw`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200`,
  active
    ? tw`bg-rose-800 text-white shadow-lg shadow-rose-200`
    : tw`text-slate-500 hover:bg-rose-50 hover:text-rose-700`,
])

const NavText = tw.span`font-medium text-sm`
const Badge = tw.span`ml-auto bg-rose-100 text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full`

const UserProfile = tw.div`mt-auto flex items-center gap-3 px-2 py-3 border-t border-slate-100 pt-6`
const Avatar = tw.img`w-10 h-10 rounded-full object-cover border-2 border-white shadow-md`
const UserInfo = tw.div`flex-1`
const UserName = tw.p`text-sm font-bold text-slate-800`
const UserRole = tw.p`text-xs text-green-600 font-semibold flex items-center gap-1`
const Dot = styled.span(({ status }) => [
  tw`w-2 h-2 rounded-full`,
  status === 'online' ? tw`bg-green-500 animate-pulse` :
  status === 'busy' ? tw`bg-amber-500` :
  tw`bg-slate-400`
])

export default function Sidebar({ activeTab, setActiveTab, onLogout, kitchenStatus }) {
  return (
    <Aside>
      <div>
        <LogoArea>
          <div className="bg-rose-800 p-2 rounded-lg text-white">
            <ChefHat size={24} />
          </div>
          <LogoText>Kitchen</LogoText>
        </LogoArea>
        
        <Nav>
          <NavItem onClick={() => setActiveTab('dashboard')} active={activeTab === 'dashboard'} className="group">
            <Home size={20} /> <NavText>Dashboard</NavText>
          </NavItem>
          <NavItem onClick={() => setActiveTab('orders')} active={activeTab === 'orders'} className="group">
            <ClipboardList size={20} /> <NavText>Orders</NavText>
            <Badge>24</Badge>
          </NavItem>
          <NavItem onClick={() => setActiveTab('inventory')} active={activeTab === 'inventory'} className="group">
            <Archive size={20} /> <NavText>Inventory</NavText>
          </NavItem>
          <NavItem onClick={() => setActiveTab('menu')} active={activeTab === 'menu'} className="group">
            <MenuIcon size={20} /> <NavText>Menu Management</NavText>
          </NavItem>
          <NavItem onClick={() => setActiveTab('settings')} active={activeTab === 'settings'} className="group">
            <Settings size={20} /> <NavText>Settings</NavText>
          </NavItem>
          <NavItem onClick={() => setActiveTab('help')} active={activeTab === 'help'} className="group">
            <HelpCircle size={20} /> <NavText>Help & Support</NavText>
          </NavItem>
        </Nav>
      </div>

      <UserProfile>
        <Avatar src="https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=100&q=80" alt="Chef" />
        <UserInfo>
          <UserName>Kitchen Staff</UserName>
          <UserRole><Dot status={kitchenStatus} /> {kitchenStatus === 'online' ? 'Online' : 'Offline'}</UserRole>
        </UserInfo>
        <button onClick={onLogout} className="text-slate-400 hover:text-rose-600">
          <LogOut size={18} />
        </button>
      </UserProfile>
    </Aside>
  )
}
