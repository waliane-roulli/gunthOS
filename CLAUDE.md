# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Dev server with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit (no test suite)

pnpm db:generate  # Generate Drizzle migration files
pnpm db:migrate   # Apply pending migrations
pnpm db:push      # Push schema without migration files (dev only)
pnpm db:studio    # Drizzle Studio GUI
```

No test suite exists. Type-checking (`pnpm typecheck`) is the primary correctness signal.

## Architecture

**GunthOS** is a retro Windows 98-style desktop OS running in the browser. Every feature is an "app" opened inside a draggable/resizable window.

### Provider tree (outermost → innermost)

```
SoundProvider
  RadioProvider
    WindowManagerProvider
      GunthTitle + Taskbar + OsDesktop + WindowLayer
```

`SiteShell` (`src/components/ui/site-shell.tsx`) owns the boot/shutdown state machine and assembles this tree. The `WindowLayer` renders all open windows on top of the desktop using `OsWindow`.

### App registry pattern

Every app lives in `src/apps/<slug>/` with exactly two files:
- `index.tsx` — the React component, receives `{ windowId: string }` as props
- `manifest.ts` — an `AppManifest` object (see `src/types/index.ts`)

`src/apps/index.ts` is the **single source of truth**: import the manifest and add it to `APP_REGISTRY`. That's all. The window manager, taskbar, launcher, and audio cleanup all derive from this registry automatically.

**Adding a new app** — 4 steps:
1. Create `src/apps/my-app/manifest.ts` with `AppManifest`
2. Create `src/apps/my-app/index.tsx` with `export function MyApp({ windowId }: AppProps)`
3. Import and add to `APP_REGISTRY` in `src/apps/index.ts`
4. Set `showInLauncher: true` to appear in Start menu and on the desktop

### Key `AppManifest` fields

| Field | Purpose |
|---|---|
| `slug` | Unique identifier, used everywhere as the key |
| `defaultSize` | Initial window size `{ w, h }` in px |
| `loadDuration` | Fake loading bar duration (ms) shown on open |
| `showInLauncher` | Appears in Start menu + desktop icon |
| `persistAudio` | If `true`, audio keeps playing after window close (Radio) |
| `audioChannels` | Named channels auto-silenced on window close |

### Window manager

`WindowManagerProvider` (`src/lib/contexts/window-manager-context.tsx`) is split into **two separate contexts**:
- `useWindowState()` — re-renders on every window change
- `useWindowActions()` — stable, never re-renders

Use `useWindowActions()` when you only need to open/close/focus. Use `useWindowState()` only when you need to read the window list. `useWindowManager()` gives both but re-renders on state changes.

To open an app from within a component, use `useOpenApp()` (`src/lib/hooks/use-open-app.ts`) — it handles audio init + open sound + window creation in one call.

### Audio system

Three layers:
1. **Engine** (`src/lib/audio/engine.ts`) — singleton `AudioContext`, master gain, buffer cache with deduped in-flight fetches
2. **Channels** (`src/lib/audio/channel.ts`) — named `AudioChannel` instances (e.g. `"ui"`, `"music"`, `"radio"`) each with their own GainNode → master. Created lazily via `getChannel(name)`
3. **Players** (`src/lib/audio/player.ts`) — `AudioPlayer` wraps a channel for play/loop/fade operations
4. **Hook** (`src/lib/hooks/use-sound.ts`) — all OS sounds (synthetic Web Audio API tones + MP3 players). Exposed via `SoundProvider` / `useSoundContext()`

**Adding sounds to an app:**
- Declare `audioChannels: ["my-channel"]` in the manifest — the window manager silences them automatically on close
- For persistent audio (like Radio), set `persistAudio: true`
- For custom playback control, call `getChannel("my-channel")` directly in the app and manage an `AudioPlayer` instance

### Database

SQLite via `better-sqlite3` + Drizzle ORM. Schema in `src/lib/db/schema.ts`. Auth tables are managed by `better-auth` (`src/lib/auth.ts`). Migrations run automatically at startup (`migrate.js`).

All server-side DB access goes through API routes in `src/app/api/`. No direct DB calls from client components.

### Auth

`better-auth` with username/password. Server instance at `src/lib/auth.ts`, client wrapper at `src/lib/auth-client.ts`. Auth context (`src/lib/contexts/auth-context.tsx`) exposes `{ user, session, loading }` client-side.

### Styling

Tailwind CSS v4. Retro/Windows 98 aesthetic. Custom CSS cursor sets in `src/lib/cursors.ts`. Wallpapers in `src/lib/wallpapers.ts`. Themes in `src/lib/themes.ts` applied via `useThemeApplication` hook.

#### Font pairs

Font pairs are defined in `src/lib/font-pairs.ts`. Each pair has a `scale` (optical size correction — e.g. Press Start 2P = `0.6`, VT323 = `1.0`). When the user changes their font pair in Settings → Affichage, `useThemeApplication` injects two CSS variables on `:root`:

- `--t-font-display` / `--t-font-body` — the font families
- `--t-font-scale` — the optical scale factor (a plain number, e.g. `0.6`)

#### Text size variables

**Never hardcode font sizes.** Use the semantic `--t-text-*` variables defined in `globals.css` — they bake in `--t-font-scale` automatically via `calc()`:

| Variable | Replaces |
| --- | --- |
| `--t-text-xs` | `0.75rem` / `text-xs` |
| `--t-text-sm` | `0.875rem` / `text-sm` |
| `--t-text-base` | `1rem` / `text-base` |
| `--t-text-md` | `1.15rem` |
| `--t-text-lg` | `1.35rem` / `text-lg` |
| `--t-text-xl` | `1.6rem` / `text-xl` |
| `--t-text-2xl` | `2rem` / `text-2xl` |
| `--t-text-3xl` | `2.5rem` / `text-3xl` |

```tsx
// Correct — scales with the active font pair
<div style={{ fontFamily: "var(--t-font-display)", fontSize: "var(--t-text-sm)" }}>

