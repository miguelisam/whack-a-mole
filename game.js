// Estado del juego
const gameState = {
    score: 0,
    timeLeft: 0,
    isPlaying: false,
    activeMoles: new Set(), // Topos activos (múltiples)
    moleTimeouts: new Map(), // Timeouts individuales de cada topo
    gameInterval: null,
    spawnInterval: null,
    playerName: '',
    gameDuration: 180,
    difficulty: 'easy',
    // Configuración de dificultad dinámica
    config: {
        baseSpawnRate: 1200,    // Tiempo entre apariciones (ms)
        baseMoleTime: 1800,     // Tiempo que el topo permanece visible (ms)
        minMoleTime: 400,       // Tiempo mínimo de permanencia
        minSpawnRate: 300,      // Spawn rate mínimo
        maxSimultaneousMoles: 1 // Topos simultáneos máximos
    }
};

// Elementos del DOM
const elements = {
    configPanel: document.getElementById('config-panel'),
    gamePanel: document.getElementById('game-panel'),
    gameOverPanel: document.getElementById('game-over-panel'),
    playerNameInput: document.getElementById('player-name'),
    gameDurationSelect: document.getElementById('game-duration'),
    startBtn: document.getElementById('start-btn'),
    endBtn: document.getElementById('end-btn'),
    playAgainBtn: document.getElementById('play-again-btn'),
    clearRankingBtn: document.getElementById('clear-ranking-btn'),
    currentPlayer: document.getElementById('current-player'),
    scoreDisplay: document.getElementById('score'),
    timerDisplay: document.getElementById('timer'),
    finalPlayer: document.getElementById('final-player'),
    finalScore: document.getElementById('final-score'),
    gameBoard: document.getElementById('game-board'),
    rankingBody: document.getElementById('ranking-body')
};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    createHoles();
    loadRanking();
    setupEventListeners();
});

// Crear los hoyos del tablero
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

// Configurar event listeners
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.endBtn.addEventListener('click', endGame);
    elements.playAgainBtn.addEventListener('click', showConfig);
    elements.clearRankingBtn.addEventListener('click', clearRanking);
}

// Iniciar el juego
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
    gameState.moleTimeouts.clear();
    
    // Resetear configuración de dificultad
    gameState.config = {
        baseSpawnRate: 1200,
        baseMoleTime: 1800,
        minMoleTime: 400,
        minSpawnRate: 300,
        maxSimultaneousMoles: 1
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

// Actualizar dificultad basada en el tiempo transcurrido
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
    } else if (progressRatio < 0.5) {
        // Medio (25-50%)
        gameState.difficulty = 'medium';
        gameState.config.maxSimultaneousMoles = 2;
        gameState.config.baseMoleTime = 1400;
        gameState.config.baseSpawnRate = 900;
    } else if (progressRatio < 0.75) {
        // Difícil (50-75%)
        gameState.difficulty = 'hard';
        gameState.config.maxSimultaneousMoles = 3;
        gameState.config.baseMoleTime = 1000;
        gameState.config.baseSpawnRate = 600;
    } else {
        // Insano (75-100%)
        gameState.difficulty = 'insane';
        gameState.config.maxSimultaneousMoles = 4;
        gameState.config.baseMoleTime = 700;
        gameState.config.baseSpawnRate = 400;
    }
    
    // Añadir variación adicional basada en progreso exacto
    const phaseProgress = (progressRatio % 0.25) / 0.25;
    gameState.config.baseMoleTime = Math.max(
        gameState.config.minMoleTime,
        gameState.config.baseMoleTime - (phaseProgress * 200)
    );
    
    updateDifficultyIndicator();
}

// Actualizar indicador visual de dificultad
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

// Sistema de aparición de topos
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

// Mostrar topo aleatorio
function showRandomMole() {
    if (!gameState.isPlaying) return;
    
    // Obtener hoyos disponibles (sin topo activo)
    const holes = document.querySelectorAll('.hole');
    const availableHoles = Array.from(holes).filter(hole => {
        const index = parseInt(hole.dataset.index);
        return !gameState.activeMoles.has(index);
    });
    
    if (availableHoles.length === 0) return;
    
    // Seleccionar hoyo aleatorio
    const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const holeIndex = parseInt(randomHole.dataset.index);
    const mole = randomHole.querySelector('.mole');
    
    // Mostrar topo
    mole.classList.add('up');
    gameState.activeMoles.add(holeIndex);
    
    // Calcular tiempo de permanencia con variación
    const variation = (Math.random() - 0.5) * 400;
    const moleTime = Math.max(
        gameState.config.minMoleTime,
        gameState.config.baseMoleTime + variation
    );
    
    // Programar ocultación del topo
    const timeout = setTimeout(() => {
        hideMole(holeIndex);
    }, moleTime);
    
    gameState.moleTimeouts.set(holeIndex, timeout);
}

// Ocultar topo específico
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

// Ocultar todos los topos
function hideAllMoles() {
    gameState.activeMoles.forEach(index => {
        hideMole(index);
    });
    gameState.activeMoles.clear();
    gameState.moleTimeouts.forEach(timeout => clearTimeout(timeout));
    gameState.moleTimeouts.clear();
}

// Manejar golpe
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
    
    // Solo contar si el topo está visible y no ha sido golpeado
    if (mole.classList.contains('up') && !mole.classList.contains('hit')) {
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

// Crear efecto de impacto exitoso
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

// Crear efecto de golpe fallido
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

// Actualizar display del temporizador
function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    elements.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Terminar juego
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
    
    elements.gamePanel.classList.add('hidden');
    elements.gameOverPanel.classList.remove('hidden');
    
    // Actualizar ranking
    loadRanking();
}

// Mostrar configuración
function showConfig() {
    elements.gameOverPanel.classList.add('hidden');
    elements.gamePanel.classList.add('hidden');
    elements.configPanel.classList.remove('hidden');
}

// Guardar puntaje en localStorage
function saveScore() {
    const scores = getScores();
    
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

// Obtener puntajes del localStorage
function getScores() {
    const scoresJSON = localStorage.getItem('whackamole_scores');
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

// Cargar ranking en la tabla
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

// Limpiar ranking
function clearRanking() {
    if (confirm('¿Estás seguro de que quieres borrar todo el ranking?')) {
        localStorage.removeItem('whackamole_scores');
        loadRanking();
    }
}

// Escapar HTML para prevenir XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Función opcional para sonidos (descomentarla si se quieren agregar sonidos)
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
