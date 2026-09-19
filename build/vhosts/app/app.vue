<template>
  <div class="shell">
    <header class="top">
      <NuxtLink to="/" class="brand">vhosts</NuxtLink>
      <nav>
        <NuxtLink to="/">Sites</NuxtLink>
        <NuxtLink to="/sites/new">New site</NuxtLink>
      </nav>
    </header>
    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
:root {
  --bg: #f6f4ef;
  --ink: #1c1917;
  --muted: #78716c;
  --line: #e7e5e4;
  --accent: #0f766e;
  --card: #fffcf7;
  --danger: #b91c1c;
  --font: "IBM Plex Sans", "Segoe UI", system-ui, sans-serif;
  --mono: "IBM Plex Mono", ui-monospace, monospace;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: var(--font);
  background:
    radial-gradient(1200px 500px at 10% -10%, #d9f3ef 0%, transparent 55%),
    radial-gradient(900px 400px at 100% 0%, #f5e6d3 0%, transparent 50%),
    var(--bg);
  color: var(--ink);
  min-height: 100vh;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.shell { max-width: 960px; margin: 0 auto; padding: 1.5rem; }

.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--line);
}

.brand {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--ink);
  text-decoration: none;
}

.top nav { display: flex; gap: 1rem; }

main { min-height: 50vh; }

h1 { font-size: 1.75rem; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
.lede { color: var(--muted); margin: 0 0 1.5rem; }

.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 1.25rem;
}

table { width: 100%; border-collapse: collapse; }
th, td {
  text-align: left;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
  font-size: 0.95rem;
}
th { color: var(--muted); font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
code, .mono { font-family: var(--mono); font-size: 0.85em; }

label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.35rem;
}

input[type="text"], textarea {
  width: 100%;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 8px;
  font: inherit;
  background: #fff;
  margin-bottom: 1rem;
}

.checks { display: flex; flex-wrap: wrap; gap: 1rem; margin: 0.5rem 0 1.25rem; }
.checks label { display: flex; align-items: center; gap: 0.4rem; font-weight: 500; margin: 0; }

.row-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; }

button, .btn {
  appearance: none;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--ink);
  border-radius: 8px;
  padding: 0.5rem 0.9rem;
  font: inherit;
  cursor: pointer;
}
button.primary, .btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
button.danger { color: var(--danger); border-color: #fecaca; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--danger);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.empty { color: var(--muted); padding: 1.5rem 0; }

.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.badge.off { background: #f5f5f4; color: var(--muted); border-color: var(--line); }
</style>
