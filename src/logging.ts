import chalk, { ChalkInstance } from 'chalk'

import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration.js'
import { Product } from './models.js'
dayjs.extend(duration)

interface Progress {
  products: number
  totalProducts: number
}

const now = () =>
  dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss')

const formatProduct = (product: Product) =>
  `${chalk.gray(product.ean)} ${chalk.bold(product.name)}`

const logTemplate = (message: string, colorFunc: ChalkInstance, market?: string) => {
  market !== undefined
    ? console.log(`${now()} ${formatMarket(market)} ${colorFunc(message)}`)
    : console.log(`${now()} ${colorFunc(message)}`)
}

export const logMessage = (message: string, market?: string) => {
  logTemplate(message, chalk.yellow, market)
}

export const logError = (message: any, market?: string) => {
  logTemplate(chalk.bold(message), chalk.red, market)
}

export const logStatus = (message: string, market?: string) => {
  logTemplate(message, chalk.cyan, market)
}

export const logProduct = (product: Product, market: string) => {
  console.log(`${now()} ${formatMarket(market)} ${formatProduct(product)}`)
}

const formatMarket = (market: string) => {
  switch (market) {
    case 'Coto':
      return chalk.red('[Coto]')
    case 'Carrefour':
      return chalk.blue('[Carrefour]')
    default:
      return chalk.gray(`[${market}]`)
  }
}

export const statusReport = (progress: Progress, market: string) => {
  let lastProducts = 0
  const interval = 10000

  return setInterval(() => {
    const perSecond = (progress.products - lastProducts) / (interval / 1000)
    const remaining = dayjs.duration((progress.totalProducts - progress.products) / perSecond, 'seconds').format('HH:mm:ss')
    logStatus(`progress: ${progress.products}/${progress.totalProducts} (${(progress.products / progress.totalProducts * 100).toFixed(2)}%) | ${perSecond}/sec | remaining: ${remaining}`, market)
    lastProducts = progress.products
  }, interval)
}
