import { LayoutGrid, Utensils, Table2, BookOpen, ChefHat, Bike, CreditCard, Users, BarChart3, Settings } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Link, useLocation } from 'react-router-dom'

const items = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/' },
  { icon: Utensils, label: 'POS', path: '/' },
  { icon: ChefHat, label: 'Kitchen', path: '/kitchen' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Table2, label: 'Tables', path: '#' },
  { icon: BookOpen, label: 'Reservations', path: '#' },
  { icon: Bike, label: 'Delivery', path: '#' },
  { icon: Users, label: 'Customers', path: '#' },
  { icon: BarChart3, label: 'Reports', path: '#' },
  { icon: Settings, label: 'Settings', path: '#' },
]

export default function Sidebar(){
  const location = useLocation()
  
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 hidden lg:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="text-xl font-bold text-gray-900">Ganesha Hotel</div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item, i) => {
          const isActive = location.pathname === item.path && item.path !== '#'
          return (
            <Link
              key={i}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400")} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
