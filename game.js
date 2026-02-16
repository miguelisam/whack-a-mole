/**
 * @fileoverview Whack-a-Mole - Juego arcade con dificultad progresiva y sistema de bombas.
 * @author miguelisam
 * @version 1.0.0
 * @module game
 */

/* ==========================================================================
   FUNCIONES UTILITARIAS PURAS (TESTEABLES)
   Estas funciones no dependen del DOM ni del estado global.
   ========================================================================== */

/**
 * Formatea segundos a formato MM:SS.
 * 
 * @param {number} seconds - Segundos a formatear
 * @returns {string} Tiempo formateado como "M:SS"
 * @example
 * formatTime(125) // "2:05"
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calcula la dificultad según el progreso del juego.
 * 
 * @param {number} progressRatio - Ratio de progreso (0 a 1)
 * @returns {'easy'|'medium'|'hard'|'insane'} Nivel de dificultad
 */
function getDifficulty(progressRatio) {
    if (progressRatio < 0.25) return 'easy';
    if (progressRatio < 0.5) return 'medium';
    if (progressRatio < 0.75) return 'hard';
    return 'insane';
}

/**
 * Obtiene la probabilidad de bomba según dificultad.
 * 
 * @param {'easy'|'medium'|'hard'|'insane'} difficulty - Nivel de dificultad
 * @returns {number} Probabilidad (0.10 a 0.25)
 */
function getBombChance(difficulty) {
    const chances = {
        easy: 0.10,
        medium: 0.15,
        hard: 0.20,
        insane: 0.25
    };
    return chances[difficulty] || 0.15;
}

/**
 * Obtiene el máximo de topos simultáneos según dificultad.
 * 
 * @param {'easy'|'medium'|'hard'|'insane'} difficulty - Nivel de dificultad
 * @returns {number} Cantidad máxima (1 a 4)
 */
function getMaxMoles(difficulty) {
    const maxMoles = {
        easy: 1,
        medium: 2,
        hard: 3,
        insane: 4
    };
    return maxMoles[difficulty] || 1;
}

/**
 * Valida que el nombre del jugador no esté vacío.
 * 
 * @param {string} name - Nombre a validar
 * @returns {boolean} true si es válido
 */
function validatePlayerName(name) {
    return !!(name && name.trim().length > 0);
}

/**
 * Valida que la duración esté en el rango permitido.
 * 
 * @param {number} seconds - Duración en segundos
 * @returns {boolean} true si es válida (60-300 segundos)
 */
function validateDuration(seconds) {
    const validDurations = [60, 120, 180, 240, 300];
    return validDurations.includes(seconds);
}

/**
 * Calcula puntos por golpe según dificultad.
 * 
 * @param {'easy'|'medium'|'hard'|'insane'} difficulty - Nivel de dificultad
 * @returns {number} Puntos por golpe
 */
function getPointsPerHit(difficulty) {
    const points = {
        easy: 10,
        medium: 15,
        hard: 20,
        insane: 30
    };
    return points[difficulty] || 10;
}

/**
 * Ordena scores de mayor a menor y limita a top 10.
 * 
 * @param {Array<{player: string, score: number}>} scores - Array de scores
 * @returns {Array<{player: string, score: number}>} Top 10 ordenado
 */
function sortAndLimitScores(scores) {
    return [...scores]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
}

/* ==========================================================================
   FIN FUNCIONES UTILITARIAS - INICIO CÓDIGO DEL JUEGO
   ========================================================================== */

