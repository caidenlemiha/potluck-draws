import { useLocalStorage } from './useLocalStorage'

export function useSessions() {
  return useLocalStorage('potluck_sessions', [])
}

export function useGuests() {
  return useLocalStorage('potluck_guests', [])
}

export function useFoodItems() {
  return useLocalStorage('potluck_food_items', [])
}

export function useAssignments() {
  return useLocalStorage('potluck_assignments', {})
}
