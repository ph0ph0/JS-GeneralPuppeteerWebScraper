const puppeteer = require('puppeteer');
const fs = require('fs');

//maxPageCount
//URL
//Cat, Cat, Sub, SubSub
//File Location
//Attributes?

scopingFunction()

async function scopingFunction() {

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const maxPageCount = 1
  var counter = 0
  var allProductInfo = []

  async function scraper() {

    counter += 1

    page.setViewport({ width: 1280, height: 926 });

    const url = `<INSERT URL>?pn=${counter}`

    var urlToVisit = encodeURI(url)

    await page.goto(urlToVisit)

    console.log(`pageurl1: ${page.url()}`)

    // Scroll

    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          console.log(`deadBeef 2) scrolling...`)

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            console.log(`deadBeef 3) scroll ended`)
            resolve();
          }
        }, 100);
      });
    });

    console.log(`deadBeef) starting productLinks scrape`)

    //We need to wait for 5 seconds to ensure that all of the links we want to scrape have loaded
    await page.waitFor(5000)

    let productLinks = await extractProductLinks()

    //Remove duplicates
    let productLinkss = [...new Set(productLinks)]

    console.log(`productLinks: ${productLinkss}`)

    console.log(`*!*!*productLinks.length: ${productLinkss.length}`)

    productLinkss.forEach(link => {
      console.log(`ProductLink: ${link["href"]}`)
    })

    await extractProductData(productLinks)

    if (counter == maxPageCount) {
      console.log(`Finishing recursion on page: ${counter}`)
      return await allProductInfo 
    } else {
      console.log(`moving on to next page: ${counter}`)
      return await scraper() 
    }
  }

async function extractProductLinks() {

  console.log(`Extracting links`)

  let productLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".product_name > a"))
      .map(compact => ({
        href: compact.getAttribute("href")
      })))

      return productLinks
  }
  
  async function extractProductData(productLinks) {

    let testProductLinks = productLinks.slice(0)

    //always use for let of, instead of .forEach, as you can't use await in the latter as it is a function
    for (let link of testProductLinks) {

      if (link == null || link == undefined) {
        console.log(`!!!!!Breaking out of loop as productEntry was null or undefined`)
        continue
      };
      console.log(`£££link: ${link[`href`]}`)
      let href = link[`href`]
      console.log(`Product hrefs: ${href}`)
      let productPageToVisit = encodeURI(href)
      console.log(`deadBeef visiting URL of ${link}`)

      try {
        await page.goto(
          productPageToVisit,
          { waitUntil: 'networkidle2' }
        )
      } catch (error) {
        console.log(`!!!!!productURL was undefined, error: ${error}`)
        //continue
      }
    
      console.log(`Starting to extract data`)
    
    const productInfoFromPage = await page.evaluate(async () => {

      let Brand = document.querySelector("h1").innerText.trim()
    //let Model = document.querySelector('.dbh-product-name.t-product-details-heading__product-name.u-display-block').innerText

    let price = document.querySelector("#PDP_productPrice").innerText
    var Price = price.replace("£", "")

      let desc = document.querySelector("p#product_long_description").innerText

      let descc = desc.split("\n")
      let Desc = descc[0]

      let ImageURLss = []

      let imageURLs = document.querySelectorAll(".s7thumb")
      await console.log(`IMAGE URLS LENGTH: ${imageURLs.length}`)
      let i = imageURLs[0]
      console.log(i)
      imageURLs.forEach((image) =>  {
        console.log(`Current Image: ${image}`)
        let dirtyURL = image.style.backgroundImage
        let urlStart = dirtyURL.replace('url(\"', "")
        let urlCorrected = urlStart.replace("&wid=70&hei=70&", "&wid=300&hei=300&")
        let finalURL = urlCorrected.replace('\")', "")
        ImageURLss.push(finalURL)
      })
      let ImageURLs = ImageURLss.slice(0, 5)

    let meta = {
      'Category': 'HomeAndGarden',
      'SubCategory': 'Toiletries',
      'SubSubCategory': 'FeminineHygeine'
    }

    let Category = 'HomeAndGarden'
    let ShopName = ""
    let ShopID = ''

    let _geoloc = { 'lat': 0.0000, 'lng':  0.0000 }

    let OpeningTimes = 'Mon 0900 - 1930, Tue 0900 - 1930, Wed 0900 - 1930, Thu 0900 - 1930, Fri 0900 - 1930, Sat 0930 - 1900, Sun 1100 - 1800'
    let ShopPhoneNumber = ''

    // // // // // // // Include if necessary
    let InstagramProfile = ''
    let Timestamp = 1563377075 

    return {
      Brand,
      //Model,
      Price,
      Desc,
      ImageURLs,
      meta,
      Category,
      ShopName,
      ShopID,
      _geoloc,
      OpeningTimes,
      ShopPhoneNumber,
      InstagramProfile,
      Timestamp
    }
    
      })

      if (productInfoFromPage != null) {
        allProductInfo.push(productInfoFromPage)
      }

    }

  }

  scraper().then((value) => {

    browser.close()

    console.log(JSON.stringify(value, null, 2));
    fs.writeFile(
      '<file save location>',
      JSON.stringify(value, null, 2),
      (err) => err ? console.error('error data not written', err) : console.log('Data written!')
    )
  })

}
