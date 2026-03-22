# frontend-technical-test

Prueba técnica — Exploración de países con Web Components (Lit 3).

## Declaración de uso de asistentes de IA

Se ha revisado el contenido generado o sugerido mediante asistentes de IA en los bloques siguientes:

- **README — sección «SSR / Hydration»:** definiciones y argumentos.
- **README — estructura del código:** diagrama en texto del árbol de directorios.
- **Código — accesibilidad:** definiciones en README e implementación en componentes (landmarks, ARIA, gestión de foco, tecla Escape, skip link, `prefers-reduced-motion`, `lang` en HTML).
- **Código y config — tests:** definiciones en README, Web Test Runner, `web-test-runner.config.mjs`, dependencias asociadas, archivos `pagination.test.ts` y `recent-searches.test.ts`.

## SSR / Hydration: Comentario técnico sobre el enfoque

**Cómo está montada la app.** Es solo cliente y una SPA (single-page application): el HTML inicial es básicamente un contenedor; Vite empaqueta el JavaScript y, al ejecutarlo en el navegador, Lit pinta los Web Components (plantillas, Shadow DOM, eventos). En el cliente, la lista, el detalle y la búsqueda se construyen con ese código y con `fetch` a la API, no con HTML prearmado por la app en el servidor.

**SSR** (_server-side rendering_). Un proceso en el servidor genera HTML antes de la respuesta al cliente, para acercar contenido visible o indexable al primer viaje de red, según el producto.

**Hidratación.** Tras SSR, el JavaScript en el cliente reutiliza ese HTML y lo enlaza con el framework (listeners, estado y siguientes actualizaciones), sin tirar el DOM y repintar todo como si fuera la primera carga.

**Por qué no está en este repo.** El reto pide demostrar el flujo en el navegador (componentes, `fetch`, etc.). Los datos que importan (países) llegan cuando el usuario busca y la API responde. Aunque con SSR el servidor pudiera mandar antes el HTML de la interfaz (cabecera, buscador, etc.), la lista concreta de países seguiría obteniéndose con `fetch` en el navegador, salvo que también se implemente la búsqueda en el servidor.
Añadir SSR e hidratación implicaría montar y mantener otro trozo en el servidor, vigilar código que solo funciona en el navegador, y desplegar con más piezas.
Además, si el HTML del servidor y el que Lit generaría en el cliente no fueran idénticos, aparecen fallos difíciles de depurar.

## Paginación en la lista

- **`country-explorer`** sigue pasando a la lista **todos** los países que devuelve la API (sin recortar en el padre).
- **`country-list`** muestra 12 tarjetas por página y, si hay más resultados, un pie con Anterior / Siguiente, texto del tipo “Página 2 de 4 · 13–24 de 40” y `aria-live` para lectores de pantalla.
- La lógica de página está en **`src/utils/pagination.ts`** (`PAGE_SIZE`, `getPageSlice`, `getPageCount`, etc.). Cada búsqueda nueva reinicia la página a 1; al volver del detalle, si la tarjeta estaba en otra página, la lista salta a esa página antes de devolver el foco.

**Nota:** Se prefiere **paginación por páginas** frente a scroll infinito por un comportamiento más predecible, menos carga de nodos de golpe y controles explícitos accesibles desde teclado.

## Búsquedas recientes (`localStorage`)

Tras cada búsqueda completada (sin cancelar por una nueva petición), el término se guarda con `src/utils/recent-searches.ts` (clave `country-explorer-recent-searches`, máximo 10 entradas, sin duplicar ignorando mayúsculas). `country-search` muestra chips "Recientes" para repetir la búsqueda; si `localStorage` no está disponible, la utilidad falla en silencio.

## Accesibilidad

- **ARIA y landmarks:** `role="banner"` en la cabecera, `<main>` con `aria-label`, `role="search"` en el buscador, regiones en lista de resultados y en el panel de detalle, estados de carga/error/vacío (`aria-busy`, `role="alert"` / `status`, `aria-live` donde aplica), `aria-label` en tarjetas y chips recientes, lista de países con estructura `list` / `listitem` donde corresponde.
- **Foco:** botón para saltar al contenido principal (enfoca el `<main>`; no usa `#` dentro del Shadow DOM), al abrir el detalle el foco va al título del país, al volver (Volver o Escape) el foco vuelve a la tarjeta correspondiente (ajustando la página de paginación si hace falta).
- **Movimiento reducido:** se respeta `prefers-reduced-motion` en transiciones/animaciones del detalle, lista (spinner y tarjetas), buscador, botones del paginador y `scroll-behavior` global en `app.scss`.

`index.html` usa **`lang="es"`** acorde a la interfaz.

## Tests

El reto pide al menos dos pruebas unitarias con Web Test Runner (WTR), Open WC Testing o Jest. En este repo se usa WTR + Open WC Testing (no Jest).

- **Pruebas unitarias** — Scripts que comprueban que, con unos datos de entrada, el resultado es el esperado.

- **Web Test Runner (WTR)** — Orquesta los tests: los encuentra, los ejecuta y muestra el resultado en la terminal. Comando `npm run test`, paquete `@web/test-runner`.

- **Open WC Testing** — Comprobaciones del test, escritas con la función `expect` y métodos tipo `.to.equal` / `.to.deep.equal`. Paquete `@open-wc/testing`, importado en `pagination.test.ts` y `recent-searches.test.ts`.

- **esbuild (vía dev server)** — Compila TypeScript para el navegador de pruebas. `@web/dev-server-esbuild` en `web-test-runner.config.mjs`.

- **Playwright** — Arranca un navegador “headless” solo para correr los tests. `@web/test-runner-playwright` y `playwrightLauncher` en `web-test-runner.config.mjs`.

- **Chromium** — Es el motor de navegador de código abierto sobre el que se apoyan Chrome, Edge y otros. Playwright descarga una copia solo para tests (a veces sin ventana visible) y ahí se ejecuta el JavaScript como en un navegador real. Eso permite usar APIs del navegador en tests, por ejemplo `localStorage` en `recent-searches.test.ts`.  
  No hay una carpeta “Chromium” en el repo; el binario queda en la máquina la primera vez que se ejecutan los tests.

- **`src/utils/pagination.test.ts`**: paginación (trozos por página, conteo de páginas, rangos, `clampPage`).
- **`src/utils/recent-searches.test.ts`**: historial en `localStorage` (orden, duplicados sin distinguir mayúsculas, máximo 10).

En la raíz del proyecto: `npm run test`. La primera vez puede tardar si hay que descargar Chromium para Playwright.

## Estructura del código

```text
frontend-technical-test/
├── .gitignore
├── index.html
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── vite.config.ts
├── web-test-runner.config.mjs
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.ts
    ├── style.css
    ├── vite-env.d.ts
    ├── assets/
    │   ├── hero.png
    │   ├── typescript.svg
    │   └── vite.svg
    ├── types/
    │   └── country.ts
    ├── services/
    │   └── countries-api.ts
    ├── utils/
    │   ├── debounce.ts
    │   ├── pagination.ts
    │   ├── pagination.test.ts
    │   ├── recent-searches.ts
    │   └── recent-searches.test.ts
    ├── styles/
    │   ├── _tokens.scss
    │   └── app.scss
    └── components/
        ├── country-explorer/
        │   ├── country-explorer.ts
        │   └── country-explorer.scss
        ├── country-search/
        │   ├── country-search.ts
        │   └── country-search.scss
        ├── country-list/
        │   ├── country-list.ts
        │   └── country-list.scss
        └── country-detail/
            ├── country-detail.ts
            └── country-detail.scss
```