/**
 * Estado global del juego.
 * Mantiene toda la información necesaria para el funcionamiento del juego.
 * 
 * @typedef {Object} GameConfig
 * @property {number} baseSpawnRate - Tiempo base entre apariciones de topos (ms)
 * @property {number} baseMoleTime - Tiempo base que el topo permanece visible (ms)
 * @property {number} minMoleTime - Tiempo mínimo de permanencia (ms)
 * @property {number} minSpawnRate - Spawn rate mínimo (ms)
 * @property {number} maxSimultaneousMoles - Cantidad máxima de topos simultáneos
 * @property {number} bombChance - Probabilidad de que aparezca una bomba (0-1)
 * 
 * @typedef {Object} GameState
 * @property {number} score - Puntaje actual del jugador
 * @property {number} timeLeft - Segundos restantes de juego
 * @property {boolean} isPlaying - Indica si hay un juego en curso
 * @property {Set<number>} activeMoles - Índices de los hoyos con topos activos
 * @property {Set<number>} activeBombs - Índices de los hoyos con bombas activas
 * @property {Map<number, number>} moleTimeouts - Timeouts de ocultación por hoyo
 * @property {number|null} gameInterval - ID del intervalo del temporizador
 * @property {number|null} spawnInterval - ID del timeout de spawn
 * @property {string} playerName - Nombre del jugador actual
 * @property {number} gameDuration - Duración total del juego en segundos
 * @property {'easy'|'medium'|'hard'|'insane'} difficulty - Nivel de dificultad actual
 * @property {boolean} bombsEnabled - Si las bombas están activadas
 * @property {'time'|'bomb'} gameOverReason - Razón del fin de partida
 * @property {GameConfig} config - Configuración dinámica de dificultad
 */

/** @type {GameState} */
const gameState = {
    score: 0,
    timeLeft: 0,
    isPlaying: false,
    activeMoles: new Set(),
    activeBombs: new Set(),
    moleTimeouts: new Map(),
    gameInterval: null,
    spawnInterval: null,
    playerName: '',
    gameDuration: 180,
    difficulty: 'easy',
    bombsEnabled: true,
    gameOverReason: 'time',
    config: {
        baseSpawnRate: 1200,
        baseMoleTime: 1800,
        minMoleTime: 400,
        minSpawnRate: 300,
        maxSimultaneousMoles: 1,
        bombChance: 0.15
    }
};

/**
 * Referencias a elementos del DOM.
 * Cacheadas al inicio para evitar búsquedas repetidas.
 * 
 * @typedef {Object} DOMElements
 * @property {HTMLElement} configPanel - Panel de configuración inicial
 * @property {HTMLElement} gamePanel - Panel principal del juego
 * @property {HTMLElement} gameOverPanel - Panel de fin de partida
 * @property {HTMLInputElement} playerNameInput - Input del nombre del jugador
 * @property {HTMLSelectElement} gameDurationSelect - Selector de duración
 * @property {HTMLInputElement} bombsCheckbox - Checkbox de bombas
 * @property {HTMLButtonElement} startBtn - Botón iniciar
 * @property {HTMLButtonElement} endBtn - Botón terminar
 * @property {HTMLButtonElement} playAgainBtn - Botón jugar de nuevo
 * @property {HTMLButtonElement} clearRankingBtn - Botón limpiar ranking
 * @property {HTMLElement} currentPlayer - Display nombre jugador
 * @property {HTMLElement} scoreDisplay - Display puntaje
 * @property {HTMLElement} timerDisplay - Display temporizador
 * @property {HTMLElement} finalPlayer - Nombre final
 * @property {HTMLElement} finalScore - Puntaje final
 * @property {HTMLElement} gameOverMessage - Mensaje de fin de juego
 * @property {HTMLElement} gameBoard - Tablero del juego
 * @property {HTMLElement} rankingBody - Cuerpo de la tabla de ranking
 */

