// Maps category names and types to emoji icons.
// Used when a category has no icon stored in the DB.

const NAME_MAP: Record<string, string> = {
  // Income
  salary: '💼',
  salario: '💼',
  wage: '💼',
  freelance: '💻',
  investment: '📈',
  inversión: '📈',
  dividends: '💹',
  dividendos: '💹',
  bonus: '🎁',
  rental: '🏠',
  arriendo: '🏠',
  'side income': '🤑',
  refund: '↩️',

  // Food & Drink
  food: '🍔',
  comida: '🍔',
  groceries: '🛒',
  mercado: '🛒',
  restaurant: '🍽️',
  restaurante: '🍽️',
  coffee: '☕',
  café: '☕',
  drinks: '🍺',
  alcohol: '🍷',

  // Transport
  transport: '🚗',
  transporte: '🚗',
  transportation: '🚗',
  gas: '⛽',
  gasolina: '⛽',
  fuel: '⛽',
  uber: '🚕',
  taxi: '🚕',
  metro: '🚇',
  bus: '🚌',
  flight: '✈️',
  vuelo: '✈️',
  parking: '🅿️',

  // Housing
  housing: '🏠',
  vivienda: '🏠',
  rent: '🏠',
  mortgage: '🏦',
  utilities: '💡',
  servicios: '💡',
  electricity: '⚡',
  electricidad: '⚡',
  water: '💧',
  agua: '💧',
  internet: '📡',
  phone: '📱',
  teléfono: '📱',

  // Health
  health: '🏥',
  salud: '🏥',
  medical: '💊',
  médico: '💊',
  pharmacy: '💊',
  farmacia: '💊',
  gym: '🏋️',
  gimnasio: '🏋️',
  dental: '🦷',

  // Entertainment
  entertainment: '🎮',
  entretenimiento: '🎮',
  gaming: '🕹️',
  movies: '🎬',
  cine: '🎬',
  music: '🎵',
  música: '🎵',
  streaming: '📺',
  books: '📚',
  libros: '📚',
  sports: '⚽',
  deporte: '⚽',

  // Shopping
  shopping: '🛍️',
  compras: '🛍️',
  clothes: '👕',
  ropa: '👕',
  electronics: '📱',
  electrónica: '📱',

  // Education
  education: '🎓',
  educación: '🎓',
  school: '🏫',
  colegio: '🏫',
  courses: '📖',
  cursos: '📖',

  // Travel
  travel: '✈️',
  viaje: '✈️',
  vacation: '🏖️',
  vacaciones: '🏖️',
  hotel: '🏨',

  // Personal care
  personal: '🪥',
  beauty: '💄',
  belleza: '💄',
  haircut: '💈',
  peluquería: '💈',

  // Finance
  taxes: '🧾',
  impuestos: '🧾',
  insurance: '🛡️',
  seguro: '🛡️',
  savings: '🏦',
  ahorros: '🏦',
  fees: '💳',

  // Pets
  pets: '🐶',
  mascotas: '🐶',
  vet: '🐾',

  // Gifts & Donations
  gifts: '🎁',
  regalos: '🎁',
  donations: '🤝',
  donaciones: '🤝',

  // Other
  other: '📦',
  otros: '📦',
  misc: '📦',
  miscellaneous: '📦',
}

const TYPE_FALLBACK: Record<string, string> = {
  INCOME: '💰',
  EXPENSE: '💳',
  BOTH: '🔄',
}

/**
 * Returns an emoji for a category.
 * Priority: stored icon > name match > type fallback.
 */
export function getCategoryIcon(
  category: { name: string; icon?: string | null; type?: string },
): string {
  if (category.icon) return category.icon

  const key = category.name.toLowerCase().trim()

  // Exact match
  if (NAME_MAP[key]) return NAME_MAP[key]

  // Partial match (first keyword found in name)
  for (const [word, emoji] of Object.entries(NAME_MAP)) {
    if (key.includes(word)) return emoji
  }

  return TYPE_FALLBACK[category.type ?? ''] ?? '📦'
}
