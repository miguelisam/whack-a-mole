# 🔨 Whack-a-Mole

Juego de arcade clásico implementado en HTML5, CSS3 y JavaScript vanilla.

[![CI Pipeline](https://github.com/miguelisam/whack-a-mole/actions/workflows/ci.yml/badge.svg)](https://github.com/miguelisam/whack-a-mole/actions/workflows/ci.yml)
[![Deploy](https://github.com/miguelisam/whack-a-mole/actions/workflows/deploy.yml/badge.svg)](https://github.com/miguelisam/whack-a-mole/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://miguelisam.github.io/whack-a-mole/)

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
├── index.html              # Estructura HTML del juego
├── style.css               # Estilos y animaciones
├── game.js                 # Lógica del juego
├── hammer.svg              # Icono del cursor (martillo)
├── hammer-hit.svg          # Icono del cursor (martillo golpeando)
├── package.json            # Dependencias y scripts npm
├── jest.config.js          # Configuración de tests
├── README.md               # Este archivo
├── .eslintrc.json          # Configuración ESLint (JS)
├── .stylelintrc.json       # Configuración Stylelint (CSS)
├── .htmlhintrc             # Configuración HTMLHint
├── .gitignore              # Archivos ignorados por Git
├── scripts/
│   └── build.js            # Script de construcción
├── tests/
│   ├── setup.js            # Configuración de Jest
│   └── game.test.js        # Tests unitarios
└── .github/
    ├── workflows/
    │   ├── ci.yml          # Pipeline de CI
    │   ├── deploy.yml      # Pipeline de despliegue
    │   └── pr-check.yml    # Validaciones de PR
    ├── agents/             # Configuración de agentes IA
    └── copilot-instructions.md  # Convenciones GitFlow
```

## 🚀 Instalación y Ejecución

### Opción 1: Abrir directamente
Simplemente abre `index.html` en tu navegador.

### Opción 2: Servidor local con npm (recomendado)
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Visita http://localhost:8080
```

### Opción 3: Servidor local con Python
```bash
python3 -m http.server 8080
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ver cobertura de código
npm test -- --coverage
```

## 🔍 Linting

```bash
# Ejecutar todos los linters
npm run lint

# Lint individual
npm run lint:html    # HTMLHint
npm run lint:css     # Stylelint
npm run lint:js      # ESLint

# Auto-fix (JS y CSS)
npm run lint:fix
```

## 🏗️ Build

```bash
# Construir para producción
npm run build

# Output en dist/
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

## ⚙️ CI/CD

Este proyecto utiliza **GitHub Actions** para automatización:

### Pipelines

| Workflow | Trigger | Descripción |
|----------|---------|-------------|
| **CI Pipeline** | Push/PR a `main`, `develop`, `feature/*` | Lint, tests y build |
| **Deploy** | Push a `main` | Despliegue a GitHub Pages |
| **PR Checks** | PRs a `main`, `develop` | Validación de convenciones |

### CI Pipeline (`ci.yml`)

```
🔍 Lint → 🧪 Test → 🏗️ Build → 🔒 Security
```

- **Lint**: Valida HTML (HTMLHint), CSS (Stylelint), JS (ESLint)
- **Test**: Ejecuta tests unitarios con Jest
- **Build**: Verifica que el proyecto compila correctamente
- **Security**: Auditoría de dependencias npm

### Deploy Pipeline (`deploy.yml`)

Despliegue automático a GitHub Pages cuando se hace merge a `main`:

1. Build del proyecto
2. Ejecución de tests
3. Upload de artefactos
4. Deploy a GitHub Pages

**URL de producción**: https://miguelisam.github.io/whack-a-mole/

### PR Checks (`pr-check.yml`)

- Valida que el título siga Conventional Commits
- Verifica que features apunten a `develop`
- Verifica que hotfixes apunten a `main`
- Reporta tamaño del PR

### Configurar GitHub Pages

1. Ve a **Settings > Pages**
2. En **Source**, selecciona **GitHub Actions**
3. El primer deploy se realizará automáticamente

## 📝 Licencia

MIT License - Libre para uso personal y comercial.
