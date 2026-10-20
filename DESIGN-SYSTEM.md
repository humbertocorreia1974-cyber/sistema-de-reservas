# Sistema de design — Sistema de Reservas
Gerado com **UI/UX Pro Max** (curadoria de estilo + paleta + tipografia).
- **Estilo:** Vibrant & Block-based
- **Palavras-chave:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic
- **Modo:** light
- **Fontes:** Playfair Display SC (títulos) / Karla (corpo)
- **Efeitos:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms
- **Padrão de landing:** Funnel (3-Step Conversion) — Hero > Step 1 (problem) > Step 2 (solution) > Step 3 (action) > CTA progression
- **Evitar:** Low-quality imagery + Outdated hours
## Tokens (CSS vars em `app/globals.css`)
```css
--bg: 0 0% 100%;
--surface: 120 15% 97%;
--surface-2: 120 10% 94%;
--border: 120 10% 88%;
--fg: 160 30% 15%;
--fg-muted: 160 10% 35%;
--brand: 145 55% 40%;
--brand-fg: 0 0% 100%;
--accent: 165 55% 35%;
--accent-fg: 0 0% 100%;
```
_Use SEMPRE os tokens (`bg-brand`, `text-fg`, `border-border`…), nunca hex cru._