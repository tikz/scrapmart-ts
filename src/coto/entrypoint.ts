import puppeteer, { ElementHandle, Page } from 'puppeteer'
import { scrapProduct } from './product.js'
import { PromisePool } from '@supercharge/promise-pool'
import { logMessage, statusReport } from '../logging.js'
import { elementText, extractFromElement } from '../parse.js'
import { Market } from '../models.js'

export const marketName: string = 'Coto'
export const baseUrl: string = 'https://www.cotodigital3.com.ar'

const extractProductLinks = async (page: Page): Promise<string[]> => {
  const selector = 'div.product_info_container > a'
  const links = await page.evaluate((linkSelector) => {
    const links = Array.from(document.querySelectorAll(linkSelector))
    return links.map((link) => link.getAttribute('href'))
  }, selector)

  return links.filter((link): link is string => typeof link === 'string')
}

const extractTotalProducts = async (page: Page): Promise<number> => {
  const text = await extractFromElement(page, 'span#resultsCount', elementText)
  return Number(text)
}

export const start = async (): Promise<void> => {
  const [market] = await Market.findOrCreate({ where: { name: marketName }, defaults: { name: marketName } })

  logMessage('launching browser...', marketName)
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  page.setDefaultNavigationTimeout(0)
  logMessage('browser launched', marketName)

  logMessage('loading entrypoint page...', marketName)
  await page.goto(`${baseUrl}/sitios/cdigi/browse`)
  logMessage('page loaded', marketName)

  const totalProducts = await extractTotalProducts(page)

  const progress = { products: 0, totalProducts }
  const statusReportInterval = statusReport(progress, marketName)

  for (let hasNextButton = true; hasNextButton;) {
    await page.waitForSelector('div.footer')

    const productLinks = await extractProductLinks(page)
    logMessage(`extracted ${productLinks.length} product links`, marketName)

    await PromisePool
      .for(productLinks)
      .withConcurrency(5)
      .process(async link => {
        await scrapProduct(browser, `${baseUrl}${link}`, market)
        progress.products++
      })

    try {
      const nextButton = (await page.$x('//ul[@id="atg_store_pagination"]/li/a[contains(text(), "Sig")]'))[0] as ElementHandle
      logMessage('next page...', marketName)
      await nextButton.click()
    } catch (e) {
      hasNextButton = false
      logMessage('finished!', marketName)
    }
  }

  clearInterval(statusReportInterval)
  await browser.close()
}
