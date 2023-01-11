import { Browser, Page } from 'puppeteer'
import { elementAttrSrc, elementsText, elementText, extractFromElement, extractFromElements, parseNumber } from '../parse.js'
import { logError } from '../logging.js'
import { marketName } from './entrypoint.js'
import { Market, store } from '../models.js'

const extractName = async (page: Page): Promise<string | null> =>
  await extractFromElement(page, 'h1.product_page', elementText)

const extractPrice = async (page: Page): Promise<number> => {
  const text1 = await extractFromElement(page, 'span.atg_store_newPrice', elementText)
  const text2 = await extractFromElement(page, 'span.price_regular_precio', elementText)
  return text1 !== null ? parseNumber(text1) : parseNumber(text2)
}

const extractDiscountPrice = async (page: Page): Promise<number> =>
  parseNumber(await extractFromElement(page, 'span.price_discount', elementText))

const extractDiscountDetails = async (page: Page): Promise<string | null> =>
  await extractFromElement(page, 'span.text_price_discount', elementText)

const extractEAN = async (page: Page): Promise<number> =>
  parseNumber(await extractFromElement(page, 'div#brandText > span:last-child', elementText))

const extractImageURL = async (page: Page): Promise<string | null> =>
  await extractFromElement(page, 'img.zoomImg', elementAttrSrc)

const extractCategories = async (page: Page): Promise<string[]> => {
  const categories = await extractFromElements(page, 'div#atg_store_breadcrumbs > a', elementsText)
  return categories.map((category) => category.replace('> ', '').trim()).slice(1)
}

export const scrapProduct = async (browser: Browser, url: string, market: Market): Promise<void> => {
  const page = await browser.newPage()

  try {
    await page.goto(url)
    await page.waitForSelector('div#productInfoContainer')
  } catch (e) {
    logError(e, marketName)
  }

  const ean = await extractEAN(page)
  const name = await extractName(page)
  const imageUrl = await extractImageURL(page)
  const price = await extractPrice(page)
  const discountPrice = await extractDiscountPrice(page)
  const discountDetails = await extractDiscountDetails(page)
  const categories = await extractCategories(page)

  await store(market, ean, name, url, imageUrl, price, discountPrice, discountDetails, categories)
  await page.close()
}
