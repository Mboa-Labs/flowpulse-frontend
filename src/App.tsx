import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from "react-router-dom";
import type { Role } from "./api";
import { useAuth } from "./auth";
import Icon from "./components/Icon";
import Logo from "./components/Logo";
import Login from "./pages/Login";
import Placeholder from "./pages/Placeholder";
import { HOME, MENU, ROLE_LABEL } from "./routes";
import { applyTheme, loadTheme, type ThemeChoice } from "./theme";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeChoice>(loadTheme);
  useEffect(() => applyTheme(theme), [theme]);

  if (!user) return <Navigate to="/login" replace />;
  const items = MENU.filter((m) => m.roles.includes(user.role));
  const current = items.find((m) => location.pathname.startsWith(m.path));
  const nextTheme: Record<ThemeChoice, ThemeChoice> = { light: "dark", dark: "auto", auto: "light" };
  const themeLabel: Record<ThemeChoice, string> = { auto: "Thème : auto", light: "Thème : clair", dark: "Thème : sombre" };

  return (
    <div className="layout">
      {/* Téléphone et tablette : barre du haut avec menu du compte */}
      <header className="mobile-bar">
        <Logo onDark />
        <details className="menu">
          <summary aria-label="Menu du compte">
            <span className="avatar">{initials(user.nom)}</span>
          </summary>
          <div className="menu-panel">
            <div className="who-line">
              {user.nom}
              <small>{ROLE_LABEL[user.role]}</small>
            </div>
            <button type="button" onClick={() => setTheme(nextTheme[theme])}>{themeLabel[theme]}</button>
            <button type="button" onClick={logout}>Se déconnecter</button>
          </div>
        </details>
      </header>

      {/* Bureau : barre latérale */}
      <aside className="sidebar">
        <Logo onDark />
        <nav aria-label="Navigation principale">
          <span className="grp">Espace {ROLE_LABEL[user.role].toLowerCase()}</span>
          {items.map((m) => (
            <NavLink key={m.path} to={m.path}>
              <Icon name={m.icon} />
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <div className="who">
            <span className="avatar">{initials(user.nom)}</span>
            <div>
              {user.nom}
              <small>{ROLE_LABEL[user.role]}</small>
            </div>
          </div>
          <div className="actions">
            <button type="button" onClick={() => setTheme(nextTheme[theme])}>{themeLabel[theme]}</button>
            <button type="button" onClick={logout}>Se déconnecter</button>
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <h1>{current?.label ?? "FlowPulse"}</h1>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Téléphone et tablette : barre d'onglets à portée de pouce */}
      <nav className="tabbar" aria-label="Navigation principale">
        {items.map((m) => (
          <NavLink key={m.path} to={m.path}>
            <Icon name={m.icon} />
            {m.short ?? m.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Guard({ roles, children }: { roles: Role[]; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return roles.includes(user.role) ? children : <Navigate to={HOME[user.role]} replace />;
}

export default function App() {
  const { user, loading } = useAuth();
  useEffect(() => applyTheme(loadTheme()), []);
  if (loading) return <div className="center muted">Chargement…</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={HOME[user.role]} replace /> : <Login />} />
      <Route element={<Layout />}>
        {MENU.map((m) => (
          <Route
            key={m.path}
            path={m.path}
            element={
              <Guard roles={m.roles}>
                <Placeholder title={m.label} />
              </Guard>
            }
          />
        ))}
      </Route>
      <Route path="*" element={<Navigate to={user ? HOME[user.role] : "/login"} replace />} />
    </Routes>
  );
}
