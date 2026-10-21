import { Navigate, NavLink, Outlet, Route, Routes } from "react-router-dom";
import type { Role } from "./api";
import { useAuth } from "./auth";
import Login from "./pages/Login";
import Placeholder from "./pages/Placeholder";
import { HOME } from "./routes";

const MENU: { path: string; label: string; roles: Role[] }[] = [
  { path: "/dashboard", label: "Tableau de bord", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/alertes", label: "Alertes", roles: ["GESTIONNAIRE", "OPERATEUR"] },
  { path: "/flotte", label: "Flotte", roles: ["OPERATEUR"] },
  { path: "/simulation", label: "Simulation", roles: ["URBANISTE"] },
  { path: "/manques", label: "Manques réglementaires", roles: ["GESTIONNAIRE", "URBANISTE", "ADMIN"] },
  { path: "/assistant", label: "Superviseur IA", roles: ["GESTIONNAIRE", "OPERATEUR", "URBANISTE"] },
  { path: "/admin", label: "Administration", roles: ["ADMIN"] },
];

function Layout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">FlowPulse</div>
        <nav>
          {MENU.filter((m) => m.roles.includes(user.role)).map((m) => (
            <NavLink key={m.path} to={m.path}>
              {m.label}
            </NavLink>
          ))}
        </nav>
        <div className="me">
          <div>{user.nom}</div>
          <div className="muted">{user.role}</div>
          <button onClick={logout}>Se déconnecter</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
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
