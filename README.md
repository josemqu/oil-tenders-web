# Oil Tenders Web

Stack: Next.js 14 (App Router) + React 18 + TypeScript + TailwindCSS + shadcn-style UI.

Se conecta a la API FastAPI: https://oil-tenders-api.up.railway.app

## Requisitos

- Node 18+ (recomendado 20)

## Configuración

1. Copia el archivo `.env.local.example` a `.env.local` si quieres sobreescribir la URL de API.
2. Instala dependencias:

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La app corre en http://localhost:3000

## Producción

```bash
npm run build && npm start
```

## Estructura

- `src/app/` páginas con App Router (`layout.tsx`, `page.tsx`)
- `src/components/ui/` componentes base (Button, Card, Input)
- `src/lib/` utilidades (`utils.ts` con `cn` y `API_BASE`, `api.ts` cliente simple)

## Notas

- Puedes agregar nuevas páginas en `src/app/` y componentes en `src/components/`.
- El dashboard inicial muestra el estado de la API, carga el OpenAPI y permite probar endpoints rápidamente.
- Ajusta `NEXT_PUBLIC_API_BASE` si cambias de backend.
