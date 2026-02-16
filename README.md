# 🔨 Whack-a-Mole

Juego de arcade clásico implementado en HTML5, CSS3 y JavaScript vanilla.

![Gameplay](https://img.shields.io/badge/Gameplay-Arcade-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📖 Descripción

Whack-a-Mole es un juego arcade donde el objetivo es golpear los topos (🐹) que aparecen aleatoriamente en el tablero. El juego incluye:

- **Dificultad progresiva**: El juego se vuelve más difícil conforme avanza el tiempo
- **Sistema de bombas**: Las bombas (💣) terminan el juego si las golpeas
- **Ranking persistente**: Los puntajes se guardan en localStorage
- **Cursor personalizado**: Un martillo que cambia al golpear

## 🎮 Cómo Jugar

1. Ingresa tu nombre en el campo de texto
2. Selecciona la duración del juego (1-5 minutos)
3. Activa/desactiva las bombas según prefieras
4. Presiona "¡Iniciar Juego!"
5. Golpea los topos (🐹) haciendo clic para ganar puntos
6. **¡Evita las bombas!** (💣) - Si golpeas una, pierdes inmediatamente

## 🎯 Sistema de Puntuación

| Acción | Puntos |
|--------|--------|
| Golpear un topo | +10 |
| Golpear una bomba | Fin del juego |

## 📊 Niveles de Dificultad

La dificultad aumenta progresivamente durante el juego:

| Fase | Progreso | Topos Simultáneos | Bombas |
|------|----------|-------------------|--------|
| 😊 Fácil | 0-25% | 1 | 10% |
| 😐 Medio | 25-50% | 2 | 15% |
| 😰 Difícil | 50-75% | 3 | 20% |
| 🔥 INSANO | 75-100% | 4 | 25% |

## 🗂️ Estructura del Proyecto

```
whack-a-mole/
├── index.html          # Estructura HTML del juego
├── style.css           # Estilos y animaciones
├── game.js             # Lógica del juego
├── hammer.svg          # Icono del cursor (martillo)
├── hammer-hit.svg      # Icono del cursor (martillo golpeando)
├── README.md           # Este archivo
└── .github/
    ├── agents/         # Configuración de agentes IA
    └── copilot-instructions.md  # Convenciones GitFlow
```

## 🚀 Instalación y Ejecución

### Opción 1: Abrir directamente
Simplemente abre `index.html` en tu navegador.

### Opción 2: Servidor local (recomendado)
```bash
# Con Python 3
python3 -m http.server 8080

# Luego visita http://localhost:8080
```

## 🛠️ Arquitectura

### Estado del Juego (`gameState`)
Objeto central que mantiene toda la información del juego:

```javascript
gameState = {
    score: number,              // Puntaje actual
    timeLeft: number,           // Segundos restantes
    isPlaying: boolean,         // ¿Juego en curso?
    activeMoles: Set,           // Índices de topos activos
    activeBombs: Set,           // Índices de bombas activas
    moleTimeouts: Map,          // Timeouts de ocultación
    playerName: string,         // Nombre del jugador
    gameDuration: number,       // Duración configurada
    difficulty: string,         // 'easy'|'medium'|'hard'|'insane'
    bombsEnabled: boolean,      // ¿Bombas activadas?
    gameOverReason: string,     // 'time'|'bomb'
    config: {                   // Configuración dinámica
        baseSpawnRate: number,
        baseMoleTime: number,
        maxSimultaneousMoles: number,
        bombChance: number
    }
}
```

### Funciones Principales

| Función | Descripción |
|---------|-------------|
| `startGame()` | Inicializa y comienza una partida |
| `endGame()` | Termina el juego y guarda puntaje |
| `showRandomMole()` | Muestra un topo/bomba aleatorio |
| `handleWhack(event)` | Procesa clics del jugador |
| `updateDifficulty()` | Ajusta dificultad según progreso |
| `saveScore()` | Guarda puntaje en localStorage |
| `loadRanking()` | Carga y muestra el ranking |

## 🎨 Características Visuales

- **Cursor personalizado**: Martillo SVG que simula golpear
- **Animaciones**: Efectos de impacto, explosión y sacudida de pantalla
- **Diseño responsivo**: Adaptable a diferentes tamaños de pantalla
- **Gradientes y sombras**: Estilo visual moderno

## 💾 Persistencia de Datos

Los puntajes se almacenan en `localStorage` bajo la clave `whackamole_scores`:

```javascript
{
    player: "NombreJugador",
    score: 150,
    date: "16/02/2026",
    timestamp: 1739721600000
}
```

Se mantienen los 10 mejores puntajes ordenados de mayor a menor.

## 🔧 Configuración Avanzada

Puedes modificar la dificultad base editando `gameState.config` en [game.js](game.js):

```javascript
config: {
    baseSpawnRate: 1200,    // ms entre apariciones
    baseMoleTime: 1800,     // ms visible
    minMoleTime: 400,       // tiempo mínimo visible
    minSpawnRate: 300,      // spawn rate mínimo
    maxSimultaneousMoles: 1,
    bombChance: 0.15        // probabilidad de bomba
}
```

## 🤝 Contribuir

Este proyecto sigue el flujo **GitFlow**. Ver [copilot-instructions.md](.github/copilot-instructions.md) para las convenciones.

1. Crea una rama feature desde `develop`
2. Realiza tus cambios
3. Crea un PR hacia `develop`
4. Las ramas feature **no se eliminan** después del merge

## 📝 Licencia

MIT License - Libre para uso personal y comercial.
