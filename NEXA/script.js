const canciones = [
    {
        titulo: "Canción 1",
        artista: "NEXA",
        archivo: "music/cancion1.mp3"
    },
    {
        titulo: "Canción 2",
        artista: "NEXA",
        archivo: "music/cancion2.mp3"
    },
    {
        titulo: "Canción 3",
        artista: "NEXA",
        archivo: "music/cancion3.mp3"
    },
    {
        titulo: "Canción 4",
        artista: "NEXA",
        archivo: "music/cancion4.mp3"
    }
];

let posicion = 0;
let reproduciendo = false;

const audio = new Audio();

const playButton = document.querySelector(".main-play");
const previousButton = document.querySelector("#previousButton");
const nextButton = document.querySelector("#nextButton");
const volume = document.querySelector(".volume input");

const progressBar = document.querySelector("#progressBar");
const currentTime = document.querySelector("#currentTime");
const duration = document.querySelector("#duration");

const tituloActual = document.querySelector(".current-song strong");
const artistaActual = document.querySelector(".current-song p");


// ===============================
// TIEMPO
// ===============================

function formatoTiempo(segundos) {
    if (isNaN(segundos)) return "0:00";

    const minutos = Math.floor(segundos / 60);

    const segundosRestantes = Math.floor(segundos % 60)
        .toString()
        .padStart(2, "0");

    return `${minutos}:${segundosRestantes}`;
}


// ===============================
// CARGAR CANCIÓN
// ===============================

function cargarCancion() {

    const cancion = canciones[posicion];

    audio.src = cancion.archivo;

    tituloActual.textContent = cancion.titulo;
    artistaActual.textContent = cancion.artista;

    progressBar.value = 0;
    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    reproduciendo = false;
    playButton.textContent = "▶";

    actualizarBotones();
}


// ===============================
// REPRODUCIR
// ===============================

function reproducir() {

    audio.play()
        .then(() => {

            reproduciendo = true;
            playButton.textContent = "⏸";

            actualizarBotones();

        })
        .catch(error => {

            console.error(error);

            alert("No se pudo reproducir el audio.");

        });
}


// ===============================
// PAUSAR
// ===============================

function pausar() {

    audio.pause();

    reproduciendo = false;

    playButton.textContent = "▶";

    actualizarBotones();
}


// ===============================
// PLAY PRINCIPAL
// ===============================

playButton.addEventListener("click", () => {

    if (reproduciendo) {
        pausar();
    } else {
        reproducir();
    }

});


// ===============================
// BOTONES DE CANCIONES
// ===============================

function configurarBotonesMusica() {

    document.querySelectorAll(".music-card").forEach(tarjeta => {

        const boton =
            tarjeta.querySelector(".play-btn");

        if (!boton) return;

        boton.onclick = () => {

            const titulo =
                tarjeta.dataset.song ||
                tarjeta.querySelector("h3").textContent;

            const indice =
                canciones.findIndex(
                    cancion => cancion.titulo === titulo
                );

            if (indice === -1) return;

            posicion = indice;

            cargarCancion();

            reproducir();

        };

    });

}


// ===============================
// ACTUALIZAR BOTONES
// ===============================

function actualizarBotones() {

    document.querySelectorAll(".music-card").forEach(tarjeta => {

        const boton =
            tarjeta.querySelector(".play-btn");

        if (!boton) return;

        const titulo =
            tarjeta.dataset.song ||
            tarjeta.querySelector("h3").textContent;

        if (
            canciones[posicion] &&
            canciones[posicion].titulo === titulo &&
            reproduciendo
        ) {
            boton.textContent = "⏸";
        } else {
            boton.textContent = "▶";
        }

    });

}


// ===============================
// ANTERIOR
// ===============================

previousButton.addEventListener("click", () => {

    posicion--;

    if (posicion < 0) {
        posicion = canciones.length - 1;
    }

    cargarCancion();
    reproducir();

});


// ===============================
// SIGUIENTE
// ===============================

nextButton.addEventListener("click", () => {

    posicion++;

    if (posicion >= canciones.length) {
        posicion = 0;
    }

    cargarCancion();
    reproducir();

});


