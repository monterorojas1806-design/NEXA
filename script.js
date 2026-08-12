"use strict";

/* =========================================================
   NEXA MUSIC
   REPRODUCTOR PRINCIPAL
========================================================= */

const canciones = [

    {
        id: 1,
        titulo: "Purple Haze",
        artista: "919. Mesh",
        genero: "Electrónica",
        archivo: "music/919._Mesh_-_Purple_Haze_Original_Mix_(mp3.pm).mp3",
        emoji: "💜",
        color: "purple"
    },

    {
        id: 2,
        titulo: "Electric Pulse",
        artista: "Amna & Robert Toma",
        genero: "Electrónica",
        archivo: "music/Amna_si_Robert_Toma_-_In_Oglinda_Marc_Rayen_Electric_Pulse_Remix_(mp3.pm).mp3",
        emoji: "⚡",
        color: "blue"
    },

    {
        id: 3,
        titulo: "Ocean Breeze",
        artista: "Anno Domini Nation",
        genero: "Chill",
        archivo: "music/Anno_Domini_Nation_-_Ocean_Breeze_by_Screwaholic_(mp3.pm).mp3",
        emoji: "🌊",
        color: "cyan"
    },

    {
        id: 4,
        titulo: "Midnight Dream",
        artista: "DJ Sammy",
        genero: "Dance",
        archivo: "music/DJ_Sammy_-_California_Dreaming_Midnight_Dream_Version_(mp3.pm).mp3",
        emoji: "🌙",
        color: "night"
    },

    {
        id: 5,
        titulo: "Hearts to Heart",
        artista: "Earth, Wind & Fire",
        genero: "Soul",
        archivo: "music/Earth_Wind_And_Fire_-_Hearts_to_heart_(mp3.pm).mp3",
        emoji: "❤️",
        color: "red"
    },

    {
        id: 6,
        titulo: "Starduster",
        artista: "Hatsune Miku",
        genero: "Pop",
        archivo: "music/Hatsune_Miku_-_Starduster_(mp3.pm).mp3",
        emoji: "✨",
        color: "pink"
    },

    {
        id: 7,
        titulo: "The Golden Hour",
        artista: "Jonathan Morali",
        genero: "Ambient",
        archivo: "music/Jonathan_Morali_-_The_Golden_Hour_(mp3.pm).mp3",
        emoji: "🌅",
        color: "gold"
    },

    {
        id: 8,
        titulo: "Urban Jungle",
        artista: "Spirits From An Urban Jungle",
        genero: "Electronic",
        archivo: "music/Spirits_From_An_Urban_Jungle_-_Inhabitants_Of_Pandemonium_(mp3.pm).mp3",
        emoji: "🏙️",
        color: "green"
    }

];


/* =========================================================
   ESTADO
========================================================= */

let actual = 0;
let reproduciendo = false;
let aleatorio = false;
let repetir = false;

let favoritos = JSON.parse(
    localStorage.getItem("nexaFavoritos") || "[]"
);

let recientes = JSON.parse(
    localStorage.getItem("nexaRecientes") || "[]"
);

let playlists = JSON.parse(
    localStorage.getItem("nexaPlaylists") || "[]"
);

let cola = [];


/* =========================================================
   AUDIO
========================================================= */

const audio = document.getElementById("audioPlayer");

audio.volume = 0.7;


/* =========================================================
   ELEMENTOS
========================================================= */

const playButton = document.getElementById("playButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");

const shuffleButton = document.getElementById("shuffleButton");
const repeatButton = document.getElementById("repeatButton");

const progressBar = document.getElementById("progressBar");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volumeSlider = document.getElementById("volumeSlider");
const volumeButton = document.getElementById("volumeButton");

const playerTitle = document.getElementById("playerTitle");
const playerArtist = document.getElementById("playerArtist");
const playerCover = document.getElementById("playerCover");
const playerLike = document.getElementById("playerLike");

const notification = document.getElementById("notification");
const notificationText = document.getElementById("notificationText");

const queuePanel = document.getElementById("queuePanel");
const queueList = document.getElementById("queueList");

const overlay = document.getElementById("overlay");

const expandedPlayer = document.getElementById("expandedPlayer");


