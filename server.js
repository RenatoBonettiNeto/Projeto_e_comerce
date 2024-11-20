const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const dbConfig = require('./config/database');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const port = 3000;
const cors = require('cors');


app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));



// Inicialmente conecta ao postgres
let pool = new Pool(dbConfig.development);

pool.connect((err, client, release) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err);
    }
    console.log('Conectado ao banco de dados com sucesso');
    release();
});


require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

app.use(session({
    secret: process.env.SESSION_SECRET, // Usa a variável de ambiente
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
    // Use true em produção com HTTPS
}));

console.log('Secret da sessão:', process.env.SESSION_SECRET);

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  // Permitir acesso às rotas de login e registro apenas se não estiver autenticado
  if (req.path === '/login' || req.path === '/register') {
      if (req.session.userId) {
          return res.redirect('/home_page/'); // Redireciona se já estiver autenticado
      }
      return next(); // Permite acesso se não estiver autenticado
  }
  
  // Para outras rotas, verifica se o usuário está autenticado
  if (!req.session.userId) {
      return res.status(401).json({ 
          success: false, 
          message: 'Não autorizado' 
      });
  }
  next();
};

// Rota para verificar autenticação
app.get('/check-auth', (req, res) => {
  if (req.session.userId) {
      res.json({ 
          authenticated: true, 
          username: req.session.username 
      });
  } else {
      res.json({ authenticated: false });
  }
});

// Rota para a home_page com verificação de autenticação
app.get('/home_page/', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home_page', 'index.html'));
});

// Rota para endereços com verificação de autenticação
app.get('/addresses', authMiddleware, async (req, res) => {
    console.log('Rota /addresses foi chamada');
    try {
        console.log('Buscando endereços para o usuário:', req.session.userId);

        const result = await pool.query(
            'SELECT * FROM address WHERE user_id = $1 ORDER BY id DESC',
            [req.session.userId]
        );

        console.log('Resultados da consulta:', result.rows);

        res.json({
            success: true,
            addresses: result.rows
        });
        console.log('Resposta enviada com sucesso');
    } catch (err) {
        console.error('Erro ao buscar endereços:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar endereços'
        });
    }
});

app.get('/change-password', authMiddleware, async (req, res) => {
  console.log('Rota /change-password chamada');
});

// ... outras rotas que precisam de autenticação ...

(async () => {
    const fetch = (await import('node-fetch')).default;

fetch('http://localhost:3000/check-auth')
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            // O usuário está autenticado, pode acessar a página
        } else {
            // O usuário não está autenticado, redirecionar para a página de login
            window.location.href = '/login';
        }
    })
    .catch(error => {
        console.error('Erro ao verificar autenticação:', error);
    });

})();

async function initializeDatabase() {
  try {
    // Verifica se o banco e_comerce existe
    const dbResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'e_comerce'"
    );

    // Se o banco não existe, cria
    if (dbResult.rows.length === 0) {
      await pool.query('CREATE DATABASE e_comerce');
      console.log('Banco de dados e_comerce criado com sucesso!');
    }

    // Fecha a conexão com postgres e conecta ao e_comerce
    await pool.end();
    pool = new Pool(dbConfig.e_commerce);

    // Lê e executa o arquivo schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Divide o arquivo SQL em comandos individuais e executa cada um
    const commands = schemaSql
      .split(';')
      .filter(cmd => cmd.trim())
      .map(cmd => cmd.trim() + ';');

    for (const command of commands) {
      await pool.query(command);
    }
    
    console.log('Estrutura do banco de dados verificada/Criada com sucesso');

  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  }
}

