import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSessions, useGuests, useFoodItems, useAssignments } from '../hooks/useStore'
import { CATEGORIES, randomizeAssignments } from '../utils/randomizer'
import { nanoid } from '../utils/nanoid'
import Modal from './Modal'

const COLORS = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  teal: 'bg-teal-100 text-teal-700',
  pink: 'bg-pink-100 text-pink-700',
  blue: 'bg-blue-100 text-blue-700',
}

function CategoryBadge({ category }) {
  const meta = CATEGORIES[category]
  if (!meta) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[meta.color]}`}>
      {meta.emoji} {meta.label}
    </span>
  )
}

function FoodItemsModal({ guest, foodItems, setFoodItems, onClose }) {
  const guestItems = foodItems.filter(f => f.guestId === guest.id)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('appetizer')
  const addItem = () => {
    if (!name.trim()) return
    setFoodItems(f => [...f, { id: nanoid(), guestId: guest.id, name: name.trim(), category }])
    setName('')
  }
  const removeItem = (id) => setFoodItems(f => f.filter(fi => fi.id !== id))
  return (
    <div className="p-6 flex flex-col gap-5">
      <div>
        <p className="text-sm text-stone-500 mb-3">Log what <span className="font-medium text-stone-700">{guest.name}</span> is bringing.</p>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="e.g. Caesar salad" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addItem() }} autoFocus />
          <select className="input w-36" value={category} onChange={e => setCategory(e.target.value)}>
            {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
          <button className="btn-primary flex-shrink-0" onClick={addItem} disabled={!name.trim()}>Add</button>
        </div>
      </div>
      {guestItems.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-4">No items logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {guestItems.map(item => (
            <li key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-stone-50 border border-stone-100">
              <CategoryBadge category={item.category} />
              <span className="flex-1 text-sm text-stone-800">{item.name}</span>
              <button className="btn-ghost p-1 text-stone-400 hover:text-red-500" onClick={() => removeItem(item.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end pt-2 border-t border-stone-100">
        <button className="btn-secondary" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

function GuestFormModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [isExpertChef, setIsExpertChef] = useState(initial?.isExpertChef || false)
  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <label className="label">Guest Name</label>
        <input className="input" placeholder="e.g. Alex" value={name} onChange={e => setName(e.target.value)} autoFocus onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave({ name: name.trim(), isExpertChef }) }} />
      </div>
      <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-lg border border-stone-200 hover:bg-stone-50 transition">
        <input type="checkbox" className="mt-0.5 w-4 h-4 accent-orange-500" checked={isExpertChef} onChange={e => setIsExpertChef(e.target.checked)} />
        <div>
          <span className="text-sm font-medium text-stone-800">Expert Chef 👨‍🍳</span>
          <p className="text-xs text-stone-500 mt-0.5">Expert chefs are assigned harder dish categories and receive a special cooking constraint.</p>
        </div>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), isExpertChef })}>{initial ? 'Save' : 'Add Guest'}</button>
      </div>
    </div>
  )
}

function RandomizerModal({ guests, assignments, onReroll, onClose }) {
  const guestMap = Object.fromEntries(guests.map(g => [g.id, g]))
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">Assignments balanced across categories. Expert chefs get a special constraint.</p>
        <button className="btn-secondary flex-shrink-0" onClick={onReroll}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /></svg>
          Re-roll
        </button>
      </div>
      <ul className="flex flex-col gap-3">
        {assignments.map(a => {
          const guest = guestMap[a.guestId]
          if (!guest) return null
          return (
            <li key={a.guestId} className="rounded-xl border border-stone-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-stone-50">
                <span className="text-sm font-semibold text-stone-800 flex-1">{guest.name}</span>
                {guest.isExpertChef && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">👨‍🍳 Expert Chef</span>}
                <CategoryBadge category={a.category} />
              </div>
              {a.expertConstraint && (
                <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Special Constraint: {a.expertConstraint.label}</p>
                  <p className="text-xs text-amber-600">{a.expertConstraint.description}</p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
        <button className="btn-secondary" onClick={onClose}>Close</button>
        <button className="btn-primary" onClick={onClose}>Save Assignments</button>
      </div>
    </div>
  )
}

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [sessions] = useSessions()
  const [guests, setGuests] = useGuests()
  const [foodItems, setFoodItems] = useFoodItems()
  const [allAssignments, setAllAssignments] = useAssignments()
  const [showAddGuest, setShowAddGuest] = useState(false)
  const [editGuestId, setEditGuestId] = useState(null)
  const [foodModalGuestId, setFoodModalGuestId] = useState(null)
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [rolledAssignments, setRolledAssignments] = useState(null)

  const session = sessions.find(s => s.id === id)
  const sessionGuests = guests.filter(g => g.sessionId === id)
  const savedAssignments = allAssignments[id] || []

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-stone-500">Session not found.</p>
        <Link to="/" className="btn-primary mt-4 inline-flex">Back to sessions</Link>
      </div>
    )
  }

  const formatDate = (d, t) => {
    if (!d) return ''
    const dt = new Date(`${d}T${t}`)
    return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) +
      ' at ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const addGuest = (form) => { setGuests(g => [...g, { id: nanoid(), sessionId: id, ...form }]); setShowAddGuest(false) }
  const updateGuest = (guestId, form) => { setGuests(g => g.map(guest => guest.id === guestId ? { ...guest, ...form } : guest)); setEditGuestId(null) }
  const deleteGuest = (guestId) => {
    if (confirm('Remove this guest? Their food items and assignment will also be removed.')) {
      setGuests(g => g.filter(guest => guest.id !== guestId))
      setFoodItems(f => f.filter(fi => fi.guestId !== guestId))
      setAllAssignments(a => ({ ...a, [id]: (a[id] || []).filter(x => x.guestId !== guestId) }))
    }
  }
  const runRandomizer = () => { setRolledAssignments(randomizeAssignments(sessionGuests)); setShowRandomizer(true) }
  const saveAssignments = () => { setAllAssignments(a => ({ ...a, [id]: rolledAssignments })); setShowRandomizer(false) }
  const clearAssignments = () => { if (confirm('Clear all current assignments?')) setAllAssignments(a => ({ ...a, [id]: [] })) }

  const assignmentByGuest = Object.fromEntries(savedAssignments.map(a => [a.guestId, a]))
  const expertCount = sessionGuests.filter(g => g.isExpertChef).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="btn-ghost px-0 text-stone-500 mb-4 -ml-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          All Sessions
        </button>
        <h1 className="text-2xl font-bold text-stone-900">{session.name}</h1>
        <p className="text-sm text-orange-600 font-medium mt-1">{formatDate(session.date, session.time)}</p>
        <p className="text-sm text-stone-500">{session.venue}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[{ label: 'Guests', value: sessionGuests.length }, { label: 'Expert Chefs', value: expertCount }, { label: 'Assigned', value: savedAssignments.length }].map(stat => (
          <div key={stat.label} className="card p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5 mb-8 flex items-center gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-stone-900 text-sm">Food Randomizer</h3>
          <p className="text-xs text-stone-500 mt-0.5">Assigns balanced dish categories. Expert chefs get harder categories with a special constraint.</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {savedAssignments.length > 0 && <button className="btn-danger" onClick={clearAssignments}>Clear</button>}
          <button className="btn-primary" disabled={sessionGuests.length === 0} onClick={runRandomizer}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            Randomize
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-stone-900">Guests</h2>
        <button className="btn-primary" onClick={() => setShowAddGuest(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          Add Guest
        </button>
      </div>

      {sessionGuests.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-stone-500 text-sm">No guests yet. Add some to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessionGuests.map(guest => {
            const items = foodItems.filter(f => f.guestId === guest.id)
            const assignment = assignmentByGuest[guest.id]
            return (
              <div key={guest.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${guest.isExpertChef ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
                    {guest.isExpertChef ? '👨‍🍳' : guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-stone-900">{guest.name}</span>
                      {guest.isExpertChef && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Expert Chef</span>}
                      {assignment && <CategoryBadge category={assignment.category} />}
                    </div>
                    {assignment?.expertConstraint && (
                      <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
                        <p className="text-xs font-semibold text-amber-700">{assignment.expertConstraint.label}</p>
                        <p className="text-xs text-amber-600 mt-0.5">{assignment.expertConstraint.description}</p>
                      </div>
                    )}
                    {items.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {items.map(item => (
                          <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600">
                            {CATEGORIES[item.category]?.emoji} {item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button className="btn-ghost p-2 text-stone-400 hover:text-stone-600 text-xs" onClick={() => setFoodModalGuestId(guest.id)} title="Manage food items">🍽️</button>
                    <button className="btn-ghost p-2 text-stone-400 hover:text-stone-600" onClick={() => setEditGuestId(guest.id)} title="Edit guest">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button className="btn-ghost p-2 text-stone-400 hover:text-red-500" onClick={() => deleteGuest(guest.id)} title="Remove guest">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAddGuest && <Modal title="Add Guest" onClose={() => setShowAddGuest(false)}><GuestFormModal onSave={addGuest} onClose={() => setShowAddGuest(false)} /></Modal>}
      {editGuestId && <Modal title="Edit Guest" onClose={() => setEditGuestId(null)}><GuestFormModal initial={guests.find(g => g.id === editGuestId)} onSave={(form) => updateGuest(editGuestId, form)} onClose={() => setEditGuestId(null)} /></Modal>}
      {foodModalGuestId && (
        <Modal title={`${guests.find(g => g.id === foodModalGuestId)?.name}'s Food Items`} onClose={() => setFoodModalGuestId(null)} size="lg">
          <FoodItemsModal guest={guests.find(g => g.id === foodModalGuestId)} foodItems={foodItems} setFoodItems={setFoodItems} onClose={() => setFoodModalGuestId(null)} />
        </Modal>
      )}
      {showRandomizer && rolledAssignments && (
        <Modal title="Randomized Assignments" onClose={() => setShowRandomizer(false)} size="lg">
          <RandomizerModal guests={sessionGuests} assignments={rolledAssignments} onReroll={() => setRolledAssignments(randomizeAssignments(sessionGuests))} onClose={saveAssignments} />
        </Modal>
      )}
    </div>
  )
}