/** @type {DOMElements} */
const elements = {
    configPanel: document.getElementById('config-panel'),
    gamePanel: document.getElementById('game-panel'),
    gameOverPanel: document.getElementById('game-over-panel'),
    playerNameInput: document.getElementById('player-name'),
    gameDurationSelect: document.getElementById('game-duration'),
    bombsCheckbox: document.getElementById('bombs-enabled'),
    startBtn: document.getElementById('start-btn'),
    endBtn: document.getElementById('end-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    clearRankingBtn: document.getElementById('clear-ranking-btn'),
    currentPlayer: document.getElementById('current-player'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalPlayer: document.getElementById('final-player'),
    finalScore: document.getElementById('final-score'),
    gameOverMessage: document.getElementById('game-over-message'),
    gameBoard: document.getElementById('game-board'),
    rankingBody: document.getElementById('ranking-body')
};

/**
 * Inicialización de la aplicación.
 * Se ejecuta cuando el DOM está completamente cargado.
 * Crea el tablero, carga el ranking y configura los eventos.
 */
document.addEventListener('DOMContentLoaded', () => {
    createHoles();
    loadRanking();
    setupEventListeners();
});

/**
 * Crea los 9 hoyos del tablero de juego.
 * Cada hoyo contiene un elemento mole que puede mostrar un topo o bomba.
 * Los hoyos se identifican por su índice (data-index).
 * 
 * @returns {void}
 */
function createHoles() {
    const numberOfHoles = 9;
    elements.gameBoard.innerHTML = '';
    
    for (let i = 0; i < numberOfHoles; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.dataset.index = i;
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.textContent = '🐹';
        
        hole.appendChild(mole);
        hole.addEventListener('click', handleWhack);
        elements.gameBoard.appendChild(hole);
    }
}

/**
 * Configura los event listeners de los botones de la interfaz.
 * 
 * @returns {void}
 */
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.endBtn.addEventListener('click', endGame);
    elements.playAgainBtn.addEventListener('click', showConfig);
    elements.clearRankingBtn.addEventListener('click', clearRanking);
}

/**
 * Inicia una nueva partida.
 * Valida el nombre del jugador, reinicia el estado del juego,
 * configura la dificultad inicial y comienza el temporizador.
 * 
 * @returns {void}
 */
function startGame() {
    const playerName = elements.playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Por favor, ingresa tu nombre para jugar.');
        elements.playerNameInput.focus();
        return;
    }
    
    // Configurar estado del juego
    gameState.playerName = playerName;
    gameState.gameDuration = parseInt(elements.gameDurationSelect.value);
    gameState.timeLeft = gameState.gameDuration;
    gameState.score = 0;
    gameState.isPlaying = true;
    gameState.activeMoles.clear();
    gameState.activeBombs.clear();
    gameState.moleTimeouts.clear();
    gameState.gameOverReason = 'time';
    gameState.bombsEnabled = elements.bombsCheckbox ? elements.bombsCheckbox.checked : true;
    
    // Resetear configuración de dificultad
    gameState.config = {
        baseSpawnRate: 1200,
        baseMoleTime: 1800,
        minMoleTime: 400,
        minSpawnRate: 300,
        maxSimultaneousMoles: 1,
        bombChance: 0.15
    };
    gameState.difficulty = 'easy';
    
    // Actualizar UI
    elements.currentPlayer.textContent = playerName;
    elements.scoreDisplay.textContent = '0';
    updateTimerDisplay();
    updateDifficultyIndicator();
    
    // Mostrar panel de juego
    elements.configPanel.classList.add('hidden');
    elements.gameOverPanel.classList.add('hidden');
    elements.gamePanel.classList.remove('hidden');
    
    // Iniciar temporizador
    gameState.gameInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();
        updateDifficulty();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Iniciar sistema de aparición de topos
    startMoleSpawning();
}

/**
 * Actualiza la dificultad del juego basándose en el tiempo transcurrido.
 * La dificultad aumenta progresivamente en 4 fases:
 * - Fácil (0-25%): 1 topo, 10% bombas
 * - Medio (25-50%): 2 topos, 15% bombas
 * - Difícil (50-75%): 3 topos, 20% bombas
 * - Insano (75-100%): 4 topos, 25% bombas
 * 
 * @returns {void}
 */
