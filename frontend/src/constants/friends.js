// Configuración de la API
export const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Lista de amigos y sus configuraciones
export const AMIGOS = [
  { nombre: 'Kyu',      icono: 'Zap',    color: '#22C55E', grad: 'var(--grad-friend-6)' }, // Verde
  { nombre: 'Elaina',   icono: 'Star',   color: '#2DD4BF', grad: 'var(--grad-friend-2)' }, // Teal
  { nombre: 'Superboy', icono: 'Shield', color: '#FACC15', grad: 'var(--grad-friend-3)' }, // Amarillo
  { nombre: 'Emilio',   icono: 'Flame',  color: '#F97316', grad: 'var(--grad-friend-4)' }, // Naranja
  { nombre: 'Hally',    icono: 'Heart',  color: '#38BDF8', grad: 'var(--grad-friend-5)' }, // Sky Blue
  { nombre: 'JL',       icono: 'Crown',  color: '#171717', grad: 'var(--grad-friend-1)' }, // Negro
  { nombre: 'Lucho',    icono: 'Rocket', color: '#F43F5E', grad: 'var(--grad-friend-7)' }, // Rojo
  { nombre: 'Gio',      icono: 'Trophy', color: '#3B82F6', grad: 'var(--grad-friend-8)' }, // Azul
];

export const COLOR_POR_AMIGO = Object.fromEntries(
  AMIGOS.map(a => [a.nombre, a.color])
);

export const GRAD_POR_AMIGO = Object.fromEntries(
  AMIGOS.map(a => [a.nombre, a.grad])
);

