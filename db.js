const {
    Sequelize
} = require('sequelize');

module.exports = new Sequelize(

    process.env.DB_NAME, //name of db
    process.env.DB_USER, //Name user
    process.env.DB_PASSWORD, //user pass

    {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: true // или true, в зависимости от конфигурации вашего сервера
            },
            options: {
                connectTimeout: 60000, // Увеличьте таймаут соединения (в миллисекундах)
              },
        },
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
    }

);