/* =========================================================
   UTILIDADES
========================================================= */

function tiempo(segundos) {

    if (!Number.isFinite(segundos)) {
        return "0:00";
    }

    segundos = Math.floor(segundos);

    const minutos = Math.floor(segundos / 60);

    const segundosRestantes = segundos % 60;

    return minutos + ":" +
        String(segundosRestantes).padStart(2, "0");
}


function guardarDatos() {

    localStorage.setItem(
        "nexaFavoritos",
        JSON.stringify(favoritos)
    );

    localStorage.setItem(
        "nexaRecientes",
        JSON.stringify(recientes)
    );

    localStorage.setItem(
        "nexaPlaylists",
        JSON.stringify(playlists)
    );
}


function mostrarNotificacion(texto) {

    notificationText.textContent = texto;

    notification.classList.add("show");

    clearTimeout(mostrarNotificacion.timer);

    mostrarNotificacion.timer = setTimeout(() => {

        notification.classList.remove("show");

    }, 2200);
}


/* =========================================================
   FAVORITOS
========================================================= */

function esFavorita(id) {

    return favoritos.includes(id);
}


function actualizarFavoritos() {

    const count = document.getElementById("favoriteCount");

    if (count) {
        count.textContent = favoritos.length;
    }

    playerLike.classList.toggle(
        "liked",
        esFavorita(canciones[actual].id)
    );

    playerLike.textContent =
        esFavorita(canciones[actual].id)
            ? "♥"
            : "♡";
}


function alternarFavorito(id) {

    const posicion = favoritos.indexOf(id);

    if (posicion === -1) {

        favoritos.push(id);

        mostrarNotificacion("❤️ Agregado a favoritos");

    } else {

        favoritos.splice(posicion, 1);

        mostrarNotificacion("💔 Eliminado de favoritos");
    }

    guardarDatos();

    actualizarTodo();
}


/* =========================================================
   REPRODUCTOR
========================================================= */

function cargarCancion(indice, reproducir = false) {

    if (!canciones[indice]) {
        return;
    }

    actual = indice;

    const cancion = canciones[actual];

    audio.src = cancion.archivo;

    audio.load();

    playerTitle.textContent = cancion.titulo;
    playerArtist.textContent = cancion.artista;
    playerCover.textContent = cancion.emoji;

    progressBar.value = 0;

    currentTime.textContent = "0:00";
    duration.textContent = "0:00";

    actualizarFavoritos();
    actualizarTarjetas();
    actualizarExpandido();

    agregarReciente(cancion.id);

    if (reproducir) {

        audio.play().catch(() => {

            mostrarNotificacion(
                "⚠️ No se pudo reproducir este archivo"
            );

        });

    }
}


function reproducir() {

    audio.play().catch(() => {

        mostrarNotificacion(
            "⚠️ Revisa que el MP3 esté dentro de /music"
        );

    });
}


function pausar() {

    audio.pause();
}


function alternarPlay() {

    if (!audio.src) {

        cargarCancion(0, true);

        return;
    }

    if (audio.paused) {

        reproducir();

    } else {

        pausar();
    }
}


function siguiente() {

    let siguienteIndice;

    if (aleatorio) {

        siguienteIndice = Math.floor(
            Math.random() * canciones.length
        );

    } else {

        siguienteIndice =
            (actual + 1) % canciones.length;
    }

    cargarCancion(siguienteIndice, true);
}


function anterior() {

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;
    }

    let anteriorIndice;

    if (aleatorio) {

        anteriorIndice = Math.floor(
            Math.random() * canciones.length
        );

    } else {

        anteriorIndice =
            (actual - 1 + canciones.length) %
            canciones.length;
    }

    cargarCancion(anteriorIndice, true);
}


/* =========================================================
   EVENTOS DEL AUDIO
========================================================= */

audio.addEventListener("play", () => {

    reproduciendo = true;

    playButton.textContent = "⏸";

    document.body.classList.add("playing");

});


audio.addEventListener("pause", () => {

    reproduciendo = false;

    playButton.textContent = "▶";

    document.body.classList.remove("playing");

});


