import { Page } from 'puppeteer'

export type ExtractElementTextFunc = (selector: string) => (string | null | undefined)
export type ExtractElementsTextFunc = (selector: string) => string[]

export const elementText = (selector: string) => document.querySelector(selector)?.textContent?.trim()
export const elementAttrSrc = (selector: string) => document.querySelector(selector)?.getAttribute('src')
export const elementsText = (selector: string) =>
  [...document.querySelectorAll(selector)].map((el) => el.textContent).filter((text): text is string => typeof text === 'string')

export const extractFromElement = async (page: Page, selector: string, extractFunc: ExtractElementTextFunc) =>
  (await page.evaluate(extractFunc, selector)) ?? null
export const extractFromElements = async (page: Page, selector: string, extractFunc: ExtractElementsTextFunc) =>
  (await page.evaluate(extractFunc, selector)) ?? null

export const parseNumber = (text: string | null) =>
  (text !== null || text !== '') ? Number(text?.match(/[0-9.,]+/g)?.join('').replace(',', '.')) : NaN
