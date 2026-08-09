# Trivia Chuchaqui - Votaciones y Ruleta

Una aplicación web interactiva para jugar con amigos, hacer votaciones en vivo, girar ruletas de castigos/retos, y desempatar con minijuegos 3D. 

## 🚀 Características Principales

*   **Votaciones en Vivo**: Panel de TV (`/resultados`) que muestra un podio y columnas que bailan en tiempo real usando *polling*.
*   **Ranking Dinámico**: Posiciones calculadas en base a votos totales con categorías como *Rey del Chuchaqui*, *Los Entonados*, *Aprendices del Chuchaqui*, etc.
*   **Desempates Múltiples**: Si hay un empate entre varios jugadores, el Anfitrión puede iniciar una ronda de desempate tirando una moneda 3D que ordena a los participantes uno por uno.
*   **Ruletas**:
    *   **Amigos**: Para elegir al azar a una víctima del grupo.
    *   **Retos**: Contiene 12 retos por defecto. No se repiten y guarda el progreso.
    *   *Nota*: ¡Puedes agregar personas o retos extra al vuelo!
*   **Control de Anfitrión**: Mediante el uso de un **PIN secreto (`2026`)** el anfitrión puede habilitar/deshabilitar preguntas, reiniciar votos y controlar la ruleta.
*   **Interfaz Móvil**: Vista optimizada para teléfonos (`/votar`) para que todos puedan emitir sus votos cómodamente.

## 🛠️ Stack Tecnológico

*   **Backend**: Python con **FastAPI** (Almacenamiento liviano en archivos `.json` locales).
*   **Frontend**: React + Vite.
*   **Estilos**: Módulos CSS con variables CSS personalizadas y diseño adaptativo.
*   **Gráficos**: Recharts (con animaciones personalizadas en SVG) y Lucide React (Íconos).

## 💻 Instrucciones de Ejecución

Para correr el proyecto en red local y que tus amigos se conecten:

### 1. Levantar el Backend (FastAPI)
En la carpeta raíz del proyecto, ejecuta:
```bash
pip install fastapi uvicorn pydantic
uvicorn api:app --reload --host 0.0.0.0
```
*(El backend correrá en el puerto 8000 por defecto)*

### 2. Levantar el Frontend (React + Vite)
Abre otra terminal, entra a la carpeta frontend e instala las dependencias:
```bash
cd frontend
npm install
npm run dev -- --host
```
*(La bandera `--host` expone la app en tu red local para que otros se conecten desde sus celulares).*

---

*Desarrollado para el Grupo Chuchaqui* 🍻
