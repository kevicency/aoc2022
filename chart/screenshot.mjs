import puppeteer from "puppeteer"

/**
 * Generate chart image screenshot
 * @param {object} options billboard.js generation option object
 * @param {string} path screenshot image full path with file name
 */
export default async function screenshot(options = {}, path = "chart.png") {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  // load billboard.js assets from CDN
  await page.addStyleTag({
    url: "https://cdn.jsdelivr.net/npm/billboard.js/dist/theme/datalab.min.css",
  })
  await page.addScriptTag({
    url: "https://cdn.jsdelivr.net/npm/billboard.js/dist/billboard.pkgd.min.js",
  })
  await page.addStyleTag({
    content: `
      body { background: #0f0f23; color: #ccc; fons-size: 16px; }
      .bb-axis line, .bb-axis .domain{
        stroke: #009900!important;
      }
      .bb-axis text, .bb-legend text {
        fill: #cccccc!important;
      }
    `,
  })

  await page.evaluate((options) => {
    bb.generate(options)
  }, options)

  const content = await page.$(".bb")

  // https://pptr.dev/#?product=Puppeteer&show=api-pagescreenshotoptions
  await content.screenshot({
    path,
    omitBackground: false,
    type: "png",
  })

  await page.close()
  await browser.close()
}