// ===============================
// AUTOMÁTICO
// ===============================

audio.addEventListener("ended", () => {

    posicion++;

    if (posicion >= canciones.length) {
        posicion = 0;
    }

    cargarCancion();
    reproducir();

});


// ===============================
// DURACIÓN
// ===============================

audio.addEventListener("loadedmetadata", () => {

    duration.textContent =
        formatoTiempo(audio.duration);

    progressBar.max =
        audio.duration;

});


// ===============================
// PROGRESO
// ===============================

audio.addEventListener("timeupdate", () => {

    progressBar.value =
        audio.currentTime;

    currentTime.textContent =
        formatoTiempo(audio.currentTime);

});


progressBar.addEventListener("input", () => {

    audio.currentTime =
        progressBar.value;

});


// ===============================
// VOLUMEN
// ===============================

audio.volume = 0.7;

volume.addEventListener("input", () => {

    audio.volume =
        volume.value / 100;

});


// ===============================
// FAVORITOS
// ===============================

let favoritos =
    JSON.parse(
        localStorage.getItem("nexaFavoritos")
    ) || [];


function guardarFavoritos() {

    localStorage.setItem(
        "nexaFavoritos",
        JSON.stringify(favoritos)
    );

}


function configurarFavoritos() {

    document.querySelectorAll(".music-card").forEach(tarjeta => {

        const boton =
            tarjeta.querySelector(".favorite-btn");

        if (!boton) return;

        const titulo =
            tarjeta.dataset.song ||
            tarjeta.querySelector("h3").textContent;

        const indice =
            canciones.findIndex(
                cancion => cancion.titulo === titulo
            );

        if (indice === -1) return;

        boton.textContent =
            favoritos.includes(indice) ? "♥" : "♡";

        boton.onclick = event => {

            event.stopPropagation();

            if (favoritos.includes(indice)) {

                favoritos =
                    favoritos.filter(
                        item => item !== indice
                    );

            } else {

                favoritos.push(indice);

            }

            guardarFavoritos();

            configurarFavoritos();

            mostrarFavoritos();

        };

    });

}


// ===============================
// FAVORITOS
// ===============================

function mostrarFavoritos() {

    const grid =
        document.querySelector("#favoritesGrid");

    const mensaje =
        document.querySelector("#noFavorites");

    if (!grid) return;

    grid.innerHTML = "";

    if (favoritos.length === 0) {

        mensaje.style.display = "block";

        return;

    }

    mensaje.style.display = "none";

    favoritos.forEach(indice => {

        const cancion =
            canciones[indice];

        const tarjeta =
            document.createElement("article");

        tarjeta.className = "music-card";

        tarjeta.dataset.song =
            cancion.titulo;

        tarjeta.innerHTML = `
            <div class="cover cover-one">
                🎵
            </div>

            <h3>${cancion.titulo}</h3>

            <p>${cancion.artista}</p>

            <button class="play-btn">▶</button>

            <button class="favorite-btn">♥</button>
        `;

        grid.appendChild(tarjeta);

    });

    configurarBotonesMusica();
    configurarFavoritos();

}


// ===============================
// PLAYLISTS
// ===============================

let playlists =
    JSON.parse(
        localStorage.getItem("nexaPlaylists")
    ) || [
        {
            nombre: "Mis favoritas",
            canciones: []
        },
        {
            nombre: "Para entrenar",
            canciones: []
        },
        {
            nombre: "Noche tranquila",
            canciones: []
        }
    ];


function guardarPlaylists() {

    localStorage.setItem(
        "nexaPlaylists",
        JSON.stringify(playlists)
    );

}


// ===============================
// MOSTRAR PLAYLISTS
// ===============================

