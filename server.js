const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
  host:     process.env.MYSQLHOST     || 'localhost',
  user:     process.env.MYSQLUSER     || 'root',
  password: process.env.MYSQLPASSWORD || 'root',
  database: process.env.MYSQLDATABASE || 'demandas_db',
  port:     process.env.MYSQLPORT     || 3306
});

db.connect(err => {
  if (err) { console.error('Erro ao conectar no MySQL:', err); return; }
  console.log('✅ MySQL conectado!');
});

// GET — buscar todas as demandas
app.get('/demandas', (req, res) => {
  db.query('SELECT * FROM demandas ORDER BY id ASC', (err, results) => {
    if (err) return res.status(500).json({ erro: err });
    res.json(results);
  });
});

// POST — inserir nova demanda
app.post('/demandas', (req, res) => {
  const { filial, tipo, situacao, empresa, cliente, vendedor, endereco, contato, obs, data, hora, produtos } = req.body;
  const sql = `INSERT INTO demandas (filial, tipo, situacao, empresa, cliente, vendedor, endereco, contato, obs, data, hora, produtos)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [filial, tipo, situacao, empresa, cliente, vendedor, endereco, contato, obs, data, hora, produtos], (err, result) => {
    if (err) {
      console.error('Erro ao inserir:', err.message);
      return res.status(500).json({ erro: err });
    }
    res.json({ sucesso: true, id: result.insertId });
  });
});

// PUT — atualizar demanda
app.put('/demandas/:id', (req, res) => {
  const { filial, tipo, situacao, empresa, cliente, vendedor, endereco, contato, obs, data, hora, produtos } = req.body;

  if (situacao && !cliente) {
    db.query('UPDATE demandas SET situacao = ? WHERE id = ?', [situacao, req.params.id], (err) => {
      if (err) return res.status(500).json({ erro: err });
      res.json({ sucesso: true });
    });
    return;
  }

  const sql = `UPDATE demandas SET filial=?, tipo=?, situacao=?, empresa=?, cliente=?, vendedor=?,
               endereco=?, contato=?, obs=?, produtos=? WHERE id=?`;
  db.query(sql, [filial, tipo, situacao, empresa, cliente, vendedor, endereco, contato, obs, produtos, req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ sucesso: true });
  });
});

// DELETE — excluir demanda
app.delete('/demandas/:id', (req, res) => {
  db.query('DELETE FROM demandas WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ erro: err });
    res.json({ sucesso: true });
  });
});

app.listen(process.env.PORT || 3000, () => console.log('🚀 Servidor rodando!'));
