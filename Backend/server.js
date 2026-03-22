const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get("users").find({ email, password }).value();
  if (user) {
    const token = btoa(`${user.email}:${Date.now()}`);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } else {
    res.status(401).json({ error: "Email ou senha inválidos" });
  }
});

server.use((req, res, next) => {
  if (req.path === "/login") return next();
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  next();
});

server.use(router);
server.listen(3001, () => console.log("✅ Backend rodando em http://localhost:3001"));