function mostrarPlaylists() {

    const grid =
        document.querySelector(".playlist-grid");

    if (!grid) return;

    grid.innerHTML = "";

    playlists.forEach((playlist, indice) => {

        const elemento =
            document.createElement("div");

        elemento.className = "playlist";

        elemento.innerHTML = `
            <div class="playlist-icon">
                🎵
            </div>

            <div class="playlist-info">
                <h3>${playlist.nombre}</h3>

                <p>
                    ${playlist.canciones.length}
                    ${
                        playlist.canciones.length === 1
                        ? "canción"
                        : "canciones"
                    }
                </p>
            </div>

            <button
                class="open-playlist"
                data-playlist="${indice}"
            >
                ▶
            </button>
        `;

        grid.appendChild(elemento);

    });

    document.querySelectorAll(".open-playlist")
        .forEach(boton => {

            boton.addEventListener("click", () => {

                abrirPlaylist(
                    Number(boton.dataset.playlist)
                );

            });

        });

}


// ===============================
// CREAR PLAYLIST
// ===============================

const crearPlaylist =
    document.querySelector(
        "#playlistsSection .section-title button"
    );

if (crearPlaylist) {

    crearPlaylist.addEventListener("click", () => {

        const nombre =
            prompt(
                "🎵 Escribe el nombre de tu playlist:"
            );

        if (!nombre || !nombre.trim()) return;

        playlists.push({
            nombre: nombre.trim(),
            canciones: []
        });

        guardarPlaylists();

        mostrarPlaylists();

        alert(
            `Playlist "${nombre}" creada correctamente.`
        );

    });

}


// ===============================
// BOTÓN AGREGAR A PLAYLIST
// ===============================

function configurarBotonesPlaylist() {

    document.querySelectorAll("#musicGrid .music-card")
        .forEach(tarjeta => {

            if (
                tarjeta.querySelector(".add-playlist-btn")
            ) {
                return;
            }

            const boton =
                document.createElement("button");

            boton.className =
                "add-playlist-btn";

            boton.textContent = "+";

            boton.title =
                "Agregar a playlist";

            tarjeta.appendChild(boton);

            boton.addEventListener("click", event => {

                event.stopPropagation();

                const titulo =
                    tarjeta.dataset.song ||
                    tarjeta.querySelector("h3").textContent;

                agregarCancionAPlaylist(titulo);

            });

        });

}


// ===============================
// AGREGAR CANCIÓN
// ===============================

function agregarCancionAPlaylist(titulo) {

    if (playlists.length === 0) {

        alert("Primero crea una playlist.");

        return;

    }

    let mensaje =
        "🎵 Selecciona una playlist:\n\n";

    playlists.forEach((playlist, indice) => {

        mensaje +=
            `${indice + 1}. ${playlist.nombre}\n`;

    });

    const respuesta =
        prompt(mensaje);

    if (respuesta === null) return;

    const numero =
        parseInt(respuesta);

    if (
        isNaN(numero) ||
        numero < 1 ||
        numero > playlists.length
    ) {

        alert("❌ Playlist inválida.");

        return;

    }

    const playlist =
        playlists[numero - 1];

    if (
        playlist.canciones.includes(titulo)
    ) {

        alert(
            `"${titulo}" ya está en "${playlist.nombre}".`
        );

        return;

    }

    playlist.canciones.push(titulo);

    guardarPlaylists();

    mostrarPlaylists();

    alert(
        `✅ "${titulo}" fue agregada a "${playlist.nombre}".`
    );

}


// ===============================
// ABRIR PLAYLIST
// ===============================

function abrirPlaylist(indice) {

    const playlist =
        playlists[indice];

    if (!playlist) return;

    if (playlist.canciones.length === 0) {

        alert(
            `"${playlist.nombre}" está vacía.`
        );

        return;

    }

    let mensaje =
        `🎵 ${playlist.nombre}\n\n`;

    playlist.canciones.forEach(
        (titulo, numero) => {

            mensaje +=
                `${numero + 1}. ${titulo}\n`;

        }
    );

    const respuesta =
        prompt(
            mensaje +
            "\nEscribe el número de la canción:"
        );

    if (respuesta === null) return;

    const numero =
        parseInt(respuesta);

    if (
        isNaN(numero) ||
        numero < 1 ||
        numero > playlist.canciones.length
    ) {

        alert("❌ Canción inválida.");

        return;

    }

    const titulo =
        playlist.canciones[numero - 1];

    const indiceCancion =
        canciones.findIndex(
            cancion =>
                cancion.titulo === titulo
        );

    if (indiceCancion === -1) {

        alert(
            "No se encontró la canción."
        );

        return;

    }

    posicion =
        indiceCancion;

    cargarCancion();

    reproducir();

}


