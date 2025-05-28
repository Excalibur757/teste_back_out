// index.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

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

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text });
    res.json({ success: true, message: 'E-mail enviado!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