audio.addEventListener("timeupdate", () => {

    if (!audio.duration) {
        return;
    }

    progressBar.max = audio.duration;

    progressBar.value = audio.currentTime;

    currentTime.textContent =
        tiempo(audio.currentTime);

});


audio.addEventListener("loadedmetadata", () => {

    if (!audio.duration) {
        return;
    }

    progressBar.max = audio.duration;

    duration.textContent =
        tiempo(audio.duration);

});


audio.addEventListener("ended", () => {

    if (repetir) {

        audio.currentTime = 0;

        reproducir();

    } else {

        siguiente();

    }

});


audio.addEventListener("error", () => {

    mostrarNotificacion(
        "❌ No se encontró el MP3"
    );

});


/* =========================================================
   CONTROLES
========================================================= */

playButton.addEventListener(
    "click",
    alternarPlay
);


nextButton.addEventListener(
    "click",
    siguiente
);


previousButton.addEventListener(
    "click",
    anterior
);


shuffleButton.addEventListener(
    "click",
    () => {

        aleatorio = !aleatorio;

        shuffleButton.classList.toggle(
            "active",
            aleatorio
        );

        mostrarNotificacion(
            aleatorio
                ? "🔀 Aleatorio activado"
                : "🔀 Aleatorio desactivado"
        );

    }
);


repeatButton.addEventListener(
    "click",
    () => {

        repetir = !repetir;

        repeatButton.classList.toggle(
            "active",
            repetir
        );

        mostrarNotificacion(
            repetir
                ? "🔁 Repetición activada"
                : "🔁 Repetición desactivada"
        );

    }
);


/* =========================================================
   VOLUMEN
========================================================= */

volumeSlider.addEventListener(
    "input",
    () => {

        audio.volume =
            Number(volumeSlider.value) / 100;

        if (audio.volume === 0) {

            volumeButton.textContent = "🔇";

        } else {

            volumeButton.textContent = "🔊";
        }

    }
);


volumeButton.addEventListener(
    "click",
    () => {

        if (audio.volume > 0) {

            audio.dataset.previousVolume =
                audio.volume;

            audio.volume = 0;

            volumeSlider.value = 0;

            volumeButton.textContent = "🔇";

        } else {

            const volumen =
                Number(audio.dataset.previousVolume || .7);

            audio.volume = volumen;

            volumeSlider.value =
                volumen * 100;

            volumeButton.textContent = "🔊";
        }

    }
);


/* =========================================================
   PROGRESO
========================================================= */

progressBar.addEventListener(
    "input",
    () => {

        if (audio.duration) {

            audio.currentTime =
                Number(progressBar.value);

        }

    }
);


/* =========================================================
   FAVORITO ACTUAL
========================================================= */

playerLike.addEventListener(
    "click",
    () => {

        alternarFavorito(
            canciones[actual].id
        );

    }
);


/* =========================================================
   RECIENTES
========================================================= */

function agregarReciente(id) {

    recientes =
        recientes.filter(item => item !== id);

    recientes.unshift(id);

    recientes =
        recientes.slice(0, 8);

    guardarDatos();
}


/* =========================================================
   TARJETAS
========================================================= */

function crearTarjeta(cancion) {

    const favorita =
        esFavorita(cancion.id);

    const tarjeta =
        document.createElement("article");

    tarjeta.className = "music-card";

    tarjeta.dataset.id = cancion.id;

    if (cancion.id === canciones[actual].id) {

        tarjeta.classList.add("playing");
    }

    tarjeta.innerHTML = `

        <div class="card-cover card-${cancion.color}">
            ${cancion.emoji}
        </div>

        <div class="card-info">

            <h3>${cancion.titulo}</h3>

            <p>${cancion.artista}</p>

            <span class="card-genre">
                ${cancion.genero}
            </span>

        </div>

        <div class="card-actions">

            <button
                class="favorite-card ${favorita ? "liked" : ""}"
                title="Favorito"
            >
                ${favorita ? "♥" : "♡"}
            </button>

            <button
                class="play-card"
                title="Reproducir"
            >
                ▶
            </button>

        </div>
    `;


    tarjeta.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(".card-actions")
            ) {
                return;
            }

            reproducirCancionPorId(
                cancion.id
            );

        }
    );


    tarjeta
        .querySelector(".play-card")
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                reproducirCancionPorId(
                    cancion.id
                );

            }
        );


    tarjeta
        .querySelector(".favorite-card")
        .addEventListener(
            "click",
            event => {

                event.stopPropagation();

                alternarFavorito(
                    cancion.id
                );

            }
        );


    return tarjeta;
}