// Wrong — breaks when the user switches to Press Start 2P
<div className="text-sm" style={{ fontFamily: "var(--t-font-display)" }}>
```

For fluid/responsive sizes (boot screens, hero text), wrap `clamp()` with the scale:

```tsx
fontSize: "calc(clamp(12px, 1.6vw, 16px) * var(--t-font-scale))"
```

Fixed-size decorative elements (theme/wallpaper preview thumbnails that use `monospace` directly) are exempt — they intentionally ignore the font pair.

### Path aliases

`@/` maps to `src/` (configured in `tsconfig.json`).

---

## Cookbook — adding OS features to an app

### 1. UI sounds (click, beep, window events)

Use `useSoundContext()` — no setup needed.

```tsx
import { useSoundContext } from "@/lib/contexts/sound-context";

export function MyApp({ windowId }: AppProps) {
  const { playClick, playPop, playDelete, playVictory } = useSoundContext();
  return <button onClick={playClick}>Click me</button>;
}
```

Available one-shot sounds: `playClick` `playPop` `playBip` `playDelete` `playVictory` `playWindowOpen` `playWindowClose` `playWindowMinimize` `playModemDialup` `playStartupChime` `playBiosBleep`.

### 2. Background music (looping MP3)

Declare a named channel in the manifest. The window manager silences it automatically on close.

```ts
// manifest.ts
export const manifest: AppManifest = {
  slug: "my-app",
  audioChannels: ["my-app-music"], // auto-silenced on window close
  component: MyApp,
  // ...
};
```

```tsx
// index.tsx
import { useRef, useEffect } from "react";
import { getChannel } from "@/lib/audio/channel";
import { AudioPlayer } from "@/lib/audio/player";
import { useSoundContext } from "@/lib/contexts/sound-context";

export function MyApp({ windowId }: AppProps) {
  const { init } = useSoundContext();
  const playerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    init();
    const channel = getChannel("my-app-music");
    playerRef.current = new AudioPlayer(channel);
    playerRef.current.play("/sounds/my-music.mp3", { loop: true });
    return () => playerRef.current?.fadeOutAndStop(0.4);
  }, [init]);
}
```

Audio files go in `public/sounds/`. The engine caches decoded buffers, so replaying the same file has no network cost.

### 3. Persistent audio (survives window close, like Radio)

Set `persistAudio: true` in the manifest and manage playback via a shared context (see `src/lib/contexts/radio-context.tsx` as the reference implementation).

```ts
// manifest.ts
export const manifest: AppManifest = {
  persistAudio: true,
  // do NOT declare audioChannels — you manage cleanup yourself
};
```

### 4. Opening another app from your app

```tsx
import { useOpenApp } from "@/lib/hooks/use-open-app";

export function MyApp({ windowId }: AppProps) {
  const { openApp } = useOpenApp();
  return <button onClick={() => openApp("settings")}>Open Settings</button>;
}
```

`openApp(slug)` handles audio init, plays the window-open sound, and brings the window to focus if already open.

### 5. Accessing the current user

```tsx
import { useAuth } from "@/lib/contexts/auth-context";

export function MyApp({ windowId }: AppProps) {
  const { user, isPending } = useAuth();
  if (isPending) return <div>Chargement...</div>;
  if (!user) return <div>Non connecté</div>;
  return <div>Bonjour {user.name}</div>;
}
```

`user` is `null` when logged out. `isPending` is `true` during the initial session fetch.

### 6. Fetching data from the DB

All DB access is server-side. Add an API route in `src/app/api/my-app/route.ts`, then call it from the app component.

```ts
// src/app/api/my-app/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(myTable);
  return NextResponse.json(rows);
}
```

```tsx
// src/apps/my-app/index.tsx
const [data, setData] = useState([]);
useEffect(() => {
  fetch("/api/my-app").then(r => r.json()).then(setData);
}, []);
```

For authenticated routes, use `auth.api.getSession` from `better-auth` server-side to validate the session.

### 7. Retro styling conventions

All theme values are CSS variables on `:root`. Use them directly — never hardcode colors.

```tsx
// Correct
<div style={{ color: "var(--t-accent)", background: "var(--t-bg)" }}>

// Wrong
<div className="text-blue-500 bg-white">
```

Key variables: `--t-bg` `--t-app-bg` `--t-accent` `--t-text` `--t-text-muted` `--t-text-subtle` `--t-border-light` `--t-border-dark` `--t-titlebar-from` `--t-titlebar-to` `--t-inset-from` `--t-inset-to` `--t-card-hover` `--t-font-display`.

The Win98 inset border pattern (raised/sunken panels):

```tsx
// Raised panel
borderTopColor: "var(--t-border-light)", borderLeftColor: "var(--t-border-light)",
borderBottomColor: "var(--t-border-dark)", borderRightColor: "var(--t-border-dark)"

// Sunken / inset
borderTopColor: "var(--t-border-dark)", borderLeftColor: "var(--t-border-dark)",
borderBottomColor: "var(--t-border-light)", borderRightColor: "var(--t-border-light)"
```
