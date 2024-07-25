import {chromium} from 'playwright-chromium';
import fs from 'fs-extra'
import pptxgen from "pptxgenjs";
import path from 'node:path'

interface ExportPngResult {
  slideIndex: number
  buffer: Buffer
}

export async function generatePPT({
                                    // request config
                                    port = 18724,
                                    routerMode = 'history',
                                    base = '/',
                                    timeout = 30000,
                                    withClicks = false,
                                    range = undefined,
                                    wait = 0,
                                    // theme config
                                    width = 1920,
                                    height = 1080,
                                    dark = false,
                                    scale = 1,
                                    // file config
                                    slides,
                                    output = 'slides',
                                  }) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: {
      width,
      // Calculate height for every slides to be in the viewport to trigger the rendering of iframes (twitter, youtube...)
      height: height
    },
    deviceScaleFactor: scale,
  })
  const page = await context.newPage()

  async function go(no: number | string, clicks?: string) {
    const query = new URLSearchParams()
    if (withClicks)
      query.set('print', 'clicks')
    else
      query.set('print', 'true')
    if (range)
      query.set('range', range)
    if (clicks)
      query.set('clicks', clicks)

    const url = routerMode === 'hash'
      ? `http://localhost:${port}${base}?${query}#${no}`
      : `http://localhost:${port}${base}${no}?${query}`
    await page.goto(url, {
      timeout,
    })
    await page.emulateMedia({colorScheme: dark ? 'dark' : 'light', media: 'screen'})
    const slide = no === 'print'
      ? page.locator('body')
      : page.locator(`[data-slidev-no="${no}"]`)
    await slide.waitFor()

    // Wait for slides to be loaded
    {
      const elements = slide.locator('.slidev-slide-loading')
      const count = await elements.count()
      for (let index = 0; index < count; index++)
        await elements.nth(index).waitFor({state: 'detached'})
    }
    // Check for "data-waitfor" attribute and wait for given element to be loaded
    {
      const elements = slide.locator('[data-waitfor]')
      const count = await elements.count()
      for (let index = 0; index < count; index++) {
        const element = elements.nth(index)
        const attribute = await element.getAttribute('data-waitfor')
        if (attribute) {
          await element.locator(attribute).waitFor({state: 'visible'})
            .catch((e) => {
              console.error(e)
              throw e;
            })
        }
      }
    }
    // Wait for frames to load
    {
      const frames = page.frames()
      await Promise.all(frames.map(frame => frame.waitForLoadState()))
    }
    // Wait for Mermaid graphs to be rendered
    {
      const container = slide.locator('#mermaid-rendering-container')
      const count = await container.count()
      if (count > 0) {
        while (true) {
          const element = container.locator('div').first()
          if (await element.count() === 0)
            break
          await element.waitFor({state: 'detached'})
        }
        await container.evaluate(node => node.style.display = 'none')
      }
    }
    // Hide Monaco aria container
    {
      const elements = slide.locator('.monaco-aria-container')
      const count = await elements.count()
      for (let index = 0; index < count; index++) {
        const element = elements.nth(index)
        await element.evaluate(node => node.style.display = 'none')
      }
    }
    // Wait for the given time
    if (wait)
      await page.waitForTimeout(wait)
  }

  async function genPagePngOnePiece() {
    const result: ExportPngResult[] = []
    await go('print')
    const slideContainers = page.locator('.print-slide-container')
    const count = await slideContainers.count()
    for (let i = 0; i < count; i++) {
      const id = (await slideContainers.nth(i).getAttribute('id')) || ''
      const slideNo = +id.split('-')[0]
      const buffer = await slideContainers.nth(i).screenshot()
      result.push({slideIndex: slideNo - 1, buffer})
      await fs.writeFile(path.join(output, `${withClicks ? id : slideNo}.png`), buffer)
    }
    return result
  }

  function genPagePng() {
    return genPagePngOnePiece()
  }

  async function genPagePptx(pngs: ExportPngResult[]) {
    const pptx = new pptxgen()

    const layoutName = `${width}x${height}`
    pptx.defineLayout({
      name: layoutName,
      width: width / 96,
      height: height / 96,
    })
    pptx.layout = layoutName

    const titleSlide = slides[0]
    pptx.author = titleSlide?.frontmatter?.author
    pptx.company = 'Created using Slidev'
    if (titleSlide?.title)
      pptx.title = titleSlide?.title
    if (titleSlide?.frontmatter?.info)
      pptx.subject = titleSlide?.frontmatter?.info

    pngs.forEach(({slideIndex, buffer}) => {
      const slide = pptx.addSlide()
      slide.background = {
        data: `data:image/png;base64,${buffer.toString('base64')}`,
      }

      const note = slides[slideIndex].note
      if (note)
        slide.addNotes(note)
    })

    const buffer = await pptx.write({
      outputType: 'nodebuffer',
    }) as Buffer
    if (!output.endsWith('.pptx'))
      output = `${output}.pptx`
    await fs.writeFile(output, buffer)
  }

  const buffers = await genPagePng()
  await genPagePptx(buffers)

  return 'success'
}