function reproducirCancionPorId(id) {

    const indice =
        canciones.findIndex(
            cancion => cancion.id === id
        );

    if (indice === -1) {
        return;
    }

    cargarCancion(indice, true);
}


/* =========================================================
   RENDER
========================================================= */

function llenarContenedor(id, lista) {

    const contenedor =
        document.getElementById(id);

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    lista.forEach(cancion => {

        contenedor.appendChild(
            crearTarjeta(cancion)
        );

    });
}


function actualizarTarjetas() {

    llenarContenedor(
        "recommendedGrid",
        canciones
    );

    llenarContenedor(
        "exploreGrid",
        canciones
    );

    llenarContenedor(
        "libraryGrid",
        canciones
    );

    const favoritas =
        canciones.filter(
            cancion =>
                favoritos.includes(cancion.id)
        );

    llenarContenedor(
        "favoritesGrid",
        favoritas
    );

    llenarContenedor(
        "homeFavoritesGrid",
        favoritas
    );

    const recientesCanciones =
        recientes
            .map(
                id =>
                    canciones.find(
                        cancion =>
                            cancion.id === id
                    )
            )
            .filter(Boolean);

    llenarContenedor(
        "recentGrid",
        recientesCanciones
    );

    llenarContenedor(
        "libraryRecentGrid",
        recientesCanciones
    );

    const empty =
        document.getElementById(
            "favoritesEmpty"
        );

    if (empty) {

        empty.hidden =
            favoritas.length !== 0;
    }

    const homeEmpty =
        document.getElementById(
            "homeFavoritesEmpty"
        );

    if (homeEmpty) {

        homeEmpty.style.display =
            favoritas.length
                ? "none"
                : "block";
    }

    const description =
        document.getElementById(
            "favoritesDescription"
        );

    if (description) {

        description.textContent =
            `${favoritas.length} ${
                favoritas.length === 1
                    ? "canción"
                    : "canciones"
            } guardadas`;
    }

    actualizarFavoritos();
}


/* =========================================================
   GÉNEROS
========================================================= */

function crearFiltros() {

    const contenedor =
        document.getElementById(
            "genreFilters"
        );

    if (!contenedor) {
        return;
    }

    const generos = [
        ...new Set(
            canciones.map(
                cancion => cancion.genero
            )
        )
    ];

    contenedor.innerHTML = "";

    generos.forEach(genero => {

        const boton =
            document.createElement("button");

        boton.className =
            "genre-button";

        boton.textContent =
            genero;

        boton.dataset.filter =
            genero;

        boton.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-button, .genre-button"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                boton.classList.add("active");

                filtrarMusica(
                    genero
                );

            }
        );

        contenedor.appendChild(
            boton
        );

    });
}


function filtrarMusica(genero) {

    const texto =
        document
            .getElementById("exploreSearch")
            ?.value
            .toLowerCase()
            .trim() || "";

    const resultado =
        canciones.filter(cancion => {

            const coincideGenero =
                genero === "all" ||
                cancion.genero === genero;

            const datos =
                (
                    cancion.titulo +
                    " " +
                    cancion.artista +
                    " " +
                    cancion.genero
                ).toLowerCase();

            return (
                coincideGenero &&
                datos.includes(texto)
            );

        });

    llenarContenedor(
        "exploreGrid",
        resultado
    );

    const noResults =
        document.getElementById(
            "noResults"
        );

    if (noResults) {

        noResults.hidden =
            resultado.length !== 0;
    }

    const title =
        document.getElementById(
            "resultsTitle"
        );

    if (title) {

        title.textContent =
            `${resultado.length} ${
                resultado.length === 1
                    ? "canción"
                    : "canciones"
            }`;
    }
}


/* =========================================================
   BÚSQUEDA
========================================================= */

