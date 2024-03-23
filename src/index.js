// Import required modules
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const cheerio = require('cheerio');

// Import utility functions
const {
  extractAmount,
  extractStateId,
  extractConstituencyId,
} = require('./utils/scraperUtils');

// Define global variables
let obj = {};
let arr = [];

// Function to check status (for testing purposes)
async function checkStatus() {
  // Launch the Chromium browser
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to a Walmart page and take a screenshot
  await page.goto('https://www.walmart.com/cp/-201');
  await page.screenshot({ path: 'cp201.png' });

  // Close the browser
  await browser.close();
}

// Function to scrape constituencies in batches
async function scrapeConstituencies(constituencies) {
  // Define batch size and delay between requests
  const batchSize = 10;
  const delayBetweenRequests = 20000;

  // Process constituencies in batches
  for (let i = 0; i < constituencies.length; i += batchSize) {
    const batch = constituencies.slice(i, i + batchSize);
    await scrapeBatch(batch);
    await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests));
  }
}

// Function to scrape a batch of constituencies
async function scrapeBatch(constituencyBatch) {
  // Iterate over each constituency in the batch
  for (const constituency of constituencyBatch) {
    // Define paths for data storage
    const stateFolder = `src/data/${constituency.state}`;
    const constituencyFile = `${stateFolder}/${constituency.constituencyId}/${constituency.constituencyName}.json`;

    // Scrape data for the constituency and save to JSON file
    await scrapeData(
      constituency.state,
      constituency.constituencyId,
      constituency.constituencyName
    );
  }
}

// Function to scrape list of constituencies state-wise
async function scrapeListOfConstituenciesStateWise() {
  // Launch the Chromium browser
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to the webpage containing the list of constituencies
    await page.goto(`https://hsbharath.github.io/web-scraper/src/index.html`);
    let html = await page.content();
    const $ = cheerio.load(html);

    // Initialize arrays to store data
    const statesInformation = [];
    const constituenciesByState = {};

    // Find the elements containing constituency information
    const constituencyDivs = $('.country .state .constituency');

    // Iterate over each constituency element
    constituencyDivs.each((index, constituencyDiv) => {
      // Extract state information from the button
      const onclickAttribute = $(constituencyDiv)
        .find('button')
        .attr('onclick');
      const stateId = extractStateId(onclickAttribute);
      const stateInfo = $(constituencyDiv).find('button').text().trim();
      const stateName = $(constituencyDiv)
        .find('button')
        .text()
        .trim()
        .replaceAll(' ', '-')
        .replaceAll('&', 'and')
        .toLowerCase();
      const stateObj = {
        [stateInfo]: stateName,
      };
      statesInformation.push(stateObj);

      // Initialize array for constituencies of the state
      if (!constituenciesByState[stateName]) {
        constituenciesByState[stateName] = [];
      }

      // Extract constituency information
      $(constituencyDiv)
        .find('a')
        .each((index, element) => {
          const constituencyName = $(element)
            .text()
            .trim()
            .replaceAll(' ', '-')
            .replaceAll('&', 'and')
            .toLowerCase();
          const constituencyId = extractConstituencyId($(element).attr('href'));
          if (constituencyName != 'all-constituencies') {
            constituenciesByState[stateName].push({
              state: stateName,
              stateId: stateId,
              constituencyId: constituencyId,
              constituencyName: constituencyName,
            });
          }
        });

      // Create folder for the state if it doesn't exist
      const dataFolderPath = path.join(__dirname, `/data/${stateName}`);
      if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
      }
    });

    // Create folder for storing state IDs
    const stateFolderPath = path.join(__dirname, `/data/_stateIds`);
    if (!fs.existsSync(stateFolderPath)) {
      fs.mkdirSync(stateFolderPath);
    }

    // Write state information to JSON file
    const jsonFilePath = path.join(stateFolderPath, `statesIds.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(statesInformation, null, 2));

    // Process constituencies by state
    Object.entries(constituenciesByState).map(([key, value]) => {
      if (key === 'dadra-and-nagar-haveli') {
        scrapeConstituencies(value);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Function to scrape data for a constituency
async function scrapeData(state, constituencyId, constituencyFile) {
  // Launch the Chromium browser
  const browser = await playwright.chromium.launch({
    headless: false,
    timeout: 300000,
  });
  const page = await browser.newPage();

  try {
    // Navigate to the webpage containing candidate information
    await page.goto(
      `https://www.myneta.info/LokSabha2019/index.php?action=show_candidates&constituency_id=${constituencyId}`
    );
    let html = await page.content();
    const $ = cheerio.load(html);

    // Extract candidate data from the webpage
    const data = $(`#table1 tbody tr`);
    const candidates = [];

    data.each((index, element) => {
      const name = $(element).find('td:nth-child(1) a').text().trim();
      const age = $(element).find('td:nth-child(5)').text().trim();
      const party = $(element).find('td:nth-child(2)').text().trim();
      const criminal = $(element).find('td:nth-child(3)').text().trim();
      const education = $(element).find('td:nth-child(4)').text().trim();
      const assets = $(element).find('td:nth-child(6)').text().trim();
      const liablities = $(element).find('td:nth-child(7)').text().trim();
      if (name != '') {
        const candidate = {
          name: name,
          age: age,
          party: party,
          criminal: criminal,
          education: education,
          assets: extractAmount(assets),
          liabilities: extractAmount(liablities),
        };
        candidates.push(candidate);
      }
    });

    // Define paths for data storage
    const dataFolderPath = path.join(
      __dirname,
      `/data/${state}/${constituencyId}`
    );
    const jsonFilePath = path.join(dataFolderPath, `${constituencyFile}.json`);

    // Create folder if not exists
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath);
    }

    // Write file to folder
    fs.writeFileSync(jsonFilePath, JSON.stringify(candidates, null, 2));
    console.log(`Data saved successfully to ${constituencyFile}.json`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}
// Call function to capture all constituencies and its data state wise
scrapeListOfConstituenciesStateWise();
