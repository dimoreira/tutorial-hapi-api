// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: 'mysql://root:@192.168.33.10:3306/livecoding',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
