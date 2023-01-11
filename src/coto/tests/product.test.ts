import puppeteer, { Browser, Page } from 'puppeteer'
import path from 'path'
import rewire from 'rewire'

const mockUrl = (file: string): string => `file://${path.dirname(expect.getState().testPath as string)}/mocks/${file}`

const openBrowserPage = async (file: string): Promise<[Browser, Page]> => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(mockUrl(file))
  return [browser, page]
}

const runOnPage = async (file: string, func: Function): Promise<any> => {
  const [browser, page] = await openBrowserPage('product-normal.html')
  const data = await func(page)
  await browser.close()
  return data
}

const product = rewire('../product.ts')
const extractName = product.__get__('extractName')
const extractEAN = product.__get__('extractEAN')

describe('normal product', () => {
  const file = 'product-normal.html'
  test('extract name', async () => {
    const data = await runOnPage(file, extractName)
    expect(data).toBe('Fosforos Buenos Dias Cja 220 Uni')
  })

  test('extract EAN', async () => {
    const data = await runOnPage(file, extractEAN)
    expect(data).toBe('7791190003683')
  })
})
