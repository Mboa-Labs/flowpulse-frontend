import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import arretBus from "../assets/arret-bus-yaounde.jpg";
import Logo from "../components/Logo";
import { useAuth } from "../auth";
import { HOME } from "../routes";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const user = await login(email, password);
      navigate(HOME[user.role], { replace: true });
    } catch {
      setError("Email ou mot de passe incorrect. Vérifiez-les ou contactez votre administrateur.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login">
      <aside className="login-side">
        <Logo onDark />
        <div>
          <h2>La ville en mouvement, décision par décision.</h2>
          <p>Supervision du trafic, alertes anticipées et réaffectation des bus, avec la justification de chaque recommandation.</p>
        </div>
        <figure>
          <img src={arretBus} alt="Arrêt de bus dans le centre de Yaoundé" />
          <figcaption>Arrêt de bus, centre de Yaoundé · Photo Tontonjer, CC BY-SA 4.0</figcaption>
        </figure>
      </aside>
      <div className="login-form">
        <form onSubmit={submit}>
          <Logo />
          <div style={{ display: "grid", gap: 6 }}>
            <h1>Se connecter</h1>
            <p className="muted">Utilisez le compte fourni par votre administrateur.</p>
          </div>
          <div className="field">
            <label htmlFor="email">Email professionnel</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="password">Mot de passe</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </button>
          <p className="small muted">Déconnexion automatique après 30 minutes d'inactivité.</p>
        </form>
      </div>
    </div>
  );
}
