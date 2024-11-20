module.exports = {
  development: {
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', // banco inicial para criar o e_comerce
    password: 'Pa$sW0rd',
    port: 5432,
  },
  e_commerce: {
    user: 'postgres',
    host: 'localhost',
    database: 'e_comerce', // configuração após criar o banco
    password: 'Pa$sW0rd',
    port: 5432,
  }
}; 