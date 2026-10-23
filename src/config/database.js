module.exports = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PWS,
  database: process.env.DB_DATABASE,
  logging: false,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: true,
    freezeTableName: true,
    timezone: '-03:00',
    dialectOptions: {
      options: {
        useUTC: false
      }
    }
  },
};