function updateDifficulty() {
    const elapsed = gameState.gameDuration - gameState.timeLeft;
    const totalTime = gameState.gameDuration;
    const progressRatio = elapsed / totalTime;
    
    // Configurar dificultad progresiva
    if (progressRatio < 0.25) {
        // Fácil (0-25%)
        gameState.difficulty = 'easy';
        gameState.config.maxSimultaneousMoles = 1;
        gameState.config.baseMoleTime = 1800;
        gameState.config.baseSpawnRate = 1200;
        gameState.config.bombChance = 0.10; // 10% de bombas
    } else if (progressRatio < 0.5) {
        // Medio (25-50%)
        gameState.difficulty = 'medium';
        gameState.config.maxSimultaneousMoles = 2;
        gameState.config.baseMoleTime = 1400;
        gameState.config.baseSpawnRate = 900;
        gameState.config.bombChance = 0.15; // 15% de bombas
    } else if (progressRatio < 0.75) {
        // Difícil (50-75%)
        gameState.difficulty = 'hard';
        gameState.config.maxSimultaneousMoles = 3;
        gameState.config.baseMoleTime = 1000;
        gameState.config.baseSpawnRate = 600;
        gameState.config.bombChance = 0.20; // 20% de bombas
    } else {
        // Insano (75-100%)
        gameState.difficulty = 'insane';
        gameState.config.maxSimultaneousMoles = 4;
        gameState.config.baseMoleTime = 700;
        gameState.config.baseSpawnRate = 400;
        gameState.config.bombChance = 0.25; // 25% de bombas
    }
    
    // Añadir variación adicional basada en progreso exacto
    const phaseProgress = (progressRatio % 0.25) / 0.25;
    gameState.config.baseMoleTime = Math.max(
        gameState.config.minMoleTime,
        gameState.config.baseMoleTime - (phaseProgress * 200)
    );
    
    updateDifficultyIndicator();
}

/**
 * Actualiza el indicador visual de dificultad en la interfaz.
 * Cambia el color y texto según el nivel actual.
 * 
 * @returns {void}
 */
function updateDifficultyIndicator() {
    const indicator = document.getElementById('difficulty-indicator');
    if (indicator) {
        indicator.className = `difficulty-indicator difficulty-${gameState.difficulty}`;
        const labels = {
            easy: '😊 Fácil',
            medium: '😐 Medio',
            hard: '😰 Difícil',
            insane: '🔥 ¡INSANO!'
        };
        indicator.textContent = labels[gameState.difficulty];
    }
}

/**
 * Inicia el sistema de aparición de topos.
 * Genera topos/bombas de forma recursiva según la configuración de dificultad.
 * El intervalo entre apariciones varía aleatoriamente para mayor dinamismo.
 * 
 * @returns {void}
 */
function startMoleSpawning() {
    const spawn = () => {
        if (!gameState.isPlaying) return;
        
        // Intentar mostrar topos hasta el máximo permitido
        const molesToSpawn = gameState.config.maxSimultaneousMoles - gameState.activeMoles.size;
        
        for (let i = 0; i < molesToSpawn; i++) {
            // Probabilidad de spawn adicional disminuye
            if (i > 0 && Math.random() > 0.6) continue;
            showRandomMole();
        }
        
        // Calcular próximo spawn con variación aleatoria
        const variation = (Math.random() - 0.5) * 400;
        const nextSpawn = Math.max(
            gameState.config.minSpawnRate,
            gameState.config.baseSpawnRate + variation
        );
        
        gameState.spawnInterval = setTimeout(spawn, nextSpawn);
    };
    
    spawn();
}

/**
 * Muestra un topo o bomba en un hoyo aleatorio disponible.
 * Decide aleatoriamente si mostrar una bomba según bombChance.
 * Programa la ocultación automática después de un tiempo variable.
 * 
 * @returns {void}
 */
function showRandomMole() {
    if (!gameState.isPlaying) return;
    
    // Obtener hoyos disponibles (sin topo activo ni bomba)
    const holes = document.querySelectorAll('.hole');
    const availableHoles = Array.from(holes).filter(hole => {
        const index = parseInt(hole.dataset.index);
        return !gameState.activeMoles.has(index) && !gameState.activeBombs.has(index);
    });
    
    if (availableHoles.length === 0) return;
    
    // Seleccionar hoyo aleatorio
    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const holeIndex = parseInt(randomHole.dataset.index);
    const mole = randomHole.querySelector('.mole');
    
    // Decidir si mostrar bomba o topo
    const showBomb = gameState.bombsEnabled && Math.random() < gameState.config.bombChance;
    
    if (showBomb) {
        // Mostrar bomba
        mole.textContent = '💣';
        mole.classList.add('up', 'bomb');
        gameState.activeBombs.add(holeIndex);
    } else {
        // Mostrar topo
        mole.textContent = '🐹';
        mole.classList.add('up');
        mole.classList.remove('bomb');
        gameState.activeMoles.add(holeIndex);
    }
    
    // Calcular tiempo de permanencia con variación
    const variation = (Math.random() - 0.5) * 400;
    const moleTime = Math.max(
        gameState.config.minMoleTime,
        gameState.config.baseMoleTime + variation
    );
    
    // Programar ocultación
    const timeout = setTimeout(() => {
        if (showBomb) {
            hideBomb(holeIndex);
        } else {
            hideMole(holeIndex);
        }
    }, moleTime);
    
    gameState.moleTimeouts.set(holeIndex, timeout);
}

