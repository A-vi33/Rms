import React, { useState, useEffect } from 'react'
import tw, { styled, css } from 'twin.macro'
import { ClipboardList, ChevronDown } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, orderBy, setDoc } from 'firebase/firestore'

// Components
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import OrderList from '../../components/kitchen/OrderList'
import MenuManagement from '../../components/kitchen/MenuManagement'
import AddDishModal from '../../components/kitchen/modals/AddDishModal'
import ScheduleModal from '../../components/kitchen/modals/ScheduleModal'

// --- Styled Components for Layout ---

const Container = styled.div(() => [
  tw`flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800`,
  css`
    background-image: linear-gradient(to bottom right, #f8fafc, #f1f5f9);
  `,
])

const Main = tw.main`flex-1 flex flex-col min-w-0 overflow-hidden relative`
const ContentScroll = tw.div`flex-1 overflow-y-auto p-8`
const DashboardGrid = tw.div`grid grid-cols-12 gap-8 h-full`
const LeftPanel = tw.div`col-span-8 flex flex-col gap-6`
const RightPanel = tw.div`col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col h-full overflow-hidden`

// Stats
const StatsRow = tw.div`grid grid-cols-2 gap-6`
const StatCard = styled.div(({ active }) => [
  tw`p-6 rounded-2xl border flex items-center justify-between shadow-sm transition-all cursor-pointer`,
  active
    ? tw`bg-white border-rose-100 ring-4 ring-rose-50/50`
    : tw`bg-white border-slate-100 hover:border-rose-100`,
])
const StatInfo = tw.div``
const StatLabel = tw.p`text-sm text-slate-500 font-medium mb-1`
const StatValue = tw.h3`text-3xl font-bold text-slate-800`
const StatIcon = tw.div`w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center`

// --- Mock Data ---
const mockOrders = [
  {
    id: '#1235',
    source: 'Reception',
    type: 'reception',
    items: [
      { name: 'Chicken Biryani', qty: 2 },
      { name: 'Butter Naan', qty: 2 },
      { name: 'Paneer Tikka', qty: 1 },
    ],
    time: '10 min ago',
    status: 'pending',
  },
  {
    id: '#1236',
    source: 'Table 5',
    type: 'table',
    items: [
      { name: 'Vegetable Fried Rice', qty: 1 },
      { name: 'Butter Naan', qty: 2 },
    ],
    time: '13 min ago',
    status: 'cooking',
  },
  {
    id: '#1237',
    source: 'Table 2',
    type: 'table',
    items: [
      { name: 'Chicken Tandoori', qty: 2 },
      { name: 'Prawn Curry', qty: 2 },
    ],
    time: '27 min ago',
    status: 'ready',
  },
]

