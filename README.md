# frontend-technical-test

Prueba técnica — Exploración de países con Web Components (Lit 3).

## SSR / Hydration: Comentario técnico sobre el enfoque

**Cómo está montada la app.** Es solo cliente y una SPA (single-page application): El HTML inicial es básicamente un contenedor; Vite empaqueta el JavaScript y, al ejecutarlo en el navegador, Lit pinta los Web Components (plantillas, Shadow DOM, eventos). Lo que vemos en el cliente (lista, detalle, búsqueda) sale de ese código y de `fetch` a la API, no de HTML prearmado por la app en el servidor.

**SSR** (_server-side rendering_). Un proceso en el servidor genera HTML antes de la respuesta al cliente, para acercar contenido visible o indexable al primer viaje de red, según el producto.

**Hidratación.** Tras SSR, el JavaScript en el cliente reutiliza ese HTML y lo enlaza con el framework (listeners, estado y siguientes actualizaciones), sin tirar el DOM y repintar todo como si fuera la primera carga.

**Por qué no está en este repo.** El reto pide demostrar el flujo en el navegador (componentes, `fetch`, etc.). Los datos que importan (países) llegan cuando el usuario busca y la API responde. Aunque con SSR el servidor pudiera mandar antes el HTML de la interfaz (cabecera, buscador, etc.), la lista concreta de países seguiría obteniéndose con `fetch` en el navegador, salvo que también se implemente la búsqueda en el servidor.
Añadir SSR e hidratación implicaría montar y mantener otro trozo en el servidor, vigilar código que solo funciona en el navegador, y desplegar con más piezas.
Además, si el HTML del servidor y el que Lit generaría en el cliente no fueran idénticos, aparecen fallos difíciles de depurar.

## Paginación en la lista

- **`country-explorer`** sigue pasando a la lista **todos** los países que devuelve la API (sin recortar en el padre).
- **`country-list`** muestra **12 tarjetas por página** y, si hay más resultados, un pie con **Anterior** / **Siguiente**, texto del tipo “Página 2 de 4 · 13–24 de 40” y `aria-live` para lectores de pantalla.
- La lógica de página está en **`src/utils/pagination.ts`** (`PAGE_SIZE`, `getPageSlice`, `getPageCount`, etc.). Cada búsqueda nueva reinicia la página a 1; al volver del detalle, si la tarjeta estaba en otra página, la lista salta a esa página antes de devolver el foco.

**Nota:** Se eligió **paginación por páginas** en lugar de scroll infinito para un comportamiento predecible, menos carga en el DOM de golpe y controles explícitos accesibles desde teclado.

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
    │   ├── recent-searches.ts
    │   └── pagination.ts
    ├── styles/
    │   ├── _tokens.scss
    │   └── app.scss
    └── components/
        ├── country-explorer/
        │   ├── country-explorer.ts
        │   └── country-explorer.scss
        ├── country-search/
        │   ├── country-search.ts
        │   ├── country-search.scss
        │   └── country-search.test.ts
        ├── country-list/
        │   ├── country-list.ts
        │   └── country-list.scss
        └── country-detail/
            ├── country-detail.ts
            └── country-detail.scss
```
