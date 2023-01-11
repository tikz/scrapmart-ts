import { logError, logMessage } from './logging.js'
import { Sequelize } from 'sequelize-typescript'
import { start } from './coto/entrypoint.js'
import { Market, Product, Price, Category, ProductCategory } from './models.js'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'db.sqlite3',
  logging: false,
  models: [Market, Product, Price, Category, ProductCategory]
})

const syncModels = async () => {
  await sequelize.sync()
}

syncModels().then(() => {
  logMessage('DB sync success')
  start().then(
    () => { },
    (e) => { logError(e) }
  )
}, (e) => { logError(e) })
