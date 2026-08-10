import { useState, useCallback } from 'react';
import { setPin as savePinToStorage, clearPin } from '../services/api';
import { API_BASE } from '../constants/friends';

const PIN_KEY = 'trivia_host_pin';

export function useHostAuth() {
  const [isHost, setIsHost] = useState(
    () => !!sessionStorage.getItem(PIN_KEY)
  );
  const [error, setError] = useState('');
  const apiBaseUrl = import.meta.env.VITE_API_URL || API_BASE;

  const login = useCallback(async (pin) => {
    // Verificamos el PIN haciendo una llamada protegida
    try {
      savePinToStorage(pin);
      const res = await fetch(`${apiBaseUrl}/reset-estado`, {
        method: 'POST',
        headers: { 'X-Pin': pin, 'Content-Type': 'application/json' },
        // Usamos un endpoint de solo lectura para validar — en realidad
        // llamamos al GET /estado que es público, y la validación real
        // se da cuando el anfitrión toca botones protegidos.
      });
      if (!res.ok) {
        throw new Error('PIN incorrecto');
      }
      setIsHost(true);
      setError('');
      return true;
    } catch {
      clearPin();
      setError('PIN incorrecto');
      setIsHost(false);
      return false;
    }
  }, [apiBaseUrl]);

  const validatePin = useCallback(async (pin) => {
    try {
      const res = await fetch(`${apiBaseUrl}/estado`);
      const estado = await res.json();
      // Ahora intentamos un POST protegido con el PIN
      const res2 = await fetch(`${apiBaseUrl}/estado`, {
        method: 'POST',
        headers: { 'X-Pin': pin, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta_activa: estado.pregunta_activa }),
      });
      if (res2.ok) {
        savePinToStorage(pin);
        setIsHost(true);
        setError('');
        return true;
      }
      throw new Error('PIN incorrecto');
    } catch {
      clearPin();
      setError('PIN incorrecto');
      setIsHost(false);
      return false;
    }
  }, [apiBaseUrl]);

  const logout = useCallback(() => {
    clearPin();
    setIsHost(false);
    setError('');
  }, []);

  return { isHost, error, validatePin, logout };
}
