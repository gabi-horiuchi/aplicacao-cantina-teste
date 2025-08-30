// Dependências para autenticação e banco de dados
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

// Inicialização do banco de dados SQLite3
const db = new sqlite3.Database('./cantina.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite3.');
  }
});

// Criação da tabela de usuários, se não existir
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
)`);

// Configuração do body-parser
let express = require('express');
let app = express();
let ejs = require('ejs');
const haikus = require('./haikus.json');
const port = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('/login');
});

  // Rotas para login e cadastro
  app.get('/login', (req, res) => {
    res.render('login');
  });

  app.get('/cadastro', (req, res) => {
    res.render('cadastro');
  });

  // Rota para processar cadastro de usuário
  app.post('/cadastro', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.send('Preencha todos os campos!');
    }
    // Hash da senha
    const hash = bcrypt.hashSync(senha, 10);
    db.run('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.send('Email já cadastrado!');
        }
        return res.send('Erro ao cadastrar usuário.');
      }
      res.send('Usuário cadastrado com sucesso! <a href="/login">Faça login</a>');
    });
  });

  // Rota para processar login
  app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.send('Preencha todos os campos!');
    }
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
      if (err) return res.send('Erro ao buscar usuário.');
      if (!user) return res.send('Usuário não encontrado!');
      if (!bcrypt.compareSync(senha, user.senha)) {
        return res.send('Senha incorreta!');
      }
      res.send('Login realizado com sucesso!');
    });
  });

app.listen(port);