function buscar(texto) {

    texto =
        texto.toLowerCase().trim();

    const resultado =
        canciones.filter(cancion => {

            const datos =
                (
                    cancion.titulo +
                    " " +
                    cancion.artista +
                    " " +
                    cancion.genero
                ).toLowerCase();

            return datos.includes(texto);

        });

    llenarContenedor(
        "exploreGrid",
        resultado
    );

    const noResults =
        document.getElementById(
            "noResults"
        );

    if (noResults) {

        noResults.hidden =
            resultado.length !== 0;
    }
}


/* =========================================================
   ORDENAR
========================================================= */

document
    .getElementById("sortSelect")
    ?.addEventListener(
        "change",
        event => {

            const valor =
                event.target.value;

            const lista =
                [...canciones];

            if (valor === "title") {

                lista.sort(
                    (a,b) =>
                        a.titulo.localeCompare(
                            b.titulo
                        )
                );

            } else if (valor === "artist") {

                lista.sort(
                    (a,b) =>
                        a.artista.localeCompare(
                            b.artista
                        )
                );

            } else if (valor === "genre") {

                lista.sort(
                    (a,b) =>
                        a.genero.localeCompare(
                            b.genero
                        )
                );
            }

            llenarContenedor(
                "exploreGrid",
                lista
            );

        }
    );


/* =========================================================
   NAVEGACIÓN
========================================================= */

function cambiarSeccion(seccion) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const objetivo =
        document.getElementById(
            seccion + "Section"
        );

    if (objetivo) {

        objetivo.classList.add(
            "active"
        );
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === seccion
            );

        });


    const titulos = {

        home: "Descubre tu música",
        explore: "Explorar música",
        library: "Tu biblioteca",
        favorites: "Tus favoritos",
        ai: "NEXA IA"

    };

    const title =
        document.getElementById(
            "pageTitle"
        );

    if (title) {

        title.textContent =
            titulos[seccion] ||
            "NEXA Music";
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   BOTONES DE NAVEGACIÓN
========================================================= */

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                cambiarSeccion(
                    button.dataset.section
                );

                document
                    .getElementById("sidebar")
                    ?.classList.remove(
                        "open"
                    );

            }
        );

    });


document
    .querySelectorAll(
        "[data-section-target]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                cambiarSeccion(
                    button.dataset.sectionTarget
                );

            }
        );

    });


/* =========================================================
   BÚSQUEDA
========================================================= */

document
    .getElementById("globalSearch")
    ?.addEventListener(
        "input",
        event => {

            const texto =
                event.target.value;

            if (texto.trim()) {

                cambiarSeccion(
                    "explore"
                );

                const explore =
                    document.getElementById(
                        "exploreSearch"
                    );

                if (explore) {

                    explore.value =
                        texto;
                }

            }

            buscar(texto);

        }
    );


document
    .getElementById("exploreSearch")
    ?.addEventListener(
        "input",
        event => {

            buscar(
                event.target.value
            );

        }
    );


/* =========================================================
   CTRL + K
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            const search =
                document.getElementById(
                    "globalSearch"
                );

            if (search) {

                search.focus();
            }

        }

        if (
            event.code === "Space" &&
            event.target.tagName !== "INPUT" &&
            event.target.tagName !== "TEXTAREA"
        ) {

            event.preventDefault();

            alternarPlay();

        }

        if (event.key === "ArrowRight") {

            siguiente();

        }

        if (event.key === "ArrowLeft") {

            anterior();

        }

    }
);


/* =========================================================
   HERO
========================================================= */

document
    .getElementById("heroPlayButton")
    ?.addEventListener(
        "click",
        () => {

            cargarCancion(
                actual,
                true
            );

        }
    );


document
    .getElementById("heroExploreButton")
    ?.addEventListener(
        "click",
        () => {

            cambiarSeccion(
                "explore"
            );

        }
    );


/* =========================================================
   TABS BIBLIOTECA
========================================================= */

document
    .querySelectorAll(
        ".library-tab"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".library-tab"
                    )
                    .forEach(
                        b =>
                            b.classList.remove(
                                "active"
                            )
                    );

                button.classList.add(
                    "active"
                );


                document
                    .querySelectorAll(
                        ".library-content"
                    )
                    .forEach(
                        content =>
                            content.classList.remove(
                                "active"
                            )
                    );


                const tipo =
                    button.dataset.libraryTab;

                const contenido =
                    document.getElementById(
                        "library" +
                        tipo.charAt(0).toUpperCase() +
                        tipo.slice(1)
                    );

                if (contenido) {

                    contenido.classList.add(
                        "active"
                    );
                }

            }
        );

    });


