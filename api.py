"""
API REST para Trivia entre Amigos
Expone los datos de votos, estado y preguntas para el frontend React.
"""

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os

# =========================================================
# CONFIGURACIÓN (misma que trivia_app.py)
# =========================================================

VOTES_FILE = "votos.json"
ESTADO_FILE = "estado.json"
PIN_ANFITRION = "2026"

AMIGOS = ["Kyu", "Elaina", "Superboy", "Emilio", "Hally", "JL", "Lucho", "Gio"]

LUCIDE_ICONS = {
    "Kyu": "Zap",
    "Elaina": "Star",
    "Superboy": "Shield",
    "Emilio": "Flame",
    "Hally": "Heart",
    "JL": "Crown",
    "Lucho": "Rocket",
    "Gio": "Trophy",
}

COLORES_BOTONES = [
    "#4A7FE8",  # azul
    "#2DD4BF",  # teal
    "#FB923C",  # naranja
    "#F43F5E",  # rojo/coral
    "#A855F7",  # morado
    "#22C55E",  # verde
    "#EAB308",  # amarillo
    "#EC4899",  # rosa
]

PREGUNTAS = [
    'El Kinesiologo. ¿Quién es él que pasa más tiempo quejándose de la rodilla / tobillo que jugando?',
    'El Falta de Oxígeno. ¿Quién es él que corre 10 metros y en tres días recupera el aire?',
    'El Superviviente. Si estuviéramos en un apocalipsis zombi, ¿quién sobreviviría más tiempo por su resistencia?',
    'El Nutricionista. ¿Quién es el que más crítica lo que comen los demás?',
    'El Coleccionista de Medallas: ¿Quién es el que se inscribe a todas las carreras de la ciudad y trota un kilómetro solo para tener la foto con la medalla en Instagram?',
    'El Repetitivo. ¿Quién se obsesiona con una canción y la pone tanto que todos la odian?',
    'El Dictador Musical. ¿Quién es el que siempre se adueña de la música y pone lo más raro?',
    'El Avergonzando Musical. ¿A quién le daría más vergüenza que mostremos a todos su "Spotify Wrapped" (sus canciones más escuchadas del año)?',
    'El Falso Ecléctico. ¿Quién es el que siempre dice "yo escucho de todo, pon nomás", pero si le pones una canción de un género que no le gusta se pasa quejando todo el rato?',
    'El Básico Discreto. ¿Quién es el que critica el reggaetón viejo, el vallenato o la chicha, pero cuando pega el trago es el que más canta?',
    'El "Una Más y Nos Vamos". ¿Quién dice que solo se toma una cerveza y termina siendo el más picado?',
    'El Desaparecido. ¿Quién confirma que va al plan y al final dice una excusa sin sentido?',
    'El Gastón. ¿Quién quiere ir al lugar más caro de la ciudad cuando el presupuesto del grupo es de cinco dólares?',
    'El Designado Obligado. ¿Quién termina siempre cuidando al grupo porque es el más responsable?',
    'El Mala Copa. ¿Quién es más probable a pelearse en un bar?',
    'El Cabeza de Pollo. ¿Quién es el que se emborracha más rápido?',
    'El Formato APA. ¿Quién es tan perfeccionista con detalles insignificantes que a nadie más le importan?',
    'El Milagroso. ¿Quién no estudia nada durante todo el semestre, pero pasa sin problemas?',
    'El Guardia Fighter. ¿Quién es más probable que se peleé con un guardia de su U?',
    'El Doble-Cara. ¿Quién es el que más se queja de su U, pero la defiende a muerte?',
    'El Alcalde. ¿Quién es el más probable a terminar hablando con un desconocido y hacerse amigo de él en 5 minutos?',
    'El Paparazzi. ¿Quién pasa toda la reunión tomando fotos y videos?',
    'El Filtro Cero. ¿Quién dice lo primero que se le pasa por la mente sin pensar si es apropiado o incómodo?',
    'El Reloj Atrasado. ¿Quién es el que siempre llega tarde a todas las reuniones?',
    'El Metido. ¿A quién no le prestarían su teléfono desbloqueado?',
    'El Banco del Grupo. ¿Quién siempre presta dinero para la cuenta colectiva y le toca estar cobrando un mes después?',
    'El Bóveda de Secretos. ¿Quién se sabe los chismes de todo el grupo, pero jamás los revela a nadie externo?',
    'El Escucha Activa. ¿Quién es la persona que mejor sabe escuchar cuando alguien tiene un problema?',
    'El Codicioso. ¿Quién aceptaría un millón de dólares a cambio de no volver a hablar con nadie de este grupo nunca más?',
    'El Conductor Preferido. Si todos tuviesen moto o carro, ¿En quién confiarías si tuvieses que subirte en su moto o carro?',
    'El "No fui yo". Si alguien del grupo rompe algo caro en este momento por accidente, ¿quién es el más probable a disimular perfectamente y hacerse el loco?',
    'El de Anillo Temprano. ¿Quién es el que probablemente se casará primero?',
    'El FBI. ¿Quién es capaz de averiguar el árbol genealógico completo del crush de un amigo usando solo una foto borrosa?',
    'El Intento de Poeta. ¿Quién se pone sentimental y empieza a hablar de sus ex\'s después de dos tragos?',
    'El Cruceta. ¿Quién es el que más probablemente le robaría el "crush" o el "casi algo" a otro amigo del grupo?',
    'El Toque Final. ¿A quién le darías el teléfono para que te concrete el vacile?',
    'El Comprador de Nimiedades. ¿Quién compra baratijas o pequeñas cosas solo por el gusto de gastar dinero?',
    'El Mejor Vestido. ¿Quién es el que mejor arma sus outfits?',
    'El Personaje de Caricatura. ¿Quién es el que literalmente parece tener un solo outfit?',
    'El Camaleón. ¿Quién se lleva con cualquier grupo y según eso cambia su personalidad?',
    'El Trasquilado. ¿Quién cada vez que se corta el cabello, por alguna razón, se rapa?',
    'El Cara de Malo. A primera vista, ¿quién parece super serio, bravo o intimidante, pero al hablar es un pan de dios?',
    'El Rompehielos. ¿Quién es el salvador cuando se forma un silencio incómodo en la reunión?',
    'La Cara de Inocente. ¿Quién tiene cara de "yo no rompo un plato", pero intuyes que esconde los peores secretos?',
    'El Chef de Microondas. ¿Quién es el que no sabe ni hervir agua?',
    'El Chef Michelin. ¿Quién es el que jura saber tanto de cocina que mejor era de irse a estudiar gastronomía?',
    'El Rey del Delivery. ¿Quién prefiere pedir comida que caminar una cuadra?',
    'El Empacador Compulsivo. ¿Quién es el que lleva la maleta más pesada, y al final no tiene nada dentro?',
    'El Abuelo-Joven. ¿Quién es el que actúa peor que viejo, pero obviamente es joven aún?',
    'El Enchufe Dependiente. ¿Quién es el que siempre necesita de un enchufe para su laptop o teléfono?',
    'El Mente Artificial. ¿Quién usa la IA hasta para responder un mensaje?',
    'El Windows Update. ¿Quién es el que se demora una vida en procesar una instrucción o entender una explicación?',
    'El Peatón Distraído. ¿Quién va a morir atropellado por andar con su teléfono en la calle?',
]

