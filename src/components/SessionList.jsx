import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions, useGuests } from '../hooks/useStore'
import Modal from './Modal'
import { nanoid } from '../utils/nanoid'

function SessionForm({ onSave, onClose, initial }) {
  const [form, setForm] = useState(initial || { name: '', date: '', time: '', venue: '' })
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const valid = form.name.trim() && form.date && form.time && form.venue.trim()

  return (
    <form className="p-6 flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); if (valid) onSave(form) }}>
      <div>
        <label className="label">Session Name</label>
        <input className="input" placeholder="Sunday Potluck" value={form.name} onChange={set('name')} autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="label">Time</label>
          <input className="input" type="time" value={form.time} onChange={set('time')} />
        </div>
      </div>
      <div>
        <label className="label">Venue</label>
        <input className="input" placeholder="123 Main St" value={form.venue} onChange={set('venue')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={!valid}>{initial ? 'Save Changes' : 'Create Session'}</button>
      </div>
    </form>
  )
}

export default function SessionList() {
  const [sessions, setSessions] = useSessions()
  const [guests] = useGuests()
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState(null)
  const navigate = useNavigate()

  const createSession = (form) => {
    setSessions(s => [...s, { id: nanoid(), ...form, createdAt: new Date().toISOString() }])
    setShowCreate(false)
  }
  const updateSession = (id, form) => {
    setSessions(s => s.map(sess => sess.id === id ? { ...sess, ...form } : sess))
    setEditId(null)
  }
  const deleteSession = (id) => {
    if (confirm('Delete this session?')) setSessions(s => s.filter(sess => sess.id !== id))
  }
  const guestCount = (sessionId) => guests.filter(g => g.sessionId === sessionId).length
  const formatDate = (d, t) => {
    if (!d) return ''
    const dt = new Date(`${d}T${t}`)
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' · ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }
  const sorted = [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Potluck Draws</h1>
          <p className="text-sm text-stone-500 mt-0.5">Plan, assign, and randomize your potluck meals</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
          New Session
        </button>
      </div>
      {sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🍽️</div>
          <p className="text-stone-500 text-sm">No sessions yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map(sess => (
            <div key={sess.id} className="card p-5 flex items-start gap-4 cursor-pointer hover:border-orange-300 hover:shadow-md transition-all" onClick={() => navigate(`/session/${sess.id}`)}>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl flex-shrink-0">🥘</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-semibold text-stone-900 truncate">{sess.name}</h2>
                  <span className="text-xs text-stone-400 flex-shrink-0">{guestCount(sess.id)} guest{guestCount(sess.id) !== 1 ? 's' : ''}</span>
                </div>
                <p className="text-sm text-orange-600 mt-0.5 font-medium">{formatDate(sess.date, sess.time)}</p>
                <p className="text-sm text-stone-500 mt-0.5 truncate">{sess.venue}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button className="btn-ghost p-2 text-stone-400 hover:text-stone-600" onClick={() => setEditId(sess.id)} title="Edit">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                <button className="btn-ghost p-2 text-stone-400 hover:text-red-500" onClick={() => deleteSession(sess.id)} title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreate && <Modal title="New Potluck Session" onClose={() => setShowCreate(false)}><SessionForm onSave={createSession} onClose={() => setShowCreate(false)} /></Modal>}
      {editId && <Modal title="Edit Session" onClose={() => setEditId(null)}><SessionForm initial={sessions.find(s => s.id === editId)} onSave={(form) => updateSession(editId, form)} onClose={() => setEditId(null)} /></Modal>}
    </div>
  )
}