/* =========================================================
   FILTRO TODO
========================================================= */

document
    .querySelector(
        '.filter-button[data-filter="all"]'
    )
    ?.addEventListener(
        "click",
        () => {

            document
                .querySelectorAll(
                    ".filter-button, .genre-button"
                )
                .forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );

            document
                .querySelector(
                    '.filter-button[data-filter="all"]'
                )
                ?.classList.add(
                    "active"
                );

            buscar(
                document.getElementById(
                    "exploreSearch"
                )?.value || ""
            );

        }
    );


/* =========================================================
   COLA
========================================================= */

function renderizarCola() {

    queueList.innerHTML = "";

    if (cola.length === 0) {

        queueList.innerHTML = `
            <div class="empty-small">
                🎵 La cola está vacía.
            </div>
        `;

        return;
    }


    cola.forEach(
        (id, indice) => {

            const cancion =
                canciones.find(
                    c => c.id === id
                );

            if (!cancion) {
                return;
            }

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "queue-item";

            item.innerHTML = `

                <span class="queue-number">
                    ${indice + 1}
                </span>

                <div class="queue-info">

                    <strong>
                        ${cancion.titulo}
                    </strong>

                    <span>
                        ${cancion.artista}
                    </span>

                </div>

            `;

            item.addEventListener(
                "click",
                () => {

                    reproducirCancionPorId(
                        cancion.id
                    );

                }
            );

            queueList.appendChild(
                item
            );

        }
    );

}


document
    .getElementById("queueButton")
    ?.addEventListener(
        "click",
        () => {

            queuePanel.classList.add(
                "open"
            );

            overlay.classList.add(
                "active"
            );

            renderizarCola();

        }
    );


document
    .getElementById("closeQueue")
    ?.addEventListener(
        "click",
        cerrarCola
    );


overlay.addEventListener(
    "click",
    cerrarCola
);


function cerrarCola() {

    queuePanel.classList.remove(
        "open"
    );

    overlay.classList.remove(
        "active"
    );

}


document
    .getElementById("clearQueue")
    ?.addEventListener(
        "click",
        () => {

            cola = [];

            renderizarCola();

            mostrarNotificacion(
                "🗑️ Cola vaciada"
            );

        }
    );


/* =========================================================
   PLAYLISTS
========================================================= */

const playlistModal =
    document.getElementById(
        "playlistModal"
    );


document
    .getElementById("addPlaylistButton")
    ?.addEventListener(
        "click",
        () => {

            playlistModal.hidden = false;

            document
                .getElementById(
                    "playlistName"
                )
                ?.focus();

        }
    );


document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const modal =
                    document.getElementById(
                        button.dataset.closeModal
                    );

                if (modal) {

                    modal.hidden = true;

                }

            }
        );

    });


document
    .getElementById("createPlaylistButton")
    ?.addEventListener(
        "click",
        () => {

            const input =
                document.getElementById(
                    "playlistName"
                );

            const nombre =
                input.value.trim();

            if (!nombre) {

                mostrarNotificacion(
                    "Escribe un nombre"
                );

                return;
            }


            playlists.push({

                id: Date.now(),

                nombre: nombre,

                canciones: []

            });


            guardarDatos();

            input.value = "";

            playlistModal.hidden = true;

            renderizarPlaylists();

            mostrarNotificacion(
                "📁 Playlist creada"
            );

        }
    );


function renderizarPlaylists() {

    const nav =
        document.getElementById(
            "playlistNav"
        );

    const grid =
        document.getElementById(
            "playlistGrid"
        );


    if (nav) {

        nav.innerHTML = "";

        playlists.forEach(
            playlist => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.className =
                    "playlist-nav-item";

                button.innerHTML =
                    `♫ ${playlist.nombre}`;

                nav.appendChild(
                    button
                );

            }
        );

    }


    if (grid) {

        grid.innerHTML = "";

        playlists.forEach(
            playlist => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "playlist-card";

                card.innerHTML = `

                    <div class="playlist-cover">
                        ♫
                    </div>

                    <h3>
                        ${playlist.nombre}
                    </h3>

                    <p>
                        ${playlist.canciones.length}
                        canciones
                    </p>

                `;

                grid.appendChild(
                    card
                );

            }
        );

    }

}


