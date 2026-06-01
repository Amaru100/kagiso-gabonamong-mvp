import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function EventCard({ event }) {
  const { addItem } = useCart()
  const navigate = useNavigate()

  const register = () => {
    addItem(event)
    navigate('/checkout')
  }

  return (
    <article className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.035] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b15e]">{event.kind}</p>
      <h3 className="mt-4 text-xl font-black">{event.title}</h3>
      <div className="mt-4 grid gap-2 text-sm text-[#cfc8b5]">
        <span className="inline-flex items-center gap-2"><CalendarDays size={17} /> {event.date}</span>
        <span className="inline-flex items-center gap-2"><MapPin size={17} /> {event.location}</span>
      </div>
      <p className="mt-4 flex-1 text-sm leading-6 text-[#cfc8b5]">{event.description}</p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-2xl font-black text-[#d6b15e]">BWP {event.price.toFixed(2)}</span>
        <Button onClick={register}>
          <Ticket size={18} /> Register / Buy Ticket
        </Button>
      </div>
    </article>
  )
}
