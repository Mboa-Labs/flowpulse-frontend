# FlowPulse — Frontend

Interface React de [FlowPulse](https://github.com/Mboa-Labs/flowpulse) : connexion, navigation par rôle, écrans de supervision.

## Lancer

```bash
npm install
npm run dev      # http://localhost:5173 ; /api est redirigé vers le backend (localhost:8080)
npm run build
```

En production, l'image Docker sert l'application avec Nginx et redirige `/api` et `/ws` vers le backend.
