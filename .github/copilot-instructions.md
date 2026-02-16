# GitHub Copilot Instructions

## Git Workflow: GitFlow

Este proyecto sigue el esquema **GitFlow** para el manejo de ramas y releases.

### Estructura de Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Código de producción. Solo releases estables. |
| `develop` | Rama de integración. Base para nuevas features. |
| `feature/*` | Nuevas funcionalidades. Se crean desde `develop`. |
| `release/*` | Preparación de releases. Se crean desde `develop`. |
| `hotfix/*` | Correcciones urgentes en producción. Se crean desde `main`. |

### Reglas de Trabajo

#### Crear nueva feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-descriptivo
```

#### Pull Requests
- **Base para features:** `develop` (nunca `main`)
- **Base para hotfixes:** `main`
- **Base para releases:** `main` (merge) y `develop` (back-merge)
- **NO eliminar ramas feature** después del merge (mantener historial)

#### Merge de PRs
- Usar **squash merge** para features hacia develop
- Usar **merge commit** para releases hacia main
- **NO usar `--delete-branch`** en el merge de features

#### Crear Pull Request (feature → develop)
```bash
gh pr create --base develop --head feature/nombre --title "feat: descripción"
```

#### Merge sin eliminar rama
```bash
gh pr merge <numero> --squash
# NO usar --delete-branch
```

### Convenciones de Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato (no afecta lógica)
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Flujo Completo de Release

1. Crear rama release desde develop:
   ```bash
   git checkout -b release/v1.0.0 develop
   ```

2. Ajustes finales (version bump, changelog)

3. Merge a main:
   ```bash
   gh pr create --base main --head release/v1.0.0
   gh pr merge <numero> --merge
   ```

4. Tag de versión:
   ```bash
   git checkout main && git pull
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

5. Back-merge a develop:
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

### Hotfixes

Para correcciones urgentes en producción:

```bash
git checkout -b hotfix/descripcion main
# hacer cambios
gh pr create --base main --head hotfix/descripcion
# después del merge, back-merge a develop
```

---

**Importante:** Siempre verificar que estás en la rama correcta antes de crear commits o PRs.
