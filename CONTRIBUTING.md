# Contribuir al proyecto — Living Sport

Gracias por colaborar en **Living Sport**.  
Estas reglas ayudan a mantener el repositorio organizado, facilitar revisiones de código y evitar conflictos entre desarrolladores.

> [!IMPORTANT]
> La rama principal de desarrollo del proyecto es **`develop`**.  
> Todas las nuevas funcionalidades deben crearse a partir de esta rama.

# Flujo de trabajo (Git)

## 1. Clonar el repositorio

```bash
git clone https://github.com/nicoarbelaez/living-sports-app.git
cd living-sports-app
```

## 2. Cambiar a la rama base del proyecto

La rama `develop` ya está creada y es donde se integran las nuevas funcionalidades.

```bash
git checkout develop
git pull origin develop
```

## 3. Crear una nueva rama para la funcionalidad

Cada funcionalidad debe desarrollarse en una rama independiente.

```bash
git checkout -b feature/<descripcion-breve>
```

Ejemplo:

```bash
git checkout -b feature/login-social
```

> [!TIP]
> Usa nombres de ramas claros y descriptivos para que el equipo entienda fácilmente el propósito del cambio.

## 4. Trabajar en la funcionalidad

Realiza cambios pequeños y realiza **commits frecuentes**.

Ejemplo de commit:

```bash
git commit -m "feat: agregar login con Google"
```

## 5. Ejecutar lint y pruebas antes de subir cambios

```bash
npm install
npm run lint
# npm test (si aplica)
```

> [!IMPORTANT]
> Siempre ejecuta el linter antes de hacer push para evitar errores de estilo o sintaxis.

## 6. Subir la rama al repositorio remoto

```bash
git push origin feature/<descripcion-breve>
```

Ejemplo:

```bash
git push origin feature/login-social
```

## 7. Crear un Pull Request

Desde el repositorio en **GitHub**, crea un **Pull Request hacia `develop`**.

El Pull Request debe incluir:

- Descripción clara de la funcionalidad
- Pasos para probar los cambios
- Capturas de pantalla si aplica
- Lista de cambios realizados

> [!NOTE]
> Asigna al menos **un revisor del equipo** antes de hacer merge.

## 8. Revisión y merge

El proceso de integración es:

1. Un miembro del equipo revisa el código.
2. Si hay observaciones, se corrigen en la misma rama.
3. Cuando el PR esté aprobado, se realiza el **merge hacia `develop`**.

> [!TIP]
> Se recomienda utilizar **Squash Merge** para mantener el historial del repositorio limpio.

# Reglas generales

- No hacer commits directamente en `main` ni en `develop`.
- Cada Pull Request debe describir **cómo probar los cambios**.
- No mezclar múltiples funcionalidades en un mismo PR.
- Mantener el código limpio y legible.
- Seguir las reglas de ESLint y formateo del proyecto.

> [!CAUTION]
> Trabajar directamente sobre `develop` puede generar conflictos y pérdida de cambios de otros colaboradores.

# Escritura de commits

Este proyecto utiliza **convenciones de commits** para mantener un historial claro y entendible.

Formato:

```
<tipo>: descripción breve
```

Ejemplo:

```
feat: agregar sistema de comentarios en el feed
```

Prefijos permitidos:

| Prefijo      | Descripción                                                |
| ------------ | ---------------------------------------------------------- |
| **feat**     | Nueva funcionalidad para el usuario                        |
| **fix**      | Corrección de un bug                                       |
| **perf**     | Mejoras de rendimiento                                     |
| **build**    | Cambios en el sistema de build o instalación               |
| **ci**       | Cambios en integración continua                            |
| **docs**     | Cambios en la documentación                                |
| **refactor** | Refactorización del código sin cambiar comportamiento      |
| **style**    | Cambios de formato o estilo (espacios, tabulaciones, etc.) |
| **test**     | Añadir o modificar tests                                   |

> [!IMPORTANT]
> Los mensajes de commit deben estar escritos en **inglés** y describir claramente el cambio realizado.

# Convenciones de nombres de ramas

Las ramas deben seguir esta estructura:

```
feature/<descripcion>
hotfix/<descripcion>
chore/<descripcion>
docs/<descripcion>
```

Ejemplos:

```
feature/create-post
feature/add-comments
hotfix/fix-login-error
docs/update-readme
```

# Issues

Antes de desarrollar funcionalidades grandes se recomienda crear un **Issue** en el repositorio.

Esto permite:

- discutir la solución
- evitar trabajo duplicado
- documentar decisiones técnicas

# Emergencias

Para correcciones urgentes:

1. Crear una rama `hotfix`
2. Crear Pull Request
3. Etiquetar el PR como **urgent**

> [!WARNING]
> Las ramas `hotfix` deben revisarse rápidamente para evitar problemas en el entorno de desarrollo.
