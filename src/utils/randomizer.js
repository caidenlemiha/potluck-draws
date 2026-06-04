export const CATEGORIES = {
  appetizer: { label: 'Appetizer', emoji: '🥗', color: 'green' },
  main: { label: 'Main Dish', emoji: '🍖', color: 'red' },
  carb: { label: 'Carb / Starch', emoji: '🍚', color: 'yellow' },
  side: { label: 'Side Dish', emoji: '🥦', color: 'teal' },
  dessert: { label: 'Dessert', emoji: '🍰', color: 'pink' },
  drink: { label: 'Drinks', emoji: '🥤', color: 'blue' },
}

const EXPERT_CONSTRAINTS = [
  { id: 'scratch', label: 'Entirely from scratch', description: 'No store-bought components — everything made by hand.' },
  { id: 'mystery_miso', label: 'Mystery ingredient: Miso', description: 'The dish must incorporate miso in a creative way.' },
  { id: 'mystery_tahini', label: 'Mystery ingredient: Tahini', description: 'The dish must incorporate tahini in a creative way.' },
  { id: 'mystery_truffle', label: 'Mystery ingredient: Truffle', description: 'The dish must incorporate truffle (oil or shaved) in a creative way.' },
  { id: 'mystery_saffron', label: 'Mystery ingredient: Saffron', description: 'The dish must incorporate saffron in a creative way.' },
  { id: 'mystery_gochujang', label: 'Mystery ingredient: Gochujang', description: 'The dish must incorporate gochujang in a creative way.' },
  { id: 'cuisine_french', label: 'Cuisine: French', description: 'Dish must be a traditional or modern French preparation.' },
  { id: 'cuisine_japanese', label: 'Cuisine: Japanese', description: 'Dish must be a traditional or modern Japanese preparation.' },
  { id: 'cuisine_mexican', label: 'Cuisine: Mexican', description: 'Dish must be a traditional or modern Mexican preparation.' },
  { id: 'cuisine_italian', label: 'Cuisine: Italian', description: 'Dish must be a traditional or modern Italian preparation.' },
  { id: 'cuisine_indian', label: 'Cuisine: Indian', description: 'Dish must be a traditional or modern Indian preparation.' },
  { id: 'technique_fermented', label: 'Technique: Fermentation', description: 'At least one component must be fermented (kimchi, pickled, sourdough, etc.).' },
  { id: 'technique_braised', label: 'Technique: Braising', description: 'The main protein or vegetable must be slow-braised.' },
  { id: 'technique_sous_vide', label: 'Technique: Sous Vide', description: 'The key component must be cooked sous vide.' },
  { id: 'technique_smoked', label: 'Technique: Smoking', description: 'A core element must be smoked — in a smoker, on the grill, or with a smoking gun.' },
  { id: 'showstopper', label: 'Showstopper centerpiece', description: 'The dish must be visually dramatic and serve as the table centerpiece.' },
  { id: 'fusion', label: 'Fusion of 2 cuisines', description: 'The dish must blend elements from exactly two distinct culinary traditions.' },
  { id: 'seasonal', label: 'Seasonal only', description: 'Every ingredient must be currently in season.' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildCategorySlots(guestCount) {
  const slots = []
  if (guestCount <= 2) {
    slots.push('main', 'dessert')
  } else if (guestCount <= 4) {
    slots.push('appetizer', 'main', 'carb', 'dessert')
  } else if (guestCount <= 6) {
    slots.push('appetizer', 'appetizer', 'main', 'main', 'carb', 'dessert')
  } else if (guestCount <= 8) {
    slots.push('appetizer', 'appetizer', 'main', 'main', 'carb', 'side', 'dessert', 'drink')
  } else {
    const appCount = Math.max(2, Math.round(guestCount * 0.25))
    const mainCount = Math.max(2, Math.round(guestCount * 0.25))
    const carbCount = Math.max(1, Math.round(guestCount * 0.15))
    const sideCount = Math.max(1, Math.round(guestCount * 0.15))
    const dessertCount = Math.max(1, Math.round(guestCount * 0.10))
    const drinkCount = Math.max(1, Math.round(guestCount * 0.10))
    for (let i = 0; i < appCount; i++) slots.push('appetizer')
    for (let i = 0; i < mainCount; i++) slots.push('main')
    for (let i = 0; i < carbCount; i++) slots.push('carb')
    for (let i = 0; i < sideCount; i++) slots.push('side')
    for (let i = 0; i < dessertCount; i++) slots.push('dessert')
    for (let i = 0; i < drinkCount; i++) slots.push('drink')
  }
  while (slots.length < guestCount) slots.push(pickRandom(['side', 'drink', 'appetizer']))
  return slots.slice(0, guestCount)
}

export function randomizeAssignments(guests) {
  if (!guests.length) return []
  const expertGuests = guests.filter(g => g.isExpertChef)
  const regularGuests = guests.filter(g => !g.isExpertChef)
  const slots = shuffle(buildCategorySlots(guests.length))
  const expertPreferred = ['main', 'dessert', 'carb']
  const expertSlots = slots.filter(s => expertPreferred.includes(s))
  const regularSlots = slots.filter(s => !expertPreferred.includes(s))
  const availableForExperts = shuffle([...expertSlots, ...regularSlots])
  const availableForRegular = [...availableForExperts]
  const assignments = []
  const usedSlotIndices = new Set()
  const shuffledExperts = shuffle(expertGuests)
  for (const guest of shuffledExperts) {
    let slotIdx = availableForExperts.findIndex(
      (s, i) => !usedSlotIndices.has(i) && expertPreferred.includes(s)
    )
    if (slotIdx === -1) slotIdx = availableForExperts.findIndex((_, i) => !usedSlotIndices.has(i))
    const category = slotIdx >= 0 ? availableForExperts[slotIdx] : pickRandom(['main', 'dessert'])
    if (slotIdx >= 0) usedSlotIndices.add(slotIdx)
    const constraint = pickRandom(EXPERT_CONSTRAINTS)
    assignments.push({ guestId: guest.id, category, expertConstraint: constraint })
  }
  const shuffledRegulars = shuffle(regularGuests)
  for (const guest of shuffledRegulars) {
    const slotIdx = availableForRegular.findIndex((_, i) => !usedSlotIndices.has(i))
    const category = slotIdx >= 0 ? availableForRegular[slotIdx] : pickRandom(['appetizer', 'side', 'drink'])
    if (slotIdx >= 0) usedSlotIndices.add(slotIdx)
    assignments.push({ guestId: guest.id, category, expertConstraint: null })
  }
  return assignments
}