async function startServer() {
  await initializeDatabase();
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(express.static('public'));
  app.use('/css', express.static('public/css'));
  app.use('/js', express.static('public/js'));
  app.use('/address', express.static(path.join(__dirname, 'public/address')));
  app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
  app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
 

  app.use(authMiddleware);

  app.post('/register', async (req, res) => {
    const { email, name, number, username, password } = req.body;
  
    try {
      // Validações de senha
      if (/\s/.test(password)) {
        return res.status(400).json({
          success: false,
          message: 'A senha não pode conter espaços em branco.'
        });
      }
  
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres.'
        });
      }
  
      // Verificar se o email já existe
      const emailCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
  
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está cadastrado. Por favor, use outro email.'
        });
      }
  
      // Verificar se o username já existe
      const usernameCheck = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
  
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este nome de usuário já está em uso. Por favor, escolha outro.'
        });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await pool.query(
        'INSERT INTO users (email, name, number, username, password) VALUES ($1, $2, $3, $4, $5)',
        [email, name, number, username, hashedPassword]
      );
  
      res.status(200).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        redirect: '../login'
      });
  
    } catch (err) {
      console.error(err);
      
      if (err.code === '23505') {
        if (err.constraint === 'users_email_key') {
          return res.status(400).json({
            success: false,
            message: 'Este email já está cadastrado. Por favor, use outro email.'
          });
        }
        if (err.constraint === 'users_username_key') {
          return res.status(400).json({
            success: false,
            message: 'Este nome de usuário já está em uso. Por favor, escolha outro.'
          });
        }
      }
  
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar usuário. Tente novamente.'
      });
    }
  });
  
  // Atualizar a rota de login para usar session
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id; // Armazena o ID do usuário na sessão
            req.session.username = user.username; // Armazena o nome do usuário na sessão
            console.log('Usuário logado:', req.session); // Adicione este log
            return res.json({ success: true, message: 'Login bem-sucedido!', redirect: '/home_page/' });
        } else {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ success: false, message: 'Erro ao fazer login.' });
    }
});

  // Rota de logout
  app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
  });

  // Rotas de endereço (todas protegidas pelo middleware de autenticação)
  app.get('/addresses', authMiddleware, async (req, res) => {
    console.log('Rota /addresses foi chamada');
    try {
        console.log('Buscando endereços para o usuário:', req.session.userId);

        const result = await pool.query(
            'SELECT * FROM address WHERE user_id = $1 ORDER BY id DESC',
            [req.session.userId]
        );

        console.log('Resultados da consulta:', result.rows);

        res.json({
            success: true,
            addresses: result.rows
        });
        console.log('Resposta enviada com sucesso');
    } catch (err) {
        console.error('Erro ao buscar endereços:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar endereços'
        });
    }
    console.log('Rota /addresses foi respondida');
});

  app.get('/address/:id', authMiddleware, async (req, res) => {
    try {
      // Convertendo req.params.id para um número inteiro
      const addressId = parseInt(req.params.id, 10);
      
      const result = await pool.query(
        'SELECT * FROM address WHERE id = $1 AND user_id = $2',
        [addressId, req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Endereço não encontrado'
        });
      }

      res.json({
        success: true,
        address: result.rows[0]
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar endereço'
      });
    }
  });

  app.post('/address', authMiddleware, async (req, res) => {
    try {
        const {
            recipient_name,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code
        } = req.body;

        // Verifica se o número é um inteiro
        if (!Number.isInteger(Number(number))) {
            return res.status(400).json({
                success: false,
                message: 'O número do endereço deve ser um número inteiro.'
            });
        }

        

        await pool.query(
            `INSERT INTO address 
            (recipient_name, street, number, complement, neighborhood, city, state, postal_code, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [recipient_name, street, number, complement, neighborhood, city, state, postal_code, req.session.userId]
        );

        res.json({ 
            success: true, 
            message: 'Endereço cadastrado com sucesso!' 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao cadastrar endereço' 
        });
    }
  });

  app.put('/address/:id', authMiddleware, async (req, res) => {
    try {
        const {
            recipient_name,
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
            postal_code
        } = req.body;

        const result = await pool.query(
            `UPDATE address 
            SET recipient_name = $1, street = $2, number = $3, complement = $4,
                neighborhood = $5, city = $6, state = $7, postal_code = $8
            WHERE id = $9 AND user_id = $10
            RETURNING *`,
            [recipient_name, street, number, complement, neighborhood, city, 
             state, postal_code, req.params.id, req.session.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Endereço não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Endereço atualizado com sucesso!'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar endereço'
        });
    }
  });

  app.delete('/address/:id', authMiddleware, async (req, res) => {
    try {
      const result = await pool.query(
        'DELETE FROM address WHERE id = $1 AND user_id = $2 RETURNING *',
        [req.params.id, req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Endereço não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Endereço excluído com sucesso!'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir endereço'
      });
    }
  });

  app.get('/address', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'address', 'index.html'));
  });

  app.get('/home_page/', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home_page', 'index.html'));
  });

  const timeout = require('connect-timeout');
  app.use(timeout('10s')); // Timeout de 10 segundos
  
  app.use((req, res, next) => {
      if (!req.timedout) next();
  });
  
  app.delete('/delete-user', authMiddleware, async (req, res) => {
    try {
        const userId = req.session.userId;
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        // Destruir a sessão após excluir o usuário
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao destruir a sessão após excluir usuário'
                });
            }

            res.clearCookie('connect.sid'); // Substitua pelo nome do seu cookie de sessão, se diferente
            res.json({
                success: true,
                message: 'Usuário excluído com sucesso'
            });
        });
    } catch (err) {
        console.error('Erro ao excluir usuário:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir usuário'
        });
    }
});



// Rota para alterar a senha
app.post('/change-password', authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    // Validações de senha
    if (/\s/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha não pode conter espaços em branco.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'A nova senha deve ter pelo menos 8 caracteres.'
      });
    }

    // Busca o usuário no banco de dados
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.session.userId]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }

    // Verifica se a senha antiga está correta
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Senha antiga incorreta.' });
    }

    // Verifica se a nova senha é diferente da antiga
    if (oldPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'A nova senha não pode ser a mesma que a senha antiga.' });
    }

    // Criptografa a nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha no banco de dados
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedNewPassword, user.id]);

    return res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    res.status(500).json({ success: false, message: 'Erro ao alterar a senha.' });
  }
});

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}/login`);
  });
}

startServer();
