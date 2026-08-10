import * as LucideIcons from 'lucide-react';

/**
 * Atom: Icon
 * Wrapper de lucide-react. Acepta el nombre del icono como string.
 * @param {string} name - Nombre del icono (ej. "Zap", "Star", "Crown")
 */
export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2.5, className = '' }) {
  const LucideIcon = LucideIcons[name];
  if (!LucideIcon) {
    // Fallback si el nombre no existe
    const Fallback = LucideIcons['Circle'];
    return <Fallback size={size} color={color} strokeWidth={strokeWidth} className={className} />;
  }
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} className={className} />;
}