/* =========================================================
   IA
========================================================= */

const aiForm =
    document.getElementById(
        "aiForm"
    );

const aiInput =
    document.getElementById(
        "aiInput"
    );

const aiMessages =
    document.getElementById(
        "aiMessages"
    );


function agregarMensajeIA(
    texto,
    usuario = false
) {

    const mensaje =
        document.createElement(
            "div"
        );

    mensaje.className =
        usuario
            ? "ai-message ai-message-user"
            : "ai-message ai-message-bot";

    mensaje.innerHTML = `

        ${
            usuario
                ? ""
                : `
                    <div class="ai-message-icon">
                        ✦
                    </div>
                `
        }

        <div class="ai-message-content">

            <strong>
                ${usuario ? "TÚ" : "NEXA IA"}
            </strong>

            <p>
                ${texto}
            </p>

        </div>
    `;

    aiMessages.appendChild(
        mensaje
    );

    aiMessages.scrollTop =
        aiMessages.scrollHeight;
}


function responderIA(texto) {

    const mensaje =
        texto.toLowerCase();

    let lista =
        canciones;


    if (
        mensaje.includes("tranquil") ||
        mensaje.includes("chill") ||
        mensaje.includes("relaj")
    ) {

        lista =
            canciones.filter(
                c =>
                    c.genero === "Chill" ||
                    c.genero === "Ambient"
            );

    } else if (
        mensaje.includes("energ") ||
        mensaje.includes("fiesta") ||
        mensaje.includes("bail")
    ) {

        lista =
            canciones.filter(
                c =>
                    c.genero === "Dance" ||
                    c.genero === "Electrónica" ||
                    c.genero === "Electronic"
            );

    } else if (
        mensaje.includes("noche") ||
        mensaje.includes("noche")
    ) {

        lista =
            canciones.filter(
                c =>
                    c.titulo
                        .toLowerCase()
                        .includes("midnight") ||
                    c.titulo
                        .toLowerCase()
                        .includes("purple")
            );

    }


    if (lista.length === 0) {

        lista = canciones;

    }


    const recomendada =
        lista[
            Math.floor(
                Math.random() * lista.length
            )
        ];


    return `
        Te recomiendo
        <strong>${recomendada.titulo}</strong>
        de ${recomendada.artista}. 🎵
    `;
}


aiForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const texto =
            aiInput.value.trim();

        if (!texto) {
            return;
        }

        agregarMensajeIA(
            texto,
            true
        );

        aiInput.value = "";

        setTimeout(
            () => {

                agregarMensajeIA(
                    responderIA(texto)
                );

            },
            400
        );

    }
);


document
    .querySelectorAll(
        "[data-ai-prompt]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const texto =
                    button.dataset.aiPrompt;

                aiInput.value =
                    texto;

                aiForm.requestSubmit();

            }
        );

    });


/* =========================================================
   REPRODUCTOR EXPANDIDO
========================================================= */

function actualizarExpandido() {

    const title =
        document.getElementById(
            "expandedTitle"
        );

    const artist =
        document.getElementById(
            "expandedArtist"
        );

    const cover =
        document.getElementById(
            "expandedCover"
        );

    const current =
        document.getElementById(
            "expandedCurrent"
        );

    const total =
        document.getElementById(
            "expandedDuration"
        );

    if (title) {
        title.textContent =
            canciones[actual].titulo;
    }

    if (artist) {
        artist.textContent =
            canciones[actual].artista;
    }

    if (cover) {
        cover.textContent =
            canciones[actual].emoji;
    }

    if (current) {
        current.textContent =
            tiempo(audio.currentTime);
    }

    if (total) {
        total.textContent =
            tiempo(audio.duration);
    }

}


document
    .getElementById("expandPlayer")
    ?.addEventListener(
        "click",
        () => {

            expandedPlayer.classList.add(
                "open"
            );

            actualizarExpandido();

        }
    );


