// index.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,  // Coloque a URL do Railway aqui
  ssl: {
    rejectUnauthorized: false
  }
});
console.log('Conectando no banco com:', process.env.DATABASE_URL);

app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.post('/login', (req, res) => {
  const { user, pass } = req.body;
  if (user === 'admin' && pass === '1234') {
    res.json({ success: true, message: 'Login OK!' });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;
  // console.log('Recebido:', { to, subject, text });
  // console.log('ENV:', {
  //   EMAIL_USER: process.env.EMAIL_USER,
  //   EMAIL_PASS: process.env.EMAIL_PASS,
  //   EMAIL_FROM: process.env.EMAIL_FROM,
  // });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
    res.json({ success: true, message: 'E-mail enviado!' });
  } catch (error) {
    console.error('Erro ao enviar:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail', error: error.message });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY criado_em DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar posts:', err);
    res.status(500).json({ success: false, message: 'Erro ao listar posts' });
  }
});

app.post('/posts', async (req, res) => {
  const { titulo, conteudo } = req.body;

  if (!titulo || !conteudo) {
    return res.status(400).json({ success: false, message: 'Título e conteúdo são obrigatórios.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO posts (titulo, conteudo) VALUES ($1, $2) RETURNING *',
      [titulo, conteudo]
    );
    res.json({ success: true, message: 'Post criado!', post: result.rows[0] });
  } catch (err) {
    console.error('Erro ao criar post:', err);
    res.status(500).json({ success: false, message: 'Erro ao criar post' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
console.log('Conectando no banco com:', process.env.DATABASE_URL);

