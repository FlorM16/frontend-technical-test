# frontend-technical-test

Prueba técnica — Exploración de países con Web Components (Lit 3).

## Límite de 12 resultados en la lista

- **`country-explorer`** guarda y envía a la lista todos los países que devuelve la API.
- **`country-list`** recibe esa lista completa en la prop `countries`, pero solo pinta las primeras 12 tarjetas, el resto no se muestra en pantalla.

**¿Por qué el corte está en la lista?** Porque el límite es solo “cuántas tarjetas enseño”, no “cuántos datos tengo”. 
El explorador sigue teniendo la respuesta completa por si en el futuro hiciera falta mostrar más, paginar o usar esos datos en otro sitio. Así la lista también sirve en otros contextos: puedes darle muchos países y ella decide cuántos enseña, sin obligar al padre a recortar la lista.

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