/**
 * Oculta una bomba específica del tablero.
 * Limpia las clases CSS y elimina el timeout asociado.
 * 
 * @param {number} holeIndex - Índice del hoyo donde está la bomba
 * @returns {void}
 */
function hideBomb(holeIndex) {
    const hole = document.querySelector(`.hole[data-index="${holeIndex}"]`);
    if (!hole) return;
    
    const mole = hole.querySelector('.mole');
    mole.classList.remove('up', 'bomb', 'hit');
    mole.textContent = '🐹';
    
    gameState.activeBombs.delete(holeIndex);
    
    const timeout = gameState.moleTimeouts.get(holeIndex);
    if (timeout) {
        clearTimeout(timeout);
        gameState.moleTimeouts.delete(holeIndex);
    }
}

/**
 * Oculta un topo específico del tablero.
 * Limpia las clases CSS y elimina el timeout asociado.
 * 
 * @param {number} holeIndex - Índice del hoyo donde está el topo
 * @returns {void}
 */
function hideMole(holeIndex) {
    const hole = document.querySelector(`.hole[data-index="${holeIndex}"]`);
    if (!hole) return;
    
    const mole = hole.querySelector('.mole');
    mole.classList.remove('up');
    mole.classList.remove('hit');
    
    gameState.activeMoles.delete(holeIndex);
    
    const timeout = gameState.moleTimeouts.get(holeIndex);
    if (timeout) {
        clearTimeout(timeout);
        gameState.moleTimeouts.delete(holeIndex);
    }
}

/**
 * Oculta todos los topos y bombas activos del tablero.
 * Limpia todos los Sets y timeouts asociados.
 * Se usa al terminar el juego o reiniciar.
 * 
 * @returns {void}
 */
function hideAllMoles() {
    gameState.activeMoles.forEach(index => {
        hideMole(index);
    });
    gameState.activeBombs.forEach(index => {
        hideBomb(index);
    });
    gameState.activeMoles.clear();
    gameState.activeBombs.clear();
    gameState.moleTimeouts.forEach(timeout => clearTimeout(timeout));
    gameState.moleTimeouts.clear();
}

/**
 * Maneja el evento de clic (golpe) en un hoyo.
 * Detecta si se golpeó un topo, bomba o se falló.
 * - Topo: +10 puntos, animación de éxito
 * - Bomba: Fin del juego, animación de explosión
 * - Fallo: Animación de golpe vacío
 * 
 * @param {MouseEvent} event - Evento de clic del mouse
 * @returns {void}
 */
function handleWhack(event) {
    if (!gameState.isPlaying) return;
    
    const hole = event.currentTarget;
    const holeIndex = parseInt(hole.dataset.index);
    const mole = hole.querySelector('.mole');
    
    // Efecto visual de golpe en el tablero
    elements.gameBoard.classList.add('hitting');
    hole.classList.add('hammer-down');
    
    setTimeout(() => {
        elements.gameBoard.classList.remove('hitting');
        hole.classList.remove('hammer-down');
    }, 100);
    
    // Verificar si golpeó una bomba
    if (mole.classList.contains('up') && mole.classList.contains('bomb') && !mole.classList.contains('hit')) {
        // ¡Golpeó una bomba! Terminar juego
        mole.classList.add('hit');
        createExplosionEffect(hole);
        gameState.gameOverReason = 'bomb';
        
        setTimeout(() => {
            endGame();
        }, 800);
        return;
    }
    
    // Solo contar si el topo está visible y no ha sido golpeado
    if (mole.classList.contains('up') && !mole.classList.contains('hit') && !mole.classList.contains('bomb')) {
        // Marcar como golpeado
        mole.classList.add('hit');
        hole.classList.add('whacked');
        
        // Crear efecto de impacto
        createImpactEffect(hole);
        
        // Incrementar puntaje
        gameState.score += 10;
        elements.scoreDisplay.textContent = gameState.score;
        
        // Animación del puntaje
        elements.scoreDisplay.style.transform = 'scale(1.3)';
        setTimeout(() => {
            elements.scoreDisplay.style.transform = 'scale(1)';
        }, 150);
        
        // Quitar efecto visual y ocultar topo
        setTimeout(() => {
            hole.classList.remove('whacked');
            hideMole(holeIndex);
        }, 300);
    } else {
        // Efecto de golpe fallido
        createMissEffect(hole);
    }
}

