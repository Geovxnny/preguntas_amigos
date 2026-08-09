// Configuración de la API
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Lista de amigos y sus configuraciones
export const AMIGOS = [
  { nombre: 'Kyu',      icono: 'Zap',    color: '#4A7FE8', grad: 'var(--grad-friend-1)' },
  { nombre: 'Elaina',   icono: 'Star',   color: '#2DD4BF', grad: 'var(--grad-friend-2)' },
  { nombre: 'Superboy', icono: 'Shield', color: '#FB923C', grad: 'var(--grad-friend-3)' },
  { nombre: 'Emilio',   icono: 'Flame',  color: '#F43F5E', grad: 'var(--grad-friend-4)' },
  { nombre: 'Hally',    icono: 'Heart',  color: '#A855F7', grad: 'var(--grad-friend-5)' },
  { nombre: 'JL',       icono: 'Crown',  color: '#22C55E', grad: 'var(--grad-friend-6)' },
  { nombre: 'Lucho',    icono: 'Rocket', color: '#EAB308', grad: 'var(--grad-friend-7)' },
  { nombre: 'Gio',      icono: 'Trophy', color: '#EC4899', grad: 'var(--grad-friend-8)' },
];

export const COLOR_POR_AMIGO = Object.fromEntries(
  AMIGOS.map(a => [a.nombre, a.color])
);

export const GRAD_POR_AMIGO = Object.fromEntries(
  AMIGOS.map(a => [a.nombre, a.grad])
);

// Orden de medallas del ranking
export const MEDALLAS = ['🥇', '🥈', '🥉'];