# =========================================================
# HELPERS (igual que trivia_app.py)
# =========================================================

def cargar_votos():
    if os.path.exists(VOTES_FILE):
        try:
            with open(VOTES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            return {}
    return {}

def guardar_votos(votos):
    with open(VOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(votos, f, ensure_ascii=False, indent=2)

def cargar_estado():
    if os.path.exists(ESTADO_FILE):
        try:
            with open(ESTADO_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            pass
    return {"pregunta_activa": 1}

def guardar_estado(pregunta_num: int):
    with open(ESTADO_FILE, "w", encoding="utf-8") as f:
        json.dump({"pregunta_activa": pregunta_num}, f, ensure_ascii=False, indent=2)

def verificar_pin(x_pin: Optional[str]):
    if x_pin != PIN_ANFITRION:
        raise HTTPException(status_code=403, detail="PIN incorrecto")

# =========================================================
# APP FASTAPI
# =========================================================

app = FastAPI(title="Trivia entre Amigos API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── MODELOS ────────────────────────────────────────────

class VotoPayload(BaseModel):
    pregunta_idx: int
    amigo: str

class EstadoPayload(BaseModel):
    pregunta_activa: int

# ─── ENDPOINTS ──────────────────────────────────────────

@app.get("/preguntas")
def get_preguntas():
    """Devuelve la lista de preguntas, amigos, iconos y colores."""
    amigos_info = [
        {
            "nombre": amigo,
            "icono": LUCIDE_ICONS.get(amigo, "User"),
            "color": COLORES_BOTONES[i % len(COLORES_BOTONES)],
        }
        for i, amigo in enumerate(AMIGOS)
    ]
    return {
        "preguntas": PREGUNTAS,
        "amigos": amigos_info,
        "total": len(PREGUNTAS),
    }

@app.get("/estado")
def get_estado():
    """Devuelve cuál es la pregunta activa actualmente."""
    return cargar_estado()

@app.post("/estado")
def set_estado(payload: EstadoPayload, x_pin: Optional[str] = Header(None)):
    """Cambia la pregunta activa (requiere PIN de anfitrión)."""
    verificar_pin(x_pin)
    if not (1 <= payload.pregunta_activa <= len(PREGUNTAS)):
        raise HTTPException(status_code=400, detail="Índice de pregunta fuera de rango")
    guardar_estado(payload.pregunta_activa)
    return {"ok": True, "pregunta_activa": payload.pregunta_activa}

@app.get("/votos")
def get_todos_votos():
    """Devuelve todos los votos (para el ranking acumulado)."""
    return cargar_votos()

@app.get("/votos/{idx}")
def get_votos_pregunta(idx: int):
    """Devuelve los votos de una pregunta específica (0-indexada)."""
    votos = cargar_votos()
    key = str(idx)
    base = {a: 0 for a in AMIGOS}
    if key in votos:
        base.update(votos[key])
    return {"idx": idx, "votos": base}

@app.post("/votar")
def votar(payload: VotoPayload):
    """Registra un voto para un amigo en una pregunta."""
    if payload.amigo not in AMIGOS:
        raise HTTPException(status_code=400, detail=f"Amigo '{payload.amigo}' no válido")
    if not (0 <= payload.pregunta_idx < len(PREGUNTAS)):
        raise HTTPException(status_code=400, detail="Índice de pregunta fuera de rango")
    votos = cargar_votos()
    key = str(payload.pregunta_idx)
    if key not in votos:
        votos[key] = {a: 0 for a in AMIGOS}
    votos[key][payload.amigo] = votos[key].get(payload.amigo, 0) + 1
    guardar_votos(votos)
    return {"ok": True, "votos": votos[key]}

@app.post("/reset")
def reset_votos(x_pin: Optional[str] = Header(None)):
    """Reinicia todos los votos (requiere PIN de anfitrión)."""
    verificar_pin(x_pin)
    guardar_votos({})
    return {"ok": True, "message": "Votos reiniciados"}

@app.post("/reset-estado")
def reset_estado(x_pin: Optional[str] = Header(None)):
    """Vuelve a la pregunta 1 (requiere PIN de anfitrión)."""
    verificar_pin(x_pin)
    guardar_estado(1)
    return {"ok": True, "pregunta_activa": 1}
