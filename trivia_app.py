"""
🎉 TRIVIA ENTRE AMIGOS - App tipo Kahoot con Streamlit 🎉
--------------------------------------------------------------
Juego de trivia interactivo con dos vistas:
  1) Modo Celular -> SOLO muestra las opciones de respuesta (sin el
                      texto de la pregunta), estilo Kahoot. Sigue
                      automáticamente la pregunta activa del TV.
  2) Modo TV       -> se proyecta en pantalla grande, muestra la
                      pregunta en grande, controla cuál es la
                      pregunta activa (Anterior/Siguiente) y grafica
                      los votos en tiempo real.

Persistencia:
  - 'votos.json'  -> guarda los votos de cada pregunta.
  - 'estado.json' -> guarda cuál es la pregunta activa, para que el
                      celular sepa en qué pregunta votar sin mostrarla.
"""

import streamlit as st
import json
import os
import socket
import time
import pandas as pd
import plotly.express as px

# =========================================================
# CONFIGURACIÓN GENERAL
# =========================================================

VOTES_FILE = "votos.json"
ESTADO_FILE = "estado.json"  # Guarda cuál es la pregunta activa (la controla el TV)

# PIN para desbloquear el Modo TV, el Ranking y la Zona de administrador.
# Solo tú (desde tu PC) deberías conocerlo. Cámbialo por el que quieras.
PIN_ANFITRION = "2026"

# Lista de amigos / opciones fijas de respuesta (puedes editarla)
AMIGOS = ["Kyu", "Elaina", "Superboy", "Emilio", "Hally", "JL", "Lucho", "Gio"]

# Colores fijos y consistentes para cada amigo en los gráficos
PALETA = px.colors.qualitative.Set2 + px.colors.qualitative.Set3
COLOR_AMIGOS = {amigo: PALETA[i % len(PALETA)] for i, amigo in enumerate(AMIGOS)}

# Estilo tipo Kahoot: cada amigo tiene una forma/emoji + color fijo para el botón
KAHOOT_ESTILOS = [
    {"emoji": " ", "color": "#e21b3c"},
    {"emoji": " ", "color": "#1368ce"},
    {"emoji": " ", "color": "#d89e00"},
    {"emoji": " ", "color": "#26890c"},
    {"emoji": " ", "color": "#0aa3a3"},
    {"emoji": " ", "color": "#864cbf"},
    {"emoji": " ", "color": "#e57a44"},
    {"emoji": " ", "color": "#c2185b"},
]
ESTILO_AMIGOS = {
    amigo: KAHOOT_ESTILOS[i % len(KAHOOT_ESTILOS)] for i, amigo in enumerate(AMIGOS)
}

# =========================================================
# BANCO DE PREGUNTAS (53 preguntas tomadas del Formulario_Recuerdos)
# =========================================================

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
    'El Conductor Preferido. Si todos tuviesen moto o carro, ¿En quién confiarías (que sigue leyes, conduce bien) si tuvieses que subirte en su moto o carro?',
    'El "No fui yo". Si alguien del grupo rompe algo caro en este momento por accidente, ¿quién es el más probable a disimular perfectamente y hacerse el loco?',
    'El de Anillo Temprano. ¿Quién es el que probablemente se casará primero?',
    'El FBI. ¿Quién es capaz de averiguar el árbol genealógico completo del crush de un amigo usando solo una foto borrosa?',
    'El Intento de Poeta. ¿Quién se pone sentimental y empieza a hablar de sus ex’s después de dos tragos?',
    'El Cruceta. ¿Quién es el que más probablemente le robaría el "crush" o el "casi algo" a otro amigo del grupo si supiera que nadie se va a enterar?',
    'El Toque Final. ¿A quién le darías el teléfono para que te concrete el vacile?',
    'El Comprador de Nimiedades. ¿Quién compra baratijas o pequeñas cosas solo por el gusto de gastar dinero?',
    'El Mejor Vestido. ¿Quién es el que mejor arma sus outfits?',
    'El Personaje de Caricatura. ¿Quién es el que literalmente parece tener un solo outfit?',
    'El Camaleón. ¿Quién se lleva con cualquier grupo y según eso cambia su personalidad?',
    'El Trasquilado. ¿Quién cada vez que se corta el cabello, por alguna razón, se rapa?',
    'El Cara de Malo. A primera vista, ¿quién parece super serio, bravo o intimidante, pero al hablar es un pan de dios?',
    'El Rompehielos. ¿Quién es el salvador cuando se forma un silencio incómodo en la reunión?',
    'La Cara de Inocente. ¿Quién tiene cara de "yo no rompo un plato", pero intuyes que esconde los peores secretos o es el más travieso?',
    'El Chef de Microondas. ¿Quién es el que no sabe ni hervir agua?',
    'El Chef Michelin. ¿Quién es el que jura saber tanto de cocina que mejor era de irse a estudiar gastronomía?',
    'El Rey del Delivery. ¿Quién prefiere pedir comida que caminar una cuadra?',
    'El Empacador Compulsivo. ¿Quién es el que lleva la maleta más pesada, y al final no tiene nada dentro?',
    'El Abuelo-Joven. ¿Quién es el que actúa peor que viejo (criticar a la juventud, usar palabras antiguas), pero obviamente es joven aún?',
    'El Enchufe Dependiente. ¿Quién es el que siempre necesita de un enchufe para su laptop o teléfono?',
    'El Mente Artificial. ¿Quién usa la IA hasta para responder un mensaje?',
    'El Windows Update. ¿Quién es el que se demora una vida en procesar una instrucción o entender una explicación?',
    'El Peatón Distraído. ¿Quién va a morir atropellado por andar con su teléfono en la calle?',
]

