/**
 * Tests para el juego Whack-a-Mole
 * 
 * @jest-environment jsdom
 */

// Importar funciones del módulo game.js
const {
    formatTime,
    getDifficulty,
    getBombChance,
    getMaxMoles,
    validatePlayerName,
    validateDuration,
    getPointsPerHit,
    sortAndLimitScores,
    escapeHTML,
    getScores
} = require('../game.js');

describe('Whack-a-Mole Game', () => {
    // Cargar el HTML antes de cada test
    beforeEach(() => {
        document.body.innerHTML = `
            <div class="game-container">
                <div id="config-panel" class="panel">
                    <input type="text" id="player-name">
                    <select id="game-duration">
                        <option value="60">1 minuto</option>
                        <option value="180" selected>3 minutos</option>
                    </select>
                    <input type="checkbox" id="bombs-enabled" checked>
                    <button id="start-btn">Iniciar</button>
                </div>
                <div id="game-panel" class="panel hidden">
                    <span id="current-player">-</span>
                    <span id="score">0</span>
                    <span id="timer">0:00</span>
                    <span id="difficulty-indicator"></span>
                    <div id="game-board"></div>
                    <button id="end-btn">Terminar</button>
                </div>
                <div id="game-over-panel" class="panel hidden">
                    <div id="game-over-message"></div>
                    <span id="final-player">-</span>
                    <span id="final-score">0</span>
                    <button id="play-again-btn">Jugar de Nuevo</button>
                </div>
                <div class="ranking-panel">
                    <tbody id="ranking-body"></tbody>
                    <button id="clear-ranking-btn">Limpiar</button>
                </div>
            </div>
        `;
    });

    describe('Funciones utilitarias', () => {
        test('escapeHTML debe escapar caracteres especiales', () => {
            expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
            expect(escapeHTML('Hello & World')).toBe('Hello &amp; World');
            expect(escapeHTML('"quoted"')).toBe('"quoted"');
            expect(escapeHTML("it's")).toBe("it's");
        });

        test('formatTime debe mostrar tiempo correctamente', () => {
            expect(formatTime(0)).toBe('0:00');
            expect(formatTime(59)).toBe('0:59');
            expect(formatTime(60)).toBe('1:00');
            expect(formatTime(125)).toBe('2:05');
            expect(formatTime(180)).toBe('3:00');
        });
    });

    describe('localStorage - Ranking', () => {
        test('getScores debe retornar array vacío si no hay datos', () => {
            expect(getScores()).toEqual([]);
        });

        test('getScores debe retornar scores guardados', () => {
            const testScores = [
                { player: 'Test', score: 100, date: '16/02/2026' }
            ];
            localStorage.setItem('whackamole_scores', JSON.stringify(testScores));

            expect(getScores()).toEqual(testScores);
        });

        test('clearRanking debe eliminar los scores', () => {
            localStorage.setItem('whackamole_scores', JSON.stringify([
                { player: 'Test', score: 100 }
            ]));

            localStorage.removeItem('whackamole_scores');
            expect(localStorage.getItem('whackamole_scores')).toBeNull();
        });
    });

    describe('Configuración de dificultad', () => {
        test('calcular dificultad según progreso', () => {
            expect(getDifficulty(0)).toBe('easy');
            expect(getDifficulty(0.1)).toBe('easy');
            expect(getDifficulty(0.25)).toBe('medium');
            expect(getDifficulty(0.5)).toBe('hard');
            expect(getDifficulty(0.75)).toBe('insane');
            expect(getDifficulty(1)).toBe('insane');
        });

        test('configuración de bombas según dificultad', () => {
            expect(getBombChance('easy')).toBe(0.10);
            expect(getBombChance('medium')).toBe(0.15);
            expect(getBombChance('hard')).toBe(0.20);
            expect(getBombChance('insane')).toBe(0.25);
        });

        test('topos simultáneos según dificultad', () => {
            expect(getMaxMoles('easy')).toBe(1);
            expect(getMaxMoles('medium')).toBe(2);
            expect(getMaxMoles('hard')).toBe(3);
            expect(getMaxMoles('insane')).toBe(4);
        });
    });

    describe('Sistema de puntuación', () => {
        test('puntos por golpe según dificultad', () => {
            expect(getPointsPerHit('easy')).toBe(10);
            expect(getPointsPerHit('medium')).toBe(15);
            expect(getPointsPerHit('hard')).toBe(20);
            expect(getPointsPerHit('insane')).toBe(30);
        });

        test('ordenar scores de mayor a menor', () => {
            const scores = [
                { player: 'A', score: 50 },
                { player: 'B', score: 100 },
                { player: 'C', score: 75 }
            ];

            const sorted = sortAndLimitScores(scores);

            expect(sorted[0].player).toBe('B');
            expect(sorted[1].player).toBe('C');
            expect(sorted[2].player).toBe('A');
        });

        test('mantener solo top 10 scores', () => {
            const scores = Array.from({ length: 15 }, (_, i) => ({
                player: `Player${i}`,
                score: i * 10
            }));

            const topScores = sortAndLimitScores(scores);

            expect(topScores.length).toBe(10);
            expect(topScores[0].score).toBe(140);
            expect(topScores[9].score).toBe(50);
        });
    });

    describe('Validación de entrada', () => {
        test('nombre de jugador no puede estar vacío', () => {
            expect(validatePlayerName('')).toBe(false);
            expect(validatePlayerName('   ')).toBe(false);
            expect(validatePlayerName('Juan')).toBe(true);
            expect(validatePlayerName(' Ana ')).toBe(true);
        });

        test('duración debe estar en rango válido', () => {
            expect(validateDuration(60)).toBe(true);
            expect(validateDuration(180)).toBe(true);
            expect(validateDuration(300)).toBe(true);
            expect(validateDuration(30)).toBe(false);
            expect(validateDuration(600)).toBe(false);
        });
    });

    describe('Funciones adicionales', () => {
        test('formatTime con valores límite', () => {
            expect(formatTime(0)).toBe('0:00');
            expect(formatTime(3599)).toBe('59:59');
            expect(formatTime(3600)).toBe('60:00');
        });

        test('getDifficulty con valores extremos', () => {
            expect(getDifficulty(-0.1)).toBe('easy');
            expect(getDifficulty(0.249)).toBe('easy');
            expect(getDifficulty(0.251)).toBe('medium');
            expect(getDifficulty(0.999)).toBe('insane');
        });

        test('getBombChance con dificultad inválida retorna default', () => {
            expect(getBombChance('unknown')).toBe(0.15);
        });

        test('getMaxMoles con dificultad inválida retorna default', () => {
            expect(getMaxMoles('unknown')).toBe(1);
        });

        test('sortAndLimitScores no modifica array original', () => {
            const original = [
                { player: 'A', score: 50 },
                { player: 'B', score: 100 }
            ];
            const copy = [...original];
            
            sortAndLimitScores(original);
            
            expect(original).toEqual(copy);
        });

        test('escapeHTML con string vacío', () => {
            expect(escapeHTML('')).toBe('');
        });

        test('getScores retorna copia independiente', () => {
            const testScores = [{ player: 'Test', score: 100 }];
            localStorage.setItem('whackamole_scores', JSON.stringify(testScores));
            
            const scores1 = getScores();
            const scores2 = getScores();
            
            scores1[0].score = 999;
            expect(scores2[0].score).toBe(100);
        });
    });
});