export default function KitchenDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('orders')
  const [menuItems, setMenuItems] = useState([])
  
  // Kitchen Status & Schedule
  const [kitchenConfig, setKitchenConfig] = useState({
    status: 'online',
    opening_time: '10:00',
    closing_time: '23:00'
  })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newDish, setNewDish] = useState({
    name: '',
    category: '',
    price: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
    daily_quantity: '50'
  })

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Kitchen Config
  useEffect(() => {
    if (!db) return
    const unsub = onSnapshot(doc(db, 'settings', 'kitchen_config'), (doc) => {
      if (doc.exists()) {
        setKitchenConfig(doc.data())
      } else {
        // Initialize if not exists
        const initialConfig = { status: 'online', opening_time: '10:00', closing_time: '23:00' }
        setDoc(doc.ref, initialConfig)
        setKitchenConfig(initialConfig)
      }
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'menu_items'), orderBy('name'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = []
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
      })
      setMenuItems(items)
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const toggleKitchenStatus = async () => {
    if (!db) return
    const newStatus = kitchenConfig.status === 'online' ? 'offline' : 'online'
    try {
      await updateDoc(doc(db, 'settings', 'kitchen_config'), { status: newStatus })
    } catch (err) {
      console.error('Failed to toggle status', err)
    }
  }

  const saveSchedule = async () => {
    if (!db) return
    try {
      await updateDoc(doc(db, 'settings', 'kitchen_config'), {
        opening_time: kitchenConfig.opening_time,
        closing_time: kitchenConfig.closing_time
      })
      setIsScheduleModalOpen(false)
    } catch (err) {
      console.error('Failed to save schedule', err)
    }
  }

  const handleAddDish = async () => {
    if (!db || !newDish.name) return
    try {
      await addDoc(collection(db, 'menu_items'), {
        name: newDish.name,
        category: newDish.category || 'Main Course',
        price: Number(newDish.price) || 0,
        image_url: newDish.image_url,
        is_active: true,
        daily_quantity: Number(newDish.daily_quantity) || 0,
        pending_orders_count: 0
      })
      setIsAddModalOpen(false)
      setNewDish({
        name: '',
        category: '',
        price: '',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
        daily_quantity: '50'
      })
    } catch (error) {
      console.error("Error adding dish: ", error)
      alert("Failed to add dish")
    }
  }

  const handleDeleteDish = async (id) => {
    if (!db) return
    if (confirm('Are you sure you want to delete this dish?')) {
      try {
        await deleteDoc(doc(db, 'menu_items', id))
      } catch (error) {
        console.error("Error deleting dish: ", error)
      }
    }
  }

  const handleUpdateQuantity = async (id, currentQty) => {
    if (!db) return
    const newQty = prompt('Enter new daily quantity:', String(currentQty))
    if (newQty !== null) {
      try {
        await updateDoc(doc(db, 'menu_items', id), {
          daily_quantity: Number(newQty) || 0
        })
      } catch (error) {
        console.error("Error updating quantity: ", error)
      }
    }
  }

  return (
    <Container>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        kitchenStatus={kitchenConfig.status}
      />

      <Main>
        <Header 
          title={<span>Kitchen <span className="text-rose-700">Orders</span></span>}
          kitchenStatus={kitchenConfig.status}
          onToggleStatus={toggleKitchenStatus}
          onOpenSchedule={() => setIsScheduleModalOpen(true)}
          currentTime={currentTime}
        />

        <ContentScroll>
          <DashboardGrid>
            {/* Left / Center Panel */}
            <LeftPanel>
              {/* Stats / Overview */}
              <StatsRow>
                <StatCard active>
                  <StatInfo>
                    <StatLabel>Reception Orders</StatLabel>
                    <StatValue>9</StatValue>
                  </StatInfo>
                  <StatIcon className="bg-blue-50 text-blue-600">
                    <ClipboardList size={24} />
                  </StatIcon>
                </StatCard>
                
                <StatCard>
                  <div className="flex items-center justify-between w-full">
                    <StatLabel>All Orders</StatLabel>
                    <ChevronDown size={16} className="text-slate-400" />
                  </div>
                  {/* Placeholder for filter controls */}
                  <div className="flex gap-2 mt-2">
                    <div className="h-2 w-8 bg-slate-200 rounded-full" />
                    <div className="h-2 w-12 bg-slate-200 rounded-full" />
                  </div>
                </StatCard>
              </StatsRow>

              {/* Orders Feed */}
              <OrderList orders={mockOrders} />
            </LeftPanel>

            {/* Right Panel - Menu Management */}
            <RightPanel>
              <MenuManagement 
                menuItems={menuItems}
                onAddDish={() => setIsAddModalOpen(true)}
                onDeleteDish={handleDeleteDish}
                onUpdateQuantity={handleUpdateQuantity}
              />
            </RightPanel>
          </DashboardGrid>
        </ContentScroll>
      </Main>

      <AddDishModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDish}
        newDish={newDish}
        setNewDish={setNewDish}
      />

      <ScheduleModal 
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={saveSchedule}
        config={kitchenConfig}
        setConfig={setKitchenConfig}
      />
    </Container>
  )
}