# =========================================================
# FUNCIONES DE PERSISTENCIA (votos.json)
# =========================================================

def cargar_votos():
    """Lee el archivo de votos. Si no existe o está corrupto, devuelve {}."""
    if os.path.exists(VOTES_FILE):
        try:
            with open(VOTES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            return {}
    return {}


def guardar_votos(votos):
    """Escribe el diccionario de votos completo al archivo JSON."""
    with open(VOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(votos, f, ensure_ascii=False, indent=2)


def registrar_voto(pregunta_idx, amigo):
    """Suma 1 voto para 'amigo' en la pregunta 'pregunta_idx' sin borrar el resto."""
    votos = cargar_votos()
    key = str(pregunta_idx)
    if key not in votos:
        votos[key] = {a: 0 for a in AMIGOS}
    if amigo not in votos[key]:
        votos[key][amigo] = 0
    votos[key][amigo] += 1
    guardar_votos(votos)
    return votos


def obtener_votos_pregunta(votos, pregunta_idx):
    """Devuelve el conteo de votos de una pregunta, rellenando amigos en 0 si faltan."""
    key = str(pregunta_idx)
    base = {a: 0 for a in AMIGOS}
    if key in votos:
        base.update(votos[key])
    return base


def cargar_estado():
    """Lee cuál es la pregunta activa. Si no existe el archivo, empieza en la pregunta 1."""
    if os.path.exists(ESTADO_FILE):
        try:
            with open(ESTADO_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, ValueError):
            pass
    return {"pregunta_activa": 1}


def guardar_estado(pregunta_num):
    """Guarda cuál es la pregunta activa (1-indexada) para que el celular la siga."""
    with open(ESTADO_FILE, "w", encoding="utf-8") as f:
        json.dump({"pregunta_activa": pregunta_num}, f, ensure_ascii=False, indent=2)


def obtener_ip_local():
    """Obtiene la IP local en la red WiFi para compartir con los amigos."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


# =========================================================
# CONFIGURACIÓN DE LA PÁGINA
# =========================================================

st.set_page_config(
    page_title="Trivia entre Amigos 🎉",
    page_icon="🎉",
    layout="wide",
)

if "votos" not in st.session_state:
    st.session_state.votos = cargar_votos()

# =========================================================
# ESTILOS CSS PERSONALIZADOS
# =========================================================

st.markdown(
    """
    <style>
    div.stButton > button {
        height: 4.5em;
        font-size: 1.3em !important;
        font-weight: 700;
        border-radius: 16px;
        border: none;
        background-color: #F4F3FF;
        color: #2B2B2B;
        transition: all 0.12s ease-in-out;
    }
    div.stButton > button:active {
        transform: scale(0.97);
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# =========================================================
# BARRA LATERAL (SIDEBAR)
# =========================================================

st.sidebar.title("🎮 Trivia entre Amigos")

if "es_anfitrion" not in st.session_state:
    st.session_state.es_anfitrion = False

# Candado de anfitrión: mientras no se ingrese el PIN correcto, solo
# se puede votar. El Modo TV, el Ranking y la Zona de administrador
# quedan ocultos (pensado para desbloquearse solo desde la PC).
if not st.session_state.es_anfitrion:
    with st.sidebar.expander("🔐 Soy el anfitrión (PC)"):
        pin_ingresado = st.text_input("PIN de anfitrión", type="password", key="pin_input")
        if st.button("Desbloquear"):
            if pin_ingresado == PIN_ANFITRION:
                st.session_state.es_anfitrion = True
                st.rerun()
            else:
                st.error("PIN incorrecto.")
else:
    st.sidebar.success("🔓 Modo anfitrión activo")
    if st.sidebar.button("🔒 Cerrar modo anfitrión"):
        st.session_state.es_anfitrion = False
        st.rerun()

opciones_modo = ["📱 Votación (Modo Celular)"]
if st.session_state.es_anfitrion:
    opciones_modo += [
        "📺 Pantalla de Resultados (Modo TV/Proyector)",
        "🏆 Resultados Generales (Ranking)",
    ]

modo = st.sidebar.radio("Selecciona la vista:", opciones_modo)

st.sidebar.markdown("---")
st.sidebar.caption(f"🧩 Preguntas cargadas: **{len(PREGUNTAS)}**")
st.sidebar.caption(f"👥 Candidatos: **{len(AMIGOS)}** → {', '.join(AMIGOS)}")

st.sidebar.markdown("---")
ip_local = obtener_ip_local()
st.sidebar.markdown("**📶 Acceso desde la red WiFi:**")
st.sidebar.code(f"http://{ip_local}:8501", language=None)

# Código QR opcional para compartir el link fácilmente
try:
    import qrcode
    from io import BytesIO

    qr_img = qrcode.make(f"http://{ip_local}:8501")
    buf = BytesIO()
    qr_img.save(buf, format="PNG")
    st.sidebar.image(buf.getvalue(), caption="Escanea para votar", width=160)
except ImportError:
    st.sidebar.info("Instala `qrcode[pil]` para mostrar el código QR aquí.")

# La Zona de administrador solo aparece si ya se desbloqueó el modo anfitrión.
if st.session_state.es_anfitrion:
    st.sidebar.markdown("---")
    with st.sidebar.expander("⚠️ Zona de administrador"):
        if st.button("🗑️ Reiniciar todos los votos"):
            guardar_votos({})
            st.session_state.votos = {}
            st.success("Todos los votos fueron reiniciados.")
        if st.button("⏮️ Volver a la Pregunta 1"):
            guardar_estado(1)
            st.session_state.pregunta_activa = 1
            st.session_state.mostrar_resultados = False
            st.success("Pregunta activa reiniciada a la 1.")

# =========================================================
# VISTA 1: MODO CELULAR (VOTACIÓN)
# =========================================================

if modo.startswith("📱"):
    # La pregunta activa la controla el TV; el celular solo la sigue.
    estado = cargar_estado()
    pregunta_num = estado.get("pregunta_activa", 1)
    idx = pregunta_num - 1

    # CSS solo para esta vista: botones compactos, en grilla 2x4 que
    # SIEMPRE reparte el ancho disponible sin desbordar la pantalla
    # (a diferencia de forzar columnas de Streamlit, que se salían
    # del viewport en celulares angostos).
    st.markdown(
        """
        <style>
        [data-testid="stAppViewContainer"] {
            overflow-x: hidden !important;
        }
        div.stButton > button {
            height: 2.6em !important;
            font-size: 0.95em !important;
            padding: 0.2em 0.4em !important;
            border-radius: 12px !important;
            white-space: normal !important;
            line-height: 1.2 !important;
            width: 100% !important;
        }
        /* Convierte cada fila de columnas de esta vista en una grilla
           real de 2 columnas que jamás desborda el ancho de pantalla
           (a diferencia del flex de Streamlit, que se salía del
           viewport en celulares angostos). */
        div[data-testid="stHorizontalBlock"] {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 0.5rem !important;
            width: 100% !important;
        }
        div[data-testid="stHorizontalBlock"] > div[data-testid="column"] {
            width: 100% !important;
            min-width: 0 !important;
            flex: none !important;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    col_sync1, col_sync2 = st.columns([3, 1])
    with col_sync1:
        st.markdown(
            f"""
            <div style="background-color:#2B2B2B; padding:0.6em; border-radius:14px; text-align:center;">
                <span style="color:white; font-size:1.1em; font-weight:700;">👀 Pregunta {pregunta_num}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with col_sync2:
        if st.button("🔄", use_container_width=True):
            st.rerun()

    st.write("")
    st.write("##### 👇 Elige tu respuesta:")

    col1, col2 = st.columns(2)
    columnas = [col1, col2]

    for i, amigo in enumerate(AMIGOS):
        estilo = ESTILO_AMIGOS[amigo]
        col = columnas[i % 2]
        with col:
            if st.button(
                f"{estilo['emoji']} {amigo}",
                key=f"btn_{idx}_{amigo}",
                use_container_width=True,
            ):
                st.session_state.votos = registrar_voto(idx, amigo)
                st.toast(f"¡Voto registrado para {amigo}! 🎉")

    st.markdown("---")
    auto_movil = st.checkbox("♻️ Auto-sincronizar con la pantalla (cada 4 segundos)")
    if auto_movil:
        time.sleep(4)
        st.rerun()


# =========================================================
# VISTA 2: MODO TV / PROYECTOR (RESULTADOS)
# =========================================================

elif modo.startswith("📺"):
    st.title("📺 Resultados en vivo")

    # 'pregunta_activa' es NUESTRA variable de estado (no está atada a
    # ningún widget), así podemos modificarla libremente desde los
    # botones ⬅️➡️. El selectbox solo LEE su valor inicial con 'index'.
    if "pregunta_activa" not in st.session_state:
        st.session_state.pregunta_activa = cargar_estado().get("pregunta_activa", 1)
    if "mostrar_resultados" not in st.session_state:
        st.session_state.mostrar_resultados = False

    col_prev, col_sel, col_next, col_refresh = st.columns([1, 3, 1, 2])

    with col_prev:
        st.write("")
        if st.button("⬅️", use_container_width=True) and st.session_state.pregunta_activa > 1:
            st.session_state.pregunta_activa -= 1
            st.session_state.mostrar_resultados = False
            guardar_estado(st.session_state.pregunta_activa)
            st.rerun()

    with col_sel:
        pregunta_num_tv = st.selectbox(
            "Pregunta activa (visible solo aquí, en pantalla):",
            list(range(1, len(PREGUNTAS) + 1)),
            format_func=lambda n: f"Pregunta {n}",
            index=st.session_state.pregunta_activa - 1,
            key="select_pregunta_tv",
        )
        if pregunta_num_tv != st.session_state.pregunta_activa:
            st.session_state.pregunta_activa = pregunta_num_tv
            st.session_state.mostrar_resultados = False
            guardar_estado(pregunta_num_tv)
            st.rerun()

    with col_next:
        st.write("")
        if (
            st.button("➡️", use_container_width=True)
            and st.session_state.pregunta_activa < len(PREGUNTAS)
        ):
            st.session_state.pregunta_activa += 1
            st.session_state.mostrar_resultados = False
            guardar_estado(st.session_state.pregunta_activa)
            st.rerun()

    with col_refresh:
        st.write("")
        if st.button("🔄 Actualizar votos", use_container_width=True):
            st.session_state.votos = cargar_votos()

    idx_tv = st.session_state.pregunta_activa - 1

    st.markdown(
        f"""
        <div style="background-color:#2B2B2B; padding:2.5em; border-radius:20px; margin:1em 0;">
            <h1 style="color:white; text-align:center; font-size:2.6em;">{PREGUNTAS[idx_tv]}</h1>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<br>", unsafe_allow_html=True)

    # -----------------------------------------------------
    # FASE 1: solo la pregunta, sin resultados (para votar)
    # -----------------------------------------------------
    if not st.session_state.mostrar_resultados:
        col_btn = st.columns([1, 2, 1])[1]
        with col_btn:
            if st.button("📊 Mostrar resultados", use_container_width=True):
                st.session_state.votos = cargar_votos()
                st.session_state.mostrar_resultados = True
                st.rerun()
        st.caption("La pregunta está en pantalla. Tus amigos ya pueden votar desde su celular.")

    # -----------------------------------------------------
    # FASE 2: gráfico de resultados de esta pregunta
    # -----------------------------------------------------
    else:
        col_btn = st.columns([1, 2, 1])[1]
        with col_btn:
            if st.button("⬅️ Ocultar resultados (volver a la pregunta)", use_container_width=True):
                st.session_state.mostrar_resultados = False
                st.rerun()

        conteo = obtener_votos_pregunta(st.session_state.votos, idx_tv)
        df = pd.DataFrame(
            {"Amigo": list(conteo.keys()), "Votos": list(conteo.values())}
        ).sort_values("Votos", ascending=False)

        total_votos = df["Votos"].sum()

        fig = px.bar(
            df,
            x="Votos",
            y="Amigo",
            orientation="h",
            color="Amigo",
            color_discrete_map=COLOR_AMIGOS,
            text="Votos",
        )
        fig.update_traces(textposition="outside", textfont_size=22, marker_line_width=0)
        fig.update_layout(
            showlegend=False,
            yaxis={"categoryorder": "total ascending"},
            xaxis_title="",
            yaxis_title="",
            font=dict(size=20),
            height=520,
            margin=dict(l=10, r=40, t=20, b=10),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
        )

        st.plotly_chart(fig, use_container_width=True)
        st.markdown(f"### 🗳️ Total de votos en esta pregunta: **{total_votos}**")

        auto = st.checkbox("♻️ Auto-actualizar cada 5 segundos (mantener esta casilla activada)")
        if auto:
            time.sleep(5)
            st.session_state.votos = cargar_votos()
            st.rerun()

# =========================================================
# VISTA 3: RESULTADOS GENERALES (RANKING ACUMULADO)
# =========================================================

else:
    st.title("🏆 Resultados Generales")
    st.caption(
        "Suma un punto al amigo (o amigos, en caso de empate) más votado "
        "en cada pregunta ya respondida."
    )

    if st.button("🔄 Actualizar ranking"):
        st.session_state.votos = cargar_votos()

    votos_todos = st.session_state.votos
    puntos = {a: 0 for a in AMIGOS}
    preguntas_contabilizadas = 0

    for key, conteo_pregunta in votos_todos.items():
        total = sum(conteo_pregunta.values())
        if total == 0:
            continue
        preguntas_contabilizadas += 1
        max_votos = max(conteo_pregunta.values())
        ganadores = [a for a, v in conteo_pregunta.items() if v == max_votos and v > 0]
        for ganador in ganadores:
            if ganador in puntos:
                puntos[ganador] += 1

    df_ranking = pd.DataFrame(
        {"Amigo": list(puntos.keys()), "Preguntas ganadas": list(puntos.values())}
    ).sort_values("Preguntas ganadas", ascending=False).reset_index(drop=True)

    st.markdown(f"### 📋 Preguntas contabilizadas hasta ahora: **{preguntas_contabilizadas}** / {len(PREGUNTAS)}")

    if df_ranking["Preguntas ganadas"].sum() == 0:
        st.info("Todavía no hay votos registrados. ¡Empieza a jugar para ver el ranking!")
    else:
        # Podio con medallas para el Top 3
        medallas = ["🥇", "🥈", "🥉"]
        top3 = df_ranking.head(3)
        cols_podio = st.columns(len(top3))
        for i, (col, (_, fila)) in enumerate(zip(cols_podio, top3.iterrows())):
            with col:
                st.markdown(
                    f"""
                    <div style="background-color:#F4F3FF; padding:1.2em; border-radius:16px; text-align:center;">
                        <div style="font-size:2.5em;">{medallas[i] if i < len(medallas) else "🏅"}</div>
                        <div style="font-size:1.4em; font-weight:700;">{fila['Amigo']}</div>
                        <div style="font-size:1.1em; color:#555;">{fila['Preguntas ganadas']} preguntas ganadas</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        st.markdown("<br>", unsafe_allow_html=True)

        fig_ranking = px.bar(
            df_ranking,
            x="Preguntas ganadas",
            y="Amigo",
            orientation="h",
            color="Amigo",
            color_discrete_map=COLOR_AMIGOS,
            text="Preguntas ganadas",
        )
        fig_ranking.update_traces(textposition="outside", textfont_size=20, marker_line_width=0)
        fig_ranking.update_layout(
            showlegend=False,
            yaxis={"categoryorder": "total ascending"},
            xaxis_title="",
            yaxis_title="",
            font=dict(size=18),
            height=480,
            margin=dict(l=10, r=40, t=20, b=10),
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_ranking, use_container_width=True)