/**
 * Crea el efecto visual de explosión cuando se golpea una bomba.
 * Incluye animación de fondo, texto "BOOM" y sacudida de pantalla.
 * 
 * @param {HTMLElement} hole - Elemento del hoyo donde ocurrió la explosión
 * @returns {void}
 */
function createExplosionEffect(hole) {
    // Fondo de explosión
    const explosion = document.createElement('div');
    explosion.className = 'explosion-effect';
    hole.appendChild(explosion);
    
    // Texto de explosión
    const boom = document.createElement('div');
    boom.className = 'explosion-text';
    boom.textContent = '💥 BOOM! 💥';
    hole.appendChild(boom);
    
    // Sacudir la pantalla
    document.body.classList.add('screen-shake');
    
    // Limpiar después de la animación
    setTimeout(() => {
        explosion.remove();
        boom.remove();
        document.body.classList.remove('screen-shake');
    }, 800);
}

/**
 * Crea el efecto visual de impacto exitoso al golpear un topo.
 * Muestra un círculo de impacto y estrellas animadas.
 * 
 * @param {HTMLElement} hole - Elemento del hoyo donde ocurrió el golpe
 * @returns {void}
 */
function createImpactEffect(hole) {
    // Círculo de impacto
    const impact = document.createElement('div');
    impact.className = 'impact-effect';
    hole.appendChild(impact);
    
    // Estrellas
    const stars = document.createElement('div');
    stars.className = 'impact-stars';
    stars.innerHTML = '⭐✨💫';
    stars.style.left = '50%';
    stars.style.top = '30%';
    stars.style.transform = 'translateX(-50%)';
    hole.appendChild(stars);
    
    // Limpiar después de la animación
    setTimeout(() => {
        impact.remove();
        stars.remove();
    }, 400);
}

/**
 * Crea el efecto visual de golpe fallido.
 * Muestra un emoji de aire (💨) con animación de sacudida.
 * 
 * @param {HTMLElement} hole - Elemento del hoyo donde se falló
 * @returns {void}
 */
