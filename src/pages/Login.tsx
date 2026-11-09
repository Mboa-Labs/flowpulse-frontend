import { useState, type FormEvent } from "react";
import { BoutonLangue } from "../components/BoutonLangue";
import { Link, useNavigate } from "react-router-dom";
import vueAerienne from "../assets/yaounde-vue-aerienne.jpg";
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
  const [showPassword, setShowPassword] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const user = await login(email, password);
      navigate(HOME[user.role], { replace: true });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(
        status === 401 || status === 400
          ? "Email ou mot de passe incorrect. Vérifiez-les ou contactez votre administrateur."
          : "Le serveur ne répond pas. Vérifiez que le backend est démarré, puis réessayez.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login">
      <aside className="login-side">
        <Link to="/" aria-label="Retour à l'accueil">
          <Logo onDark />
        </Link>
        <div>
          <h2>La ville en mouvement, décision par décision.</h2>
          <p>Supervision du trafic, alertes anticipées et réaffectation des bus, avec la justification de chaque recommandation.</p>
        </div>
        <figure>
          <img src={vueAerienne} alt="Vue aérienne de Yaoundé, quartiers et collines" />
          <figcaption>Yaoundé vue du ciel · Photo Pexels</figcaption>
        </figure>
      </aside>
      <div className="login-form">
        <BoutonLangue className="btn btn-ghost btn-sm login-langue" />
        <form onSubmit={submit}>
          <Link to="/" className="login-home" aria-label="Retour à l'accueil">
            <Logo />
          </Link>
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
            <div className="password">
              <input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={showPassword}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="M4 4l16 16" />}
                </svg>
              </button>
            </div>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? "Connexion…" : "Se connecter"}
          </button>
          <p className="small muted">Déconnexion automatique après 30 minutes d'inactivité.</p>
          <Link to="/" className="small">← Retour à l'accueil</Link>
        </form>
      </div>
    </div>
  );
}