document
    .getElementById("closeExpandedPlayer")
    ?.addEventListener(
        "click",
        () => {

            expandedPlayer.classList.remove(
                "open"
            );

        }
    );


document
    .getElementById("expandedPlay")
    ?.addEventListener(
        "click",
        alternarPlay
    );


document
    .getElementById("expandedNext")
    ?.addEventListener(
        "click",
        siguiente
    );


document
    .getElementById("expandedPrevious")
    ?.addEventListener(
        "click",
        anterior
    );


document
    .getElementById("expandedShuffle")
    ?.addEventListener(
        "click",
        () => {

            shuffleButton.click();

        }
    );


document
    .getElementById("expandedRepeat")
    ?.addEventListener(
        "click",
        () => {

            repeatButton.click();

        }
    );


const expandedProgress =
    document.getElementById(
        "expandedProgress"
    );


expandedProgress?.addEventListener(
    "input",
    () => {

        if (audio.duration) {

            audio.currentTime =
                Number(
                    expandedProgress.value
                );

        }

    }
);


audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) {
            return;
        }

        if (expandedProgress) {

            expandedProgress.max =
                audio.duration;

            expandedProgress.value =
                audio.currentTime;

        }

        actualizarExpandido();

    }
);


/* =========================================================
   MENÚ MÓVIL
========================================================= */

document
    .getElementById("mobileMenuButton")
    ?.addEventListener(
        "click",
        () => {

            document
                .getElementById("sidebar")
                ?.classList.toggle(
                    "open"
                );

        }
    );


document
    .getElementById("mobileSearchButton")
    ?.addEventListener(
        "click",
        () => {

            const search =
                document.getElementById(
                    "globalSearch"
                );

            if (search) {

                search.focus();

            }

        }
    );


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const settingsModal =
    document.getElementById(
        "settingsModal"
    );


document
    .getElementById("settingsButton")
    ?.addEventListener(
        "click",
        () => {

            settingsModal.hidden = false;

        }
    );


document
    .getElementById("animationsToggle")
    ?.addEventListener(
        "change",
        event => {

            document.body.classList.toggle(
                "no-animations",
                !event.target.checked
            );

        }
    );


document
    .getElementById("notificationsToggle")
    ?.addEventListener(
        "change",
        event => {

            document.body.classList.toggle(
                "no-notifications",
                !event.target.checked
            );

        }
    );


document
    .getElementById("resetDataButton")
    ?.addEventListener(
        "click",
        () => {

            const confirmar =
                confirm(
                    "¿Quieres borrar favoritos, recientes y playlists?"
                );

            if (!confirmar) {
                return;
            }

            favoritos = [];
            recientes = [];
            playlists = [];

            guardarDatos();

            actualizarTodo();

            renderizarPlaylists();

            mostrarNotificacion(
                "🗑️ Datos restablecidos"
            );

        }
    );


/* =========================================================
   NOTIFICACIONES
========================================================= */

document
    .getElementById("notificationsButton")
    ?.addEventListener(
        "click",
        () => {

            mostrarNotificacion(
                "🔔 No tienes nuevas notificaciones"
            );

        }
    );


/* =========================================================
   ACTUALIZAR TODO
========================================================= */

function actualizarTodo() {

    actualizarTarjetas();

    renderizarPlaylists();

    crearFiltros();

}


/* =========================================================
   SALUDO
========================================================= */

function actualizarSaludo() {

    const hora =
        new Date().getHours();

    let saludo;

    if (hora < 12) {

        saludo = "Buenos días ☀️";

    } else if (hora < 18) {

        saludo = "Buenas tardes 🌤️";

    } else {

        saludo = "Buenas noches 🌙";

    }

    const elemento =
        document.getElementById(
            "greetingText"
        );

    if (elemento) {

        elemento.textContent =
            saludo;
    }

}


/* =========================================================
   INICIO
========================================================= */

actualizarSaludo();

actualizarTodo();

renderizarCola();

cargarCancion(
    0,
    false
);

console.log(
    "NEXA iniciado correctamente."
);

console.log(
    "Canciones:",
    canciones.length
);