// ===============================
// BUSCADOR
// ===============================

const searchInput =
    document.querySelector("#searchInput");

if (searchInput) {

    searchInput.addEventListener("input", () => {

        const texto =
            searchInput.value
            .toLowerCase()
            .trim();

        document.querySelectorAll(
            "#musicGrid .music-card"
        ).forEach(tarjeta => {

            const nombre =
                (
                    tarjeta.dataset.search ||
                    tarjeta.dataset.song ||
                    ""
                ).toLowerCase();

            tarjeta.style.display =
                nombre.includes(texto)
                ? ""
                : "none";

        });

    });

}


// ===============================
// SECCIONES
// ===============================

const inicioSection =
    document.querySelector("#inicioSection");

const favoritosSection =
    document.querySelector("#favoritosSection");

const playlistsSection =
    document.querySelector("#playlistsSection");

const iaSection =
    document.querySelector("#iaSection");


function ocultarSecciones() {

    inicioSection.style.display = "none";
    favoritosSection.style.display = "none";
    playlistsSection.style.display = "none";
    iaSection.style.display = "none";

}


function mostrarSeccion(nombre) {

    ocultarSecciones();

    if (nombre === "inicio") {

        inicioSection.style.display = "block";

    }

    if (nombre === "explorar") {

        inicioSection.style.display = "block";

        document.querySelector("#musicTitle").textContent =
            "Explorar música";

    }

    if (nombre === "musica") {

        inicioSection.style.display = "block";

        document.querySelector("#musicTitle").textContent =
            "Tu música";

    }

    if (nombre === "favoritos") {

        favoritosSection.style.display = "block";

        mostrarFavoritos();

    }

    if (nombre === "playlists") {

        playlistsSection.style.display = "block";

        mostrarPlaylists();

    }

    if (nombre === "ia") {

        iaSection.style.display = "block";

    }

}


// ===============================
// MENÚ
// ===============================

document.querySelectorAll(".menu-btn")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            document.querySelectorAll(".menu-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            boton.classList.add("active");

            mostrarSeccion(
                boton.dataset.section
            );

        });

    });


// ===============================
// VER TODO
// ===============================

const botonesTitulo =
    document.querySelectorAll(
        ".section-title button"
    );

if (botonesTitulo.length > 0) {

    botonesTitulo[0].addEventListener("click", () => {

        const explorar =
            document.querySelector(
                '[data-section="explorar"]'
            );

        document.querySelectorAll(".menu-btn")
            .forEach(btn =>
                btn.classList.remove("active")
            );

        explorar.classList.add("active");

        mostrarSeccion("explorar");

    });

}


// ===============================
// NEXA IA
// ===============================

const aiButton =
    document.querySelector(".ai-button");

if (aiButton) {

    aiButton.addEventListener("click", () => {

        const respuesta =
            prompt(
                "🤖 NEXA IA\n\n" +
                "¿Qué música quieres escuchar?"
            );

        if (!respuesta) return;

        const texto =
            respuesta.toLowerCase();

        let indice = 0;

        if (
            texto.includes("segunda") ||
            texto.includes("relajante")
        ) {
            indice = 1;
        }

        if (
            texto.includes("tercera") ||
            texto.includes("entrenar") ||
            texto.includes("energía")
        ) {
            indice = 2;
        }

        if (
            texto.includes("cuarta") ||
            texto.includes("amor")
        ) {
            indice = 3;
        }

        posicion = indice;

        cargarCancion();

        reproducir();

    });

}


// ===============================
// INICIAR
// ===============================

ocultarSecciones();

inicioSection.style.display = "block";

cargarCancion();

configurarBotonesMusica();

configurarFavoritos();

mostrarFavoritos();

mostrarPlaylists();

configurarBotonesPlaylist();