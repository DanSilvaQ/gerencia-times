import { useState, Suspense, use, Component } from "react";

const BASE = "http://localhost:3001";
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// Avatar por posição
const AVATAR = {
  "Goleiro": "🧤",
  "Lateral Direito": "➡️",
  "Lateral Esquerdo": "⬅️",
  "Zagueiro": "🛡️",
  "Volante": "⚙️",
  "Meia": "🎯",
  "Atacante": "⚡",
};

// ── API ───────────────────────────────────────────────────────────────────────
async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

function getJogadores() {
  return fetch(`${BASE}/jogadores`, { headers: authHeaders() }).then((r) => {
    if (!r.ok) throw new Error("Erro ao buscar jogadores");
    return r.json();
  });
}

async function apiCriar(dados) {
  const res = await fetch(`${BASE}/jogadores`, {
    method: "POST", headers: authHeaders(), body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Erro ao criar");
  return res.json();
}

async function apiAtualizar(id, dados) {
  const res = await fetch(`${BASE}/jogadores/${id}`, {
    method: "PUT", headers: authHeaders(), body: JSON.stringify(dados),
  });
  if (!res.ok) throw new Error("Erro ao atualizar");
  return res.json();
}

async function apiDeletar(id) {
  const res = await fetch(`${BASE}/jogadores/${id}`, {
    method: "DELETE", headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Erro ao deletar");
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@futebol.com");
  const [senha, setSenha] = useState("123456");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro(""); setLoading(true);
    try {
      const data = await apiLogin(email, senha);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>⚽ GerenciaTimes</h1>
        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>
          Gerencie jogadores e times de futebol
        </p>
        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        <label>Senha</label>
        <input value={senha} onChange={(e) => setSenha(e.target.value)} type="password" />
        {erro && <div className="erro">{erro}</div>}
        <button className="btn btn-primary btn-full" onClick={entrar} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

// ── MODAL FORM ────────────────────────────────────────────────────────────────
const POSICOES = ["Goleiro", "Lateral Direito", "Lateral Esquerdo", "Zagueiro", "Volante", "Meia", "Atacante"];
const TIMES = ["Flamengo", "Palmeiras", "Corinthians", "São Paulo", "Grêmio", "Cruzeiro", "Atlético-MG", "Santos", "Outro"];

function ModalForm({ jogador, onSalvar, onFechar, loading }) {
  const [form, setForm] = useState(
    jogador ?? { nome: "", posicao: "Goleiro", camisa: "", time: "Flamengo", status: "Titular" }
  );

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function salvar(e) {
    e.preventDefault();
    onSalvar({ ...form, camisa: Number(form.camisa) });
  }

  return (
    <div className="overlay">
      <div className="modal">
        {/* Preview do avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" }}>
          <div className="avatar" style={{ width: 48, height: 48, fontSize: "1.8rem" }}>
            {AVATAR[form.posicao] || "⚽"}
          </div>
          <h3 style={{ margin: 0 }}>{jogador ? "✏️ Editar Jogador" : "➕ Novo Jogador"}</h3>
        </div>

        <label>Nome do Jogador</label>
        <input name="nome" value={form.nome} onChange={set} placeholder="Ex: Ronaldo" />

        <label>Posição</label>
        <select name="posicao" value={form.posicao} onChange={set}>
          {POSICOES.map((p) => <option key={p}>{p}</option>)}
        </select>

        <label>Número da Camisa</label>
        <input name="camisa" type="number" min="1" max="99" value={form.camisa} onChange={set} placeholder="Ex: 10" />

        <label>Time</label>
        <select name="time" value={form.time} onChange={set}>
          {TIMES.map((t) => <option key={t}>{t}</option>)}
        </select>

        <label>Status</label>
        <select name="status" value={form.status} onChange={set}>
          <option>Titular</option>
          <option>Reserva</option>
        </select>

        <div className="modal-btns">
          <button className="btn btn-secondary" onClick={onFechar}>Cancelar</button>
          <button className="btn btn-primary" onClick={salvar} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LISTA (hook use do React 19) ──────────────────────────────────────────────
function Lista({ promise, onRefresh, filtroTime, busca }) {
  const jogadores = use(promise);

  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleEditar(dados) {
    setLoadingAcao(true);
    try {
      await apiAtualizar(editando.id, dados);
      showToast("✅ Jogador atualizado!");
      setEditando(null);
      onRefresh();
    } catch { showToast("❌ Erro ao atualizar."); }
    finally { setLoadingAcao(false); }
  }

  async function handleDeletar(id) {
    setLoadingAcao(true);
    try {
      await apiDeletar(id);
      showToast("🗑️ Jogador removido!");
      setExcluindo(null);
      onRefresh();
    } catch { showToast("❌ Erro ao remover."); }
    finally { setLoadingAcao(false); }
  }

  // Filtro por time + busca por nome
  const filtrados = jogadores
    .filter((j) => filtroTime === "Todos" || j.time === filtroTime)
    .filter((j) => j.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <>
      {toast && <div className="toast">{toast}</div>}

      {filtrados.length === 0 ? (
        <div className="vazio">
          <p style={{ fontSize: "2rem" }}>🔍</p>
          <p style={{ marginTop: "8px" }}>Nenhum jogador encontrado.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Jogador</th>
              <th>Posição</th>
              <th>Time</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((j) => (
              <tr key={j.id}>
                <td><span className="camisa">{j.camisa}</span></td>
                <td>
                  <div className="jogador-info">
                    <div className="avatar">{AVATAR[j.posicao] || "⚽"}</div>
                    <strong>{j.nome}</strong>
                  </div>
                </td>
                <td>{j.posicao}</td>
                <td><span className="badge badge-time">{j.time}</span></td>
                <td>
                  <span className={`badge ${j.status === "Titular" ? "badge-titular" : "badge-reserva"}`}>
                    {j.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn btn-secondary" onClick={() => setEditando(j)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => setExcluindo(j)}>Remover</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editando && (
        <ModalForm jogador={editando} onSalvar={handleEditar} onFechar={() => setEditando(null)} loading={loadingAcao} />
      )}

      {excluindo && (
        <div className="overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div className="avatar" style={{ width: 52, height: 52, fontSize: "2rem", margin: "0 auto 8px" }}>
              {AVATAR[excluindo.posicao] || "⚽"}
            </div>
            <h3 style={{ margin: "0.5rem 0" }}>Remover jogador?</h3>
            <p style={{ color: "#666", fontSize: "0.9rem" }}>
              <strong>{excluindo.nome}</strong> será removido do sistema.
            </p>
            <div className="modal-btns">
              <button className="btn btn-secondary" onClick={() => setExcluindo(null)}>Cancelar</button>
              <button className="btn btn-primary" style={{ background: "#dc2626" }}
                onClick={() => handleDeletar(excluindo.id)} disabled={loadingAcao}>
                {loadingAcao ? "Removendo..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError)
      return <p style={{ color: "red", textAlign: "center", marginTop: "2rem" }}>⚠️ Erro ao carregar. O backend está rodando?</p>;
    return this.props.children;
  }
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────────
const TIMES_FILTRO = ["Todos", "Flamengo", "Palmeiras", "Corinthians", "São Paulo", "Grêmio", "Cruzeiro", "Atlético-MG", "Santos", "Outro"];

export default function App() {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  });
  const [promise, setPromise] = useState(() => getJogadores());
  const [mostrarForm, setMostrarForm] = useState(false);
  const [loadingCriar, setLoadingCriar] = useState(false);
  const [toast, setToast] = useState("");
  const [filtroTime, setFiltroTime] = useState("Todos");
  const [busca, setBusca] = useState("");

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function refresh() { setPromise(getJogadores()); }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  async function handleCriar(dados) {
    setLoadingCriar(true);
    try {
      await apiCriar(dados);
      showToast("✅ Jogador adicionado!");
      setMostrarForm(false);
      refresh();
    } catch { showToast("❌ Erro ao adicionar jogador."); }
    finally { setLoadingCriar(false); }
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div>
      <nav className="navbar">
        <span>⚽ GerenciaTimes</span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.85rem", opacity: 0.85 }}>Olá, {user.name}</span>
          <button className="btn btn-secondary" onClick={logout}>Sair</button>
        </div>
      </nav>

      <div className="main">
        <div className="row">
          <h2>Jogadores</h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-secondary" onClick={refresh}>🔄 Atualizar</button>
            <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>+ Adicionar Jogador</button>
          </div>
        </div>

        {/* Busca por nome */}
        <div className="busca-wrap">
          <input
            type="text"
            placeholder="Buscar jogador pelo nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Filtro por time */}
        <div className="filtro">
          {TIMES_FILTRO.map((t) => (
            <button
              key={t}
              className={`filtro-btn ${filtroTime === t ? "ativo" : ""}`}
              onClick={() => setFiltroTime(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <Suspense fallback={<p style={{ textAlign: "center", marginTop: "2rem", color: "#999" }}>Carregando jogadores...</p>}>
          <ErrorBoundary>
            <Lista promise={promise} onRefresh={refresh} filtroTime={filtroTime} busca={busca} />
          </ErrorBoundary>
        </Suspense>
      </div>

      {mostrarForm && (
        <ModalForm onSalvar={handleCriar} onFechar={() => setMostrarForm(false)} loading={loadingCriar} />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}