function createMissEffect(hole) {
    const miss = document.createElement('div');
    miss.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 30px;
        animation: missShake 0.3s ease-out forwards;
        pointer-events: none;
        z-index: 10;
    `;
    miss.textContent = '💨';
    hole.appendChild(miss);
    
    setTimeout(() => miss.remove(), 300);
}

/**
 * Actualiza el display del temporizador en formato MM:SS.
 * 
 * @returns {void}
 */
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Termina la partida actual.
 * Detiene todos los intervalos, oculta los topos,
 * guarda el puntaje y muestra el panel de fin de juego.
 * 
 * @returns {void}
 */
function endGame() {
    gameState.isPlaying = false;
    
    // Limpiar intervalos y timeouts
    clearInterval(gameState.gameInterval);
    clearTimeout(gameState.spawnInterval);
    
    // Ocultar todos los topos
    hideAllMoles();
    
    // Guardar puntaje en ranking
    saveScore();
    
    // Mostrar panel de fin de juego
    elements.finalPlayer.textContent = gameState.playerName;
    elements.finalScore.textContent = gameState.score;
    
    // Mostrar mensaje según razón del fin del juego
    if (elements.gameOverMessage) {
        if (gameState.gameOverReason === 'bomb') {
            elements.gameOverMessage.textContent = '💣 ¡Golpeaste una bomba! 💥';
            elements.gameOverMessage.className = 'game-over-message bomb-message';
        } else {
            elements.gameOverMessage.textContent = '⏱️ ¡Tiempo terminado!';
            elements.gameOverMessage.className = 'game-over-message time-message';
        }
    }
    
    elements.gamePanel.classList.add('hidden');
    elements.gameOverPanel.classList.remove('hidden');
    
    // Actualizar ranking
    loadRanking();
}

/**
 * Muestra el panel de configuración inicial.
 * Oculta los paneles de juego y fin de partida.
 * 
 * @returns {void}
 */
function showConfig() {
    elements.gameOverPanel.classList.add('hidden');
    elements.gamePanel.classList.add('hidden');
    elements.configPanel.classList.remove('hidden');
}

/**
 * Guarda el puntaje actual en localStorage.
 * Mantiene un máximo de 10 puntajes ordenados de mayor a menor.
 * 
 * @returns {void}
 */
function saveScore() {
    const scores = getScores();
    
    /** @type {{player: string, score: number, date: string, timestamp: number}} */
    const newScore = {
        player: gameState.playerName,
        score: gameState.score,
        date: new Date().toLocaleDateString('es-ES'),
        timestamp: Date.now()
    };
    
    scores.push(newScore);
    
    // Ordenar por puntaje descendente
    scores.sort((a, b) => b.score - a.score);
    
    // Mantener solo los 10 mejores puntajes
    const topScores = scores.slice(0, 10);
    
    localStorage.setItem('whackamole_scores', JSON.stringify(topScores));
}

/**
 * Obtiene los puntajes guardados del localStorage.
 * 
 * @returns {Array<{player: string, score: number, date: string, timestamp: number}>} Array de puntajes
 */
function getScores() {
    const scoresJSON = localStorage.getItem('whackamole_scores');
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

/**
 * Carga y renderiza el ranking en la tabla HTML.
 * Muestra los 10 mejores puntajes con posición, nombre, puntaje y fecha.
 * 
 * @returns {void}
 */
function loadRanking() {
    const scores = getScores();
    
    if (scores.length === 0) {
        elements.rankingBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-records">No hay puntajes registrados aún</td>
            </tr>
        `;
        return;
    }
    
    elements.rankingBody.innerHTML = scores.map((score, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${escapeHTML(score.player)}</td>
            <td>${score.score}</td>
            <td>${score.date}</td>
        </tr>
    `).join('');
}

/**
 * Limpia todos los puntajes del ranking.
 * Solicita confirmación antes de eliminar.
 * 
 * @returns {void}
 */
function clearRanking() {
    if (confirm('¿Estás seguro de que quieres borrar todo el ranking?')) {
        localStorage.removeItem('whackamole_scores');
        loadRanking();
    }
}

/**
 * Escapa caracteres HTML para prevenir ataques XSS.
 * Usa el DOM para convertir caracteres especiales a entidades HTML.
 * 
 * @param {string} str - Cadena a escapar
 * @returns {string} Cadena con caracteres HTML escapados
 */
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Reproduce un efecto de sonido.
 * Función preparada para futuras implementaciones de audio.
 * 
 * @param {'whack'|'pop'} type - Tipo de sonido a reproducir
 * @returns {void}
 * 
 * @example
 * // Descomentar para habilitar sonidos
 * playSound('whack');
 */
/*
function playSound(type) {
    const audio = new Audio();
    switch(type) {
        case 'whack':
            audio.src = 'whack.mp3';
            break;
        case 'pop':
            audio.src = 'pop.mp3';
            break;
    }
    audio.play().catch(() => {});
}
*/

/* ==========================================================================
   EXPORTS - Compatible con Node.js (Jest) y navegador
   ========================================================================== */

// Exportar funciones para testing (solo en entorno Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // Funciones utilitarias puras
        formatTime,
        getDifficulty,
        getBombChance,
        getMaxMoles,
        validatePlayerName,
        validateDuration,
        getPointsPerHit,
        sortAndLimitScores,
        // Funciones del juego (requieren DOM)
        escapeHTML,
        getScores
    };
}
