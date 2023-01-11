import { Page } from 'puppeteer'

export type ExtractElementTextFunc = (selector: string) => (string | null | undefined)
export type ExtractElementsTextFunc = (selector: string) => string[]

export const elementText = (selector: string): string | undefined => document.querySelector(selector)?.textContent?.trim()
export const elementAttrSrc = (selector: string): string | null | undefined => document.querySelector(selector)?.getAttribute('src')
export const elementsText = (selector: string): string[] =>
  [...document.querySelectorAll(selector)].map((el) => el.textContent).filter((text): text is string => typeof text === 'string')

export const extractFromElement = async (page: Page, selector: string, extractFunc: ExtractElementTextFunc): Promise<string | null> =>
  (await page.evaluate(extractFunc, selector)) ?? null
export const extractFromElements = async (page: Page, selector: string, extractFunc: ExtractElementsTextFunc): Promise<string[]> =>
  (await page.evaluate(extractFunc, selector)) ?? null

export const parseNumber = (text: string | null): number =>
  (text !== null || text !== '') ? Number(text?.match(/[0-9.,]+/g)?.join('').replace(',', '.')) : NaN
