const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const cheerio = require('cheerio');
const {
  extractAmount,
  extractStateId,
  extractConstituencyId,
} = require('./utils/scraperUtils');
let obj = {};
let arr = [];

async function checkStatus() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://www.walmart.com/cp/-201');
  await page.screenshot({ path: 'cp201.png' });
  await browser.close();
}

async function scrapeConstituencies(constituencies) {
  const batchSize = 10; // Number of constituencies to process in each batch
  const delayBetweenRequests = 20000; // Delay between each batch of requests (in milliseconds)

  for (let i = 0; i < constituencies.length; i += batchSize) {
    const batch = constituencies.slice(i, i + batchSize);
    await scrapeBatch(batch);
    await new Promise((resolve) => setTimeout(resolve, delayBetweenRequests)); // Throttle requests
  }
}

async function scrapeBatch(constituencyBatch) {
  // Scrape data for the constituencies in the batch and save to folders
  for (const constituency of constituencyBatch) {
    const stateFolder = `src/data/${constituency.state}`;
    const constituencyFile = `${stateFolder}/${constituency.constituencyId}/${constituency.constituencyName}.json`;
    // Scrape data for the constituency and save to the JSON file
    await scrapeData(
      constituency.state,
      constituency.constituencyId,
      constituency.constituencyName
    );
  }
}

async function scrapeListOfConstituenciesStateWise() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const html = `<div class="country">
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '62')"> ANDAMAN &amp; NICOBAR ISLANDS </button>
            <div id="item_62" >
                <a href="state_id=62"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=431"
                    >ANDAMAN AND NICOBAR ISLANDS</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '34')"> ANDHRA PRADESH </button>
            <div id="item_34" >
                <a href="state_id=34"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=438"
                    >AMALAPURAM</a> <a href="constituency_id=436"
                    >ANAKAPALLE</a> <a href="constituency_id=450"
                    >ANANTAPUR</a> <a href="constituency_id=432"
                    >ARAKU</a> <a href="constituency_id=458"
                    >BAPATLA</a> <a href="constituency_id=456"
                    >CHITTOOR</a> <a href="constituency_id=441"
                    >ELURU</a> <a href="constituency_id=444"
                    >GUNTUR</a> <a href="constituency_id=451"
                    >HINDUPUR</a> <a href="constituency_id=452"
                    >KADAPA</a> <a href="constituency_id=437"
                    >KAKINADA</a> <a href="constituency_id=449"
                    >KURNOOL</a> <a href="constituency_id=442"
                    >MACHILIPATNAM</a> <a
                    href="constituency_id=448"
                    >NANDYAL</a> <a href="constituency_id=445"
                    >NARASARAOPET</a> <a
                    href="constituency_id=440"
                    >NARSAPURAM</a> <a href="constituency_id=453"
                    >NELLORE</a> <a href="constituency_id=447"
                    >ONGOLE</a> <a href="constituency_id=439"
                    >RAJAHMUNDRY</a> <a
                    href="constituency_id=455"
                    >RAJAMPET</a> <a href="constituency_id=433"
                    >SRIKAKULAM</a> <a href="constituency_id=454"
                    >TIRUPATI</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1015">TIRUPATI
                    : BYE ELECTION ON 17-04-2021</a> <a href="constituency_id=443"
                    >VIJAYAWADA</a> <a href="constituency_id=435"
                    >VISAKHAPATNAM</a> <a
                    href="constituency_id=434"
                    >VIZIANAGARAM</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '35')"> ARUNACHAL PRADESH </button>
            <div id="item_35" >
                <a href="state_id=35"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=460"
                    >ARUNACHAL EAST</a> <a
                    href="constituency_id=459"
                    >ARUNACHAL WEST</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '36')"> ASSAM </button>
            <div id="item_36" >
                <a href="state_id=36"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=468"
                    title="Date of Election 18-04-2019">AUTONOMOUS DISTRICT</a> <a
                    href="constituency_id=473"
                    title="Date of Election 23-04-2019">BARPETA</a> <a href="constituency_id=471"
                    title="Date of Election 23-04-2019">DHUBRI</a> <a href="constituency_id=464"
                    >DIBRUGARH</a> <a href="constituency_id=474"
                    title="Date of Election 23-04-2019">GAUHATI</a> <a href="constituency_id=463"
                    >JORHAT</a> <a href="constituency_id=462"
                    >KALIABOR</a> <a href="constituency_id=466"
                    title="Date of Election 18-04-2019">KARIMGANJ</a> <a href="constituency_id=472"
                    title="Date of Election 23-04-2019">KOKRAJHAR</a> <a href="constituency_id=465"
                    >LAKHIMPUR</a> <a href="constituency_id=469"
                    title="Date of Election 18-04-2019">MANGALDOI</a> <a href="constituency_id=470"
                    title="Date of Election 18-04-2019">NAWGONG</a> <a href="constituency_id=467"
                    title="Date of Election 18-04-2019">SILCHAR</a> <a href="constituency_id=461"
                    >TEZPUR</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '37')"> BIHAR </button>
            <div id="item_37" >
                <a href="state_id=37"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=487"
                    title="Date of Election 23-04-2019">ARARIA</a> <a href="constituency_id=511"
                    title="Date of Election 19-05-2019">ARRAH</a> <a href="constituency_id=476"
                    >AURANGABAD</a> <a href="constituency_id=484"
                    title="Date of Election 18-04-2019">BANKA</a> <a href="constituency_id=493"
                    title="Date of Election 29-04-2019">BEGUSARAI</a> <a href="constituency_id=483"
                    title="Date of Election 18-04-2019">BHAGALPUR</a> <a href="constituency_id=512"
                    title="Date of Election 19-05-2019">BUXAR</a> <a href="constituency_id=518"
                    title="Date of Election 29-04-2019">DARBHANGA</a> <a href="constituency_id=477"
                    >GAYA</a> <a href="constituency_id=517"
                    title="Date of Election 12-05-2019">GOPALGANJ</a> <a href="constituency_id=499"
                    title="Date of Election 06-05-2019">HAJIPUR</a> <a href="constituency_id=515"
                    title="Date of Election 19-05-2019">JAHANABAD</a> <a href="constituency_id=479"
                    >JAMUI</a> <a href="constituency_id=485"
                    title="Date of Election 23-04-2019">JHANJHARPUR</a> <a
                    href="constituency_id=514"
                    title="Date of Election 19-05-2019">KARAKAT</a> <a href="constituency_id=481"
                    title="Date of Election 18-04-2019">KATIHAR</a> <a href="constituency_id=489"
                    title="Date of Election 23-04-2019">KHAGARIA</a> <a href="constituency_id=480"
                    title="Date of Election 18-04-2019">KISHANGANJ</a> <a href="constituency_id=488"
                    title="Date of Election 23-04-2019">MADHEPURA</a> <a href="constituency_id=496"
                    title="Date of Election 06-05-2019">MADHUBANI</a> <a href="constituency_id=507"
                    title="Date of Election 12-05-2019">MAHARAJGANJ</a> <a
                    href="constituency_id=494"
                    title="Date of Election 29-04-2019">MUNGER</a> <a href="constituency_id=497"
                    title="Date of Election 06-05-2019">MUZAFFARPUR</a> <a
                    href="constituency_id=508"
                    title="Date of Election 19-05-2019">NALANDA</a> <a href="constituency_id=478"
                    >NAWADA</a> <a href="constituency_id=501"
                    title="Date of Election 12-05-2019">PASCHIM CHAMPARAN</a> <a
                    href="constituency_id=510"
                    title="Date of Election 19-05-2019">PATALIPUTRA</a> <a
                    href="constituency_id=509"
                    title="Date of Election 19-05-2019">PATNA SAHIB</a> <a
                    href="constituency_id=482"
                    title="Date of Election 18-04-2019">PURNIA</a> <a href="constituency_id=502"
                    title="Date of Election 12-05-2019">PURVI CHAMPARAN</a> <a
                    href="constituency_id=492"
                    title="Date of Election 29-04-2019">SAMASTIPUR</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1010">SAMASTIPUR
                    (SC) : BYE ELECTION ON 21-10-2019</a> <a href="constituency_id=498"
                    title="Date of Election 06-05-2019">SARAN</a> <a href="constituency_id=513"
                    title="Date of Election 19-05-2019">SASARAM</a> <a href="constituency_id=503"
                    title="Date of Election 12-05-2019">SHEOHAR</a> <a href="constituency_id=495"
                    title="Date of Election 06-05-2019">SITAMARHI</a> <a href="constituency_id=506"
                    title="Date of Election 12-05-2019">SIWAN</a> <a href="constituency_id=486"
                    title="Date of Election 23-04-2019">SUPAUL</a> <a href="constituency_id=491"
                    title="Date of Election 29-04-2019">UJIARPUR</a> <a href="constituency_id=504"
                    title="Date of Election 12-05-2019">VAISHALI</a> <a href="constituency_id=500"
                    title="Date of Election 12-05-2019">VALMIKI NAGAR</a> <a
                    class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1012">VALMIKI
                    NAGAR : BYE ELECTION ON 07-11-2020</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '63')"> CHANDIGARH </button>
            <div id="item_63" >
                <a href="state_id=63"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=519"
                    title="Date of Election 19-05-2019">CHANDIGARH</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '59')"> CHHATTISGARH </button>
            <div id="item_59" >
                <a href="state_id=59"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=520"
                    >BASTAR</a> <a href="constituency_id=528"
                    title="Date of Election 23-04-2019">BILASPUR</a> <a href="constituency_id=529"
                    title="Date of Election 23-04-2019">DURG</a> <a href="constituency_id=526"
                    title="Date of Election 23-04-2019">JANJGIR CHAMPA</a> <a
                    href="constituency_id=523"
                    title="Date of Election 18-04-2019">KANKER</a> <a href="constituency_id=527"
                    title="Date of Election 23-04-2019">KORBA</a> <a href="constituency_id=522"
                    title="Date of Election 18-04-2019">MAHASAMUND</a> <a href="constituency_id=525"
                    title="Date of Election 23-04-2019">RAIGARH</a> <a href="constituency_id=530"
                    title="Date of Election 23-04-2019">RAIPUR</a> <a href="constituency_id=521"
                    title="Date of Election 18-04-2019">RAJNANDGAON</a> <a
                    href="constituency_id=524"
                    title="Date of Election 23-04-2019">SURGUJA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '64')"> DADRA &amp; NAGAR HAVELI </button>
            <div id="item_64" >
                <a href="state_id=64"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=532"
                    title="Date of Election 23-04-2019">DADRA AND NAGAR HAVELI</a> <a
                    class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1017">DADRA
                    AND NAGAR HAVELI : BYE ELECTION ON 30-10-2021</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '65')"> DAMAN &amp; DIU </button>
            <div id="item_65" >
                <a href="state_id=65"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=533"
                    title="Date of Election 23-04-2019">DAMAN AND DIU</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '38')"> GOA </button>
            <div id="item_38" >
                <a href="state_id=38"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=541"
                    title="Date of Election 23-04-2019">NORTH GOA</a> <a href="constituency_id=542"
                    title="Date of Election 23-04-2019">SOUTH GOA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '39')"> GUJARAT </button>
            <div id="item_39" >
                <a href="state_id=39"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=549"
                    title="Date of Election 23-04-2019">AHMEDABAD EAST</a> <a
                    href="constituency_id=550"
                    title="Date of Election 23-04-2019">AHMEDABAD WEST</a> <a
                    href="constituency_id=556"
                    title="Date of Election 23-04-2019">AMRELI</a> <a href="constituency_id=558"
                    title="Date of Election 23-04-2019">ANAND</a> <a href="constituency_id=544"
                    title="Date of Election 23-04-2019">BANASKANTHA</a> <a
                    href="constituency_id=565"
                    title="Date of Election 23-04-2019">BARDOLI</a> <a href="constituency_id=564"
                    title="Date of Election 23-04-2019">BHARUCH</a> <a href="constituency_id=570"
                    title="Date of Election 23-04-2019">BHAVNAGAR</a> <a href="constituency_id=563"
                    title="Date of Election 23-04-2019">CHHOTA UDAIPUR</a> <a
                    href="constituency_id=561"
                    title="Date of Election 23-04-2019">DAHOD</a> <a href="constituency_id=548"
                    title="Date of Election 23-04-2019">GANDHINAGAR</a> <a
                    href="constituency_id=554"
                    title="Date of Election 23-04-2019">JAMNAGAR</a> <a href="constituency_id=555"
                    title="Date of Election 23-04-2019">JUNAGADH</a> <a href="constituency_id=543"
                    title="Date of Election 23-04-2019">KACHCHH</a> <a href="constituency_id=559"
                    title="Date of Election 23-04-2019">KHEDA</a> <a href="constituency_id=546"
                    title="Date of Election 23-04-2019">MAHESANA</a> <a href="constituency_id=567"
                    title="Date of Election 23-04-2019">NAVSARI</a> <a href="constituency_id=560"
                    title="Date of Election 23-04-2019">PANCHMAHAL</a> <a href="constituency_id=545"
                    title="Date of Election 23-04-2019">PATAN</a> <a href="constituency_id=553"
                    title="Date of Election 23-04-2019">PORBANDAR</a> <a href="constituency_id=552"
                    title="Date of Election 23-04-2019">RAJKOT</a> <a href="constituency_id=547"
                    title="Date of Election 23-04-2019">SABARKANTHA</a> <a
                    href="constituency_id=566"
                    title="Date of Election 23-04-2019">SURAT</a> <a href="constituency_id=551"
                    title="Date of Election 23-04-2019">SURENDRANAGAR</a> <a
                    href="constituency_id=562"
                    title="Date of Election 23-04-2019">VADODARA</a> <a href="constituency_id=568"
                    title="Date of Election 23-04-2019">VALSAD</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '40')"> HARYANA </button>
            <div id="item_40" >
                <a href="state_id=40"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=571"
                    title="Date of Election 12-05-2019">AMBALA</a> <a href="constituency_id=578"
                    title="Date of Election 12-05-2019">BHIWANI MAHENDRAGARH</a> <a
                    href="constituency_id=580"
                    title="Date of Election 12-05-2019">FARIDABAD</a> <a href="constituency_id=579"
                    title="Date of Election 12-05-2019">GURGAON</a> <a href="constituency_id=574"
                    title="Date of Election 12-05-2019">HISAR</a> <a href="constituency_id=575"
                    title="Date of Election 12-05-2019">KARNAL</a> <a href="constituency_id=572"
                    title="Date of Election 12-05-2019">KURUKSHETRA</a> <a
                    href="constituency_id=577"
                    title="Date of Election 12-05-2019">ROHTAK</a> <a href="constituency_id=573"
                    title="Date of Election 12-05-2019">SIRSA</a> <a href="constituency_id=576"
                    title="Date of Election 12-05-2019">SONIPAT</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '41')"> HIMACHAL PRADESH </button>
            <div id="item_41" >
                <a href="state_id=41"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=584"
                    title="Date of Election 19-05-2019">HAMIRPUR</a> <a href="constituency_id=582"
                    title="Date of Election 19-05-2019">KANGRA</a> <a href="constituency_id=583"
                    title="Date of Election 19-05-2019">MANDI</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1018">MANDI
                    : BYE ELECTION ON 30-10-2021</a> <a href="constituency_id=585"
                    title="Date of Election 19-05-2019">SHIMLA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '42')"> JAMMU &amp; KASHMIR </button>
            <div id="item_42" >
                <a href="state_id=42"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=1004"
                    title="Date of Election 06-05-2019">ANANTNAG</a> <a href="constituency_id=1005"
                    >BARAMULLA</a> <a href="constituency_id=1006"
                    >JAMMU</a> <a href="constituency_id=1009"
                    title="Date of Election 06-05-2019">LADAKH</a> <a href="constituency_id=1007"
                    title="Date of Election 18-04-2019">SRINAGAR</a> <a href="constituency_id=1008"
                    title="Date of Election 18-04-2019">UDHAMPUR</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '60')"> JHARKHAND </button>
            <div id="item_60" >
                <a href="state_id=60"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=586"
                    title="Date of Election 29-04-2019">CHATRA</a> <a href="constituency_id=594"
                    title="Date of Election 12-05-2019">DHANBAD</a> <a href="constituency_id=598"
                    title="Date of Election 19-05-2019">DUMKA</a> <a href="constituency_id=593"
                    title="Date of Election 12-05-2019">GIRIDIH</a> <a href="constituency_id=599"
                    title="Date of Election 19-05-2019">GODDA</a> <a href="constituency_id=592"
                    title="Date of Election 06-05-2019">HAZARIBAGH</a> <a href="constituency_id=595"
                    title="Date of Election 12-05-2019">JAMSHEDPUR</a> <a href="constituency_id=591"
                    title="Date of Election 06-05-2019">KHUNTI</a> <a href="constituency_id=589"
                    title="Date of Election 06-05-2019">KODARMA</a> <a href="constituency_id=587"
                    title="Date of Election 29-04-2019">LOHARDAGA</a> <a href="constituency_id=588"
                    title="Date of Election 29-04-2019">PALAMU</a> <a href="constituency_id=597"
                    title="Date of Election 19-05-2019">RAJMAHAL</a> <a href="constituency_id=590"
                    title="Date of Election 06-05-2019">RANCHI</a> <a href="constituency_id=596"
                    title="Date of Election 12-05-2019">SINGHBHUM</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '43')"> KARNATAKA </button>
            <div id="item_43" >
                <a href="state_id=43"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=618"
                    title="Date of Election 23-04-2019">BAGALKOT</a> <a href="constituency_id=611"
                    title="Date of Election 18-04-2019">BANGALORE CENTRAL</a> <a
                    href="constituency_id=610"
                    title="Date of Election 18-04-2019">BANGALORE NORTH</a> <a
                    href="constituency_id=609"
                    title="Date of Election 18-04-2019">BANGALORE RURAL</a> <a
                    href="constituency_id=612"
                    title="Date of Election 18-04-2019">BANGALORE SOUTH</a> <a
                    href="constituency_id=617"
                    title="Date of Election 23-04-2019">BELGAUM</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1016">BELGAUM
                    : BYE ELECTION ON 17-04-2021</a> <a href="constituency_id=624"
                    title="Date of Election 23-04-2019">BELLARY</a> <a href="constituency_id=622"
                    title="Date of Election 23-04-2019">BIDAR</a> <a href="constituency_id=619"
                    title="Date of Election 23-04-2019">BIJAPUR</a> <a href="constituency_id=608"
                    title="Date of Election 18-04-2019">CHAMARAJANAGAR</a> <a
                    href="constituency_id=613"
                    title="Date of Election 18-04-2019">CHIKKBALLAPUR</a> <a
                    href="constituency_id=616"
                    title="Date of Election 23-04-2019">CHIKKODI</a> <a href="constituency_id=604"
                    title="Date of Election 18-04-2019">CHITRADURGA</a> <a
                    href="constituency_id=603"
                    title="Date of Election 18-04-2019">DAKSHINA KANNADA</a> <a
                    href="constituency_id=628"
                    title="Date of Election 23-04-2019">DAVANAGERE</a> <a href="constituency_id=626"
                    title="Date of Election 23-04-2019">DHARWAD</a> <a href="constituency_id=620"
                    title="Date of Election 23-04-2019">GULBARGA</a> <a href="constituency_id=602"
                    title="Date of Election 18-04-2019">HASSAN</a> <a href="constituency_id=625"
                    title="Date of Election 23-04-2019">HAVERI</a> <a href="constituency_id=614"
                    title="Date of Election 18-04-2019">KOLAR</a> <a href="constituency_id=623"
                    title="Date of Election 23-04-2019">KOPPAL</a> <a href="constituency_id=606"
                    title="Date of Election 18-04-2019">MANDYA</a> <a href="constituency_id=607"
                    title="Date of Election 18-04-2019">MYSORE</a> <a href="constituency_id=621"
                    title="Date of Election 23-04-2019">RAICHUR</a> <a href="constituency_id=629"
                    title="Date of Election 23-04-2019">SHIMOGA</a> <a href="constituency_id=605"
                    title="Date of Election 18-04-2019">TUMKUR</a> <a href="constituency_id=601"
                    title="Date of Election 18-04-2019">UDUPI CHIKMAGALUR</a> <a
                    href="constituency_id=627"
                    title="Date of Election 23-04-2019">UTTARA KANNADA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '44')"> KERALA </button>
            <div id="item_44" >
                <a href="state_id=44"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=646"
                    title="Date of Election 23-04-2019">ALAPPUZHA</a> <a href="constituency_id=639"
                    title="Date of Election 23-04-2019">ALATHUR</a> <a href="constituency_id=650"
                    title="Date of Election 23-04-2019">ATTINGAL</a> <a href="constituency_id=641"
                    title="Date of Election 23-04-2019">CHALAKUDY</a> <a href="constituency_id=642"
                    title="Date of Election 23-04-2019">ERNAKULAM</a> <a href="constituency_id=643"
                    title="Date of Election 23-04-2019">IDUKKI</a> <a href="constituency_id=632"
                    title="Date of Election 23-04-2019">KANNUR</a> <a href="constituency_id=631"
                    title="Date of Election 23-04-2019">KASARAGOD</a> <a href="constituency_id=649"
                    title="Date of Election 23-04-2019">KOLLAM</a> <a href="constituency_id=644"
                    title="Date of Election 23-04-2019">KOTTAYAM</a> <a href="constituency_id=635"
                    title="Date of Election 23-04-2019">KOZHIKODE</a> <a href="constituency_id=636"
                    title="Date of Election 23-04-2019">MALAPPURAM</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1013">MALAPPURAM
                    : BYE ELECTION ON 06-04-2021</a> <a href="constituency_id=647"
                    title="Date of Election 23-04-2019">MAVELIKKARA</a> <a
                    href="constituency_id=638"
                    title="Date of Election 23-04-2019">PALAKKAD</a> <a href="constituency_id=648"
                    title="Date of Election 23-04-2019">PATHANAMTHITTA</a> <a
                    href="constituency_id=637"
                    title="Date of Election 23-04-2019">PONNANI</a> <a href="constituency_id=651"
                    title="Date of Election 23-04-2019">THIRUVANANTHAPURAM</a> <a
                    href="constituency_id=640"
                    title="Date of Election 23-04-2019">THRISSUR</a> <a href="constituency_id=633"
                    title="Date of Election 23-04-2019">VADAKARA</a> <a href="constituency_id=634"
                    title="Date of Election 23-04-2019">WAYANAD</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '67')"> LAKSHADWEEP </button>
            <div id="item_67" >
                <a href="state_id=67"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=652"
                    >LAKSHADWEEP</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '45')"> MADHYA PRADESH </button>
            <div id="item_45" >
                <a href="state_id=45"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=657"
                    title="Date of Election 29-04-2019">BALAGHAT</a> <a href="constituency_id=665"
                    title="Date of Election 06-05-2019">BETUL</a> <a href="constituency_id=668"
                    title="Date of Election 12-05-2019">BHIND</a> <a href="constituency_id=673"
                    title="Date of Election 12-05-2019">BHOPAL</a> <a href="constituency_id=658"
                    title="Date of Election 29-04-2019">CHHINDWARA</a> <a href="constituency_id=660"
                    title="Date of Election 06-05-2019">DAMOH</a> <a href="constituency_id=675"
                    title="Date of Election 19-05-2019">DEWAS</a> <a href="constituency_id=679"
                    title="Date of Election 19-05-2019">DHAR</a> <a href="constituency_id=670"
                    title="Date of Election 12-05-2019">GUNA</a> <a href="constituency_id=669"
                    title="Date of Election 12-05-2019">GWALIOR</a> <a href="constituency_id=664"
                    title="Date of Election 06-05-2019">HOSHANGABAD</a> <a
                    href="constituency_id=680"
                    title="Date of Election 19-05-2019">INDORE</a> <a href="constituency_id=655"
                    title="Date of Election 29-04-2019">JABALPUR</a> <a href="constituency_id=661"
                    title="Date of Election 06-05-2019">KHAJURAHO</a> <a href="constituency_id=683"
                    title="Date of Election 19-05-2019">KHANDWA</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1019">KHANDWA
                    : BYE ELECTION ON 30-10-2021</a> <a href="constituency_id=681"
                    title="Date of Election 19-05-2019">KHARGONE</a> <a href="constituency_id=656"
                    title="Date of Election 29-04-2019">MANDLA</a> <a href="constituency_id=677"
                    title="Date of Election 19-05-2019">MANDSOUR</a> <a href="constituency_id=666"
                    title="Date of Election 12-05-2019">MORENA</a> <a href="constituency_id=674"
                    title="Date of Election 12-05-2019">RAJGARH</a> <a href="constituency_id=678"
                    title="Date of Election 19-05-2019">RATLAM</a> <a href="constituency_id=663"
                    title="Date of Election 06-05-2019">REWA</a> <a href="constituency_id=671"
                    title="Date of Election 12-05-2019">SAGAR</a> <a href="constituency_id=662"
                    title="Date of Election 06-05-2019">SATNA</a> <a href="constituency_id=654"
                    title="Date of Election 29-04-2019">SHAHDOL</a> <a href="constituency_id=653"
                    title="Date of Election 29-04-2019">SIDHI</a> <a href="constituency_id=659"
                    title="Date of Election 06-05-2019">TIKAMGARH</a> <a href="constituency_id=676"
                    title="Date of Election 19-05-2019">UJJAIN</a> <a href="constituency_id=672"
                    title="Date of Election 12-05-2019">VIDISHA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '46')"> MAHARASHTRA </button>
            <div id="item_46" >
                <a href="state_id=46"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=709"
                    title="Date of Election 23-04-2019">AHMEDNAGAR</a> <a href="constituency_id=692"
                    title="Date of Election 18-04-2019">AKOLA</a> <a href="constituency_id=693"
                    title="Date of Election 18-04-2019">AMRAVATI</a> <a href="constituency_id=705"
                    title="Date of Election 23-04-2019">AURANGABAD</a> <a href="constituency_id=708"
                    title="Date of Election 23-04-2019">BARAMATI</a> <a href="constituency_id=697"
                    title="Date of Election 18-04-2019">BEED</a> <a href="constituency_id=687"
                    >BHANDARA GONDIYA</a> <a
                    href="constituency_id=722"
                    title="Date of Election 29-04-2019">BHIWANDI</a> <a href="constituency_id=691"
                    title="Date of Election 18-04-2019">BULDHANA</a> <a href="constituency_id=689"
                    >CHANDRAPUR</a> <a href="constituency_id=718"
                    title="Date of Election 29-04-2019">DHULE</a> <a href="constituency_id=719"
                    title="Date of Election 29-04-2019">DINDORI</a> <a href="constituency_id=688"
                    >GADCHIROLI CHIMUR</a> <a
                    href="constituency_id=716"
                    title="Date of Election 23-04-2019">HATKANANGLE</a> <a
                    href="constituency_id=694"
                    title="Date of Election 18-04-2019">HINGOLI</a> <a href="constituency_id=702"
                    title="Date of Election 23-04-2019">JALGAON</a> <a href="constituency_id=704"
                    title="Date of Election 23-04-2019">JALNA</a> <a href="constituency_id=723"
                    title="Date of Election 29-04-2019">KALYAN</a> <a href="constituency_id=715"
                    title="Date of Election 23-04-2019">KOLHAPUR</a> <a href="constituency_id=700"
                    title="Date of Election 18-04-2019">LATUR</a> <a href="constituency_id=710"
                    title="Date of Election 23-04-2019">MADHA</a> <a href="constituency_id=732"
                    title="Date of Election 29-04-2019">MAVAL</a> <a href="constituency_id=725"
                    title="Date of Election 29-04-2019">MUMBAI NORTH</a> <a
                    href="constituency_id=729"
                    title="Date of Election 29-04-2019">MUMBAI NORTH CENTRAL</a> <a
                    href="constituency_id=727"
                    title="Date of Election 29-04-2019">MUMBAI NORTH EAST</a> <a
                    href="constituency_id=726"
                    title="Date of Election 29-04-2019">MUMBAI NORTH WEST</a> <a
                    href="constituency_id=731"
                    title="Date of Election 29-04-2019">MUMBAI SOUTH</a> <a
                    href="constituency_id=730"
                    title="Date of Election 29-04-2019">MUMBAI SOUTH CENTRAL</a> <a
                    href="constituency_id=686"
                    >NAGPUR</a> <a href="constituency_id=695"
                    title="Date of Election 18-04-2019">NANDED</a> <a href="constituency_id=717"
                    title="Date of Election 29-04-2019">NANDURBAR</a> <a href="constituency_id=720"
                    title="Date of Election 29-04-2019">NASHIK</a> <a href="constituency_id=699"
                    title="Date of Election 18-04-2019">OSMANABAD</a> <a href="constituency_id=721"
                    title="Date of Election 29-04-2019">PALGHAR</a> <a href="constituency_id=696"
                    title="Date of Election 18-04-2019">PARBHANI</a> <a href="constituency_id=707"
                    title="Date of Election 23-04-2019">PUNE</a> <a href="constituency_id=706"
                    title="Date of Election 23-04-2019">RAIGAD</a> <a href="constituency_id=685"
                    >RAMTEK</a> <a href="constituency_id=714"
                    title="Date of Election 23-04-2019">RATNAGIRI SINDHUDURG</a> <a
                    href="constituency_id=703"
                    title="Date of Election 23-04-2019">RAVER</a> <a href="constituency_id=711"
                    title="Date of Election 23-04-2019">SANGLI</a> <a href="constituency_id=712"
                    title="Date of Election 23-04-2019">SATARA</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1011">SATARA
                    : BYE ELECTION ON 21-10-2019</a> <a href="constituency_id=734"
                    title="Date of Election 29-04-2019">SHIRDI</a> <a href="constituency_id=733"
                    title="Date of Election 29-04-2019">SHIRUR</a> <a href="constituency_id=701"
                    title="Date of Election 18-04-2019">SOLAPUR</a> <a href="constituency_id=724"
                    title="Date of Election 29-04-2019">THANE</a> <a href="constituency_id=684"
                    >WARDHA</a> <a href="constituency_id=690"
                    >YAVATMAL WASHIM</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '47')"> MANIPUR </button>
            <div id="item_47" >
                <a href="state_id=47"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=736"
                    title="Date of Election 18-04-2019">INNER MANIPUR</a> <a
                    href="constituency_id=735"
                    >OUTER MANIPUR</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '48')"> MEGHALAYA </button>
            <div id="item_48" >
                <a href="state_id=48"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=737"
                    >SHILLONG</a> <a href="constituency_id=738"
                    >TURA</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '49')"> MIZORAM </button>
            <div id="item_49" >
                <a href="state_id=49"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=739"
                    >MIZORAM</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '50')"> NAGALAND </button>
            <div id="item_50" >
                <a href="state_id=50"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=740"
                    >NAGALAND</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '66')"> NATIONAL CAPITAL TERRITORY OF DELHI </button>
            <div id="item_66" >
                <a href="state_id=66"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=534"
                    title="Date of Election 12-05-2019">CHANDNI CHOWK</a> <a
                    href="constituency_id=536"
                    title="Date of Election 12-05-2019">EAST DELHI</a> <a href="constituency_id=537"
                    title="Date of Election 12-05-2019">NEW DELHI</a> <a href="constituency_id=535"
                    title="Date of Election 12-05-2019">NORTH EAST DELHI</a> <a
                    href="constituency_id=538"
                    title="Date of Election 12-05-2019">NORTH WEST DELHI</a> <a
                    href="constituency_id=540"
                    title="Date of Election 12-05-2019">SOUTH DELHI</a> <a
                    href="constituency_id=539"
                    title="Date of Election 12-05-2019">WEST DELHI</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '51')"> ODISHA </button>
            <div id="item_51" >
                <a href="state_id=51"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=749"
                    title="Date of Election 18-04-2019">ASKA</a> <a href="constituency_id=758"
                    title="Date of Election 29-04-2019">BALASORE</a> <a href="constituency_id=745"
                    title="Date of Election 18-04-2019">BARGARH</a> <a href="constituency_id=743"
                    >BERHAMPUR</a> <a href="constituency_id=759"
                    title="Date of Election 29-04-2019">BHADRAK</a> <a href="constituency_id=756"
                    title="Date of Election 23-04-2019">BHUBANESWAR</a> <a
                    href="constituency_id=747"
                    title="Date of Election 18-04-2019">BOLANGIR</a> <a href="constituency_id=753"
                    title="Date of Election 23-04-2019">CUTTACK</a> <a href="constituency_id=752"
                    title="Date of Election 23-04-2019">DHENKANAL</a> <a href="constituency_id=762"
                    title="Date of Election 29-04-2019">JAGATSINGHPUR</a> <a
                    href="constituency_id=760"
                    title="Date of Election 29-04-2019">JAJPUR</a> <a href="constituency_id=741"
                    >KALAHANDI</a> <a href="constituency_id=748"
                    title="Date of Election 18-04-2019">KANDHAMAL</a> <a href="constituency_id=761"
                    title="Date of Election 29-04-2019">KENDRAPARA</a> <a href="constituency_id=751"
                    title="Date of Election 23-04-2019">KEONJHAR</a> <a href="constituency_id=744"
                    >KORAPUT</a> <a href="constituency_id=757"
                    title="Date of Election 29-04-2019">MAYURBHANJ</a> <a href="constituency_id=742"
                    >NABARANGPUR</a> <a
                    href="constituency_id=754"
                    title="Date of Election 23-04-2019">PURI</a> <a href="constituency_id=750"
                    title="Date of Election 23-04-2019">SAMBALPUR</a> <a href="constituency_id=746"
                    title="Date of Election 18-04-2019">SUNDARGARH</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '68')"> PUDUCHERRY </button>
            <div id="item_68" >
                <a href="state_id=68"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=763"
                    title="Date of Election 18-04-2019">PUDUCHERRY</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '52')"> PUNJAB </button>
            <div id="item_52" >
                <a href="state_id=52"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=765"
                    title="Date of Election 19-05-2019">AMRITSAR</a> <a href="constituency_id=769"
                    title="Date of Election 19-05-2019">ANANDPUR SAHIB</a> <a
                    href="constituency_id=774"
                    title="Date of Election 19-05-2019">BATHINDA</a> <a href="constituency_id=772"
                    title="Date of Election 19-05-2019">FARIDKOT</a> <a href="constituency_id=771"
                    title="Date of Election 19-05-2019">FATEHGARH SAHIB</a> <a
                    href="constituency_id=773"
                    title="Date of Election 19-05-2019">FIROZPUR</a> <a href="constituency_id=764"
                    title="Date of Election 19-05-2019">GURDASPUR</a> <a href="constituency_id=768"
                    title="Date of Election 19-05-2019">HOSHIARPUR</a> <a href="constituency_id=767"
                    title="Date of Election 19-05-2019">JALANDHAR</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1025">JALANDHAR
                    : BYE ELECTION ON 10-05-2023</a> <a href="constituency_id=766"
                    title="Date of Election 19-05-2019">KHADOOR SAHIB</a> <a
                    href="constituency_id=770"
                    title="Date of Election 19-05-2019">LUDHIANA</a> <a href="constituency_id=776"
                    title="Date of Election 19-05-2019">PATIALA</a> <a href="constituency_id=775"
                    title="Date of Election 19-05-2019">SANGRUR</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1021">SANGRUR
                    : BYE ELECTION ON 23-06-2022 </a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '53')"> RAJASTHAN </button>
            <div id="item_53" >
                <a href="state_id=53"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=779"
                    title="Date of Election 29-04-2019">AJMER</a> <a href="constituency_id=799"
                    title="Date of Election 06-05-2019">ALWAR</a> <a href="constituency_id=785"
                    title="Date of Election 29-04-2019">BANSWARA</a> <a href="constituency_id=782"
                    title="Date of Election 29-04-2019">BARMER</a> <a href="constituency_id=800"
                    title="Date of Election 06-05-2019">BHARATPUR</a> <a href="constituency_id=788"
                    title="Date of Election 29-04-2019">BHILWARA</a> <a href="constituency_id=793"
                    title="Date of Election 06-05-2019">BIKANER</a> <a href="constituency_id=786"
                    title="Date of Election 29-04-2019">CHITTORGARH</a> <a
                    href="constituency_id=794"
                    title="Date of Election 06-05-2019">CHURU</a> <a href="constituency_id=802"
                    title="Date of Election 06-05-2019">DAUSA</a> <a href="constituency_id=792"
                    title="Date of Election 06-05-2019">GANGANAGAR</a> <a href="constituency_id=798"
                    title="Date of Election 06-05-2019">JAIPUR</a> <a href="constituency_id=797"
                    title="Date of Election 06-05-2019">JAIPUR RURAL</a> <a
                    href="constituency_id=783"
                    title="Date of Election 29-04-2019">JALORE</a> <a href="constituency_id=790"
                    title="Date of Election 29-04-2019">JHALAWAR BARAN</a> <a
                    href="constituency_id=795"
                    title="Date of Election 06-05-2019">JHUNJHUNU</a> <a href="constituency_id=781"
                    title="Date of Election 29-04-2019">JODHPUR</a> <a href="constituency_id=801"
                    title="Date of Election 06-05-2019">KARAULI DHOLPUR</a> <a
                    href="constituency_id=789"
                    title="Date of Election 29-04-2019">KOTA</a> <a href="constituency_id=803"
                    title="Date of Election 06-05-2019">NAGAUR</a> <a href="constituency_id=780"
                    title="Date of Election 29-04-2019">PALI</a> <a href="constituency_id=787"
                    title="Date of Election 29-04-2019">RAJSAMAND</a> <a href="constituency_id=796"
                    title="Date of Election 06-05-2019">SIKAR</a> <a href="constituency_id=778"
                    title="Date of Election 29-04-2019">TONK SAWAI MADHOPUR</a> <a
                    href="constituency_id=784"
                    title="Date of Election 29-04-2019">UDAIPUR</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '54')"> SIKKIM </button>
            <div id="item_54" >
                <a href="state_id=54"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=805"
                    >SIKKIM</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '55')"> TAMIL NADU </button>
            <div id="item_55" >
                <a href="state_id=55"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=812"
                    title="Date of Election 18-04-2019">ARAKKONAM</a> <a href="constituency_id=817"
                    title="Date of Election 18-04-2019">ARANI</a> <a href="constituency_id=809"
                    title="Date of Election 18-04-2019">CHENNAI CENTRAL</a> <a
                    href="constituency_id=807"
                    title="Date of Election 18-04-2019">CHENNAI NORTH</a> <a
                    href="constituency_id=808"
                    title="Date of Election 18-04-2019">CHENNAI SOUTH</a> <a
                    href="constituency_id=833"
                    title="Date of Election 18-04-2019">CHIDAMBARAM</a> <a
                    href="constituency_id=826"
                    title="Date of Election 18-04-2019">COIMBATORE</a> <a href="constituency_id=832"
                    title="Date of Election 18-04-2019">CUDDALORE</a> <a href="constituency_id=815"
                    title="Date of Election 18-04-2019">DHARMAPURI</a> <a href="constituency_id=828"
                    title="Date of Election 18-04-2019">DINDIGUL</a> <a href="constituency_id=823"
                    title="Date of Election 18-04-2019">ERODE</a> <a href="constituency_id=819"
                    title="Date of Election 18-04-2019">KALLAKURICHI</a> <a
                    href="constituency_id=811"
                    title="Date of Election 18-04-2019">KANCHEEPURAM</a> <a
                    href="constituency_id=846"
                    title="Date of Election 18-04-2019">KANNIYAKUMARI</a> <a
                    class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1014">KANNIYAKUMARI
                    : BYE ELECTION ON 06-04-2021</a> <a href="constituency_id=829"
                    title="Date of Election 18-04-2019">KARUR</a> <a href="constituency_id=814"
                    title="Date of Election 18-04-2019">KRISHNAGIRI</a> <a
                    href="constituency_id=839"
                    title="Date of Election 18-04-2019">MADURAI</a> <a href="constituency_id=834"
                    title="Date of Election 18-04-2019">MAYILADUTHURAI</a> <a
                    href="constituency_id=836"
                    title="Date of Election 18-04-2019">NAGAPATTINAM</a> <a
                    href="constituency_id=822"
                    title="Date of Election 18-04-2019">NAMAKKAL</a> <a href="constituency_id=825"
                    title="Date of Election 18-04-2019">NILGIRIS</a> <a href="constituency_id=831"
                    title="Date of Election 18-04-2019">PERAMBALUR</a> <a href="constituency_id=827"
                    title="Date of Election 18-04-2019">POLLACHI</a> <a href="constituency_id=842"
                    title="Date of Election 18-04-2019">RAMANATHAPURAM</a> <a
                    href="constituency_id=821"
                    title="Date of Election 18-04-2019">SALEM</a> <a href="constituency_id=838"
                    title="Date of Election 18-04-2019">SIVAGANGA</a> <a href="constituency_id=810"
                    title="Date of Election 18-04-2019">SRIPERUMBUDUR</a> <a
                    href="constituency_id=844"
                    title="Date of Election 18-04-2019">TENKASI</a> <a href="constituency_id=837"
                    title="Date of Election 18-04-2019">THANJAVUR</a> <a href="constituency_id=840"
                    title="Date of Election 18-04-2019">THENI</a> <a href="constituency_id=843"
                    title="Date of Election 18-04-2019">THOOTHUKKUDI</a> <a
                    href="constituency_id=830"
                    title="Date of Election 18-04-2019">TIRUCHIRAPPALLI</a> <a
                    href="constituency_id=845"
                    title="Date of Election 18-04-2019">TIRUNELVELI</a> <a
                    href="constituency_id=824"
                    title="Date of Election 18-04-2019">TIRUPPUR</a> <a href="constituency_id=806"
                    title="Date of Election 18-04-2019">TIRUVALLUR</a> <a href="constituency_id=816"
                    title="Date of Election 18-04-2019">TIRUVANNAMALAI</a> <a
                    href="constituency_id=813"
                    title="Date of Election 05-08-2019">VELLORE</a> <a href="constituency_id=818"
                    title="Date of Election 18-04-2019">VILUPPURAM</a> <a href="constituency_id=841"
                    title="Date of Election 18-04-2019">VIRUDHUNAGAR</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '69')"> TELANGANA </button>
            <div id="item_69" >
                <a href="state_id=69"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=848"
                    >ADILABAD</a> <a href="constituency_id=861"
                    >BHONGIR</a> <a href="constituency_id=857"
                    >CHEVELLA</a> <a href="constituency_id=856"
                    >HYDERABAD</a> <a href="constituency_id=850"
                    >KARIMNAGAR</a> <a href="constituency_id=865"
                    >KHAMMAM</a> <a href="constituency_id=864"
                    >MAHABUBABAD</a> <a
                    href="constituency_id=858"
                    >MAHBUBNAGAR</a> <a
                    href="constituency_id=854"
                    >MALKAJGIRI</a> <a href="constituency_id=853"
                    >MEDAK</a> <a href="constituency_id=859"
                    >NAGARKURNOOL</a> <a
                    href="constituency_id=860"
                    >NALGONDA</a> <a href="constituency_id=851"
                    >NIZAMABAD</a> <a href="constituency_id=849"
                    >PEDDAPALLE</a> <a href="constituency_id=855"
                    >SECUNDERABAD</a> <a
                    href="constituency_id=863"
                    >WARANGAL</a> <a href="constituency_id=852"
                    >ZAHIRABAD</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '56')"> TRIPURA </button>
            <div id="item_56" >
                <a href="state_id=56"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=867"
                    title="Date of Election 18-04-2019">TRIPURA EAST</a> <a
                    href="constituency_id=866"
                    >TRIPURA WEST</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '57')"> UTTAR PRADESH </button>
            <div id="item_57" >
                <a href="state_id=57"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=883"
                    title="Date of Election 18-04-2019">AGRA</a> <a href="constituency_id=905"
                    title="Date of Election 29-04-2019">AKBARPUR</a> <a href="constituency_id=879"
                    title="Date of Election 18-04-2019">ALIGARH</a> <a href="constituency_id=928"
                    title="Date of Election 12-05-2019">ALLAHABAD</a> <a href="constituency_id=929"
                    title="Date of Election 12-05-2019">AMBEDKAR NAGAR</a> <a
                    href="constituency_id=915"
                    title="Date of Election 06-05-2019">AMETHI</a> <a href="constituency_id=877"
                    title="Date of Election 18-04-2019">AMROHA</a> <a href="constituency_id=892"
                    title="Date of Election 23-04-2019">AONLA</a> <a href="constituency_id=935"
                    title="Date of Election 12-05-2019">AZAMGARH</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1023">AZAMGARH
                    : BYE ELECTION ON 23-06-2022 </a> <a href="constituency_id=891"
                    title="Date of Election 23-04-2019">BADAUN</a> <a href="constituency_id=873"
                    >BAGHPAT</a> <a href="constituency_id=921"
                    title="Date of Election 06-05-2019">BAHRAICH</a> <a href="constituency_id=947"
                    title="Date of Election 19-05-2019">BALLIA</a> <a href="constituency_id=916"
                    title="Date of Election 06-05-2019">BANDA</a> <a href="constituency_id=944"
                    title="Date of Election 19-05-2019">BANSGAON</a> <a href="constituency_id=919"
                    title="Date of Election 06-05-2019">BARABANKI</a> <a href="constituency_id=893"
                    title="Date of Election 23-04-2019">BAREILLY</a> <a href="constituency_id=932"
                    title="Date of Election 12-05-2019">BASTI</a> <a href="constituency_id=938"
                    title="Date of Election 12-05-2019">BHADOHI</a> <a href="constituency_id=871"
                    >BIJNOR</a> <a href="constituency_id=878"
                    title="Date of Election 18-04-2019">BULANDSHAHR</a> <a
                    href="constituency_id=949"
                    title="Date of Election 19-05-2019">CHANDAULI</a> <a href="constituency_id=943"
                    title="Date of Election 19-05-2019">DEORIA</a> <a href="constituency_id=910"
                    title="Date of Election 06-05-2019">DHAURAHRA</a> <a href="constituency_id=931"
                    title="Date of Election 12-05-2019">DOMARIYAGANJ</a> <a
                    href="constituency_id=890"
                    title="Date of Election 23-04-2019">ETAH</a> <a href="constituency_id=902"
                    title="Date of Election 29-04-2019">ETAWAH</a> <a href="constituency_id=920"
                    title="Date of Election 06-05-2019">FAIZABAD</a> <a href="constituency_id=901"
                    title="Date of Election 29-04-2019">FARRUKHABAD</a> <a
                    href="constituency_id=917"
                    title="Date of Election 06-05-2019">FATEHPUR</a> <a href="constituency_id=884"
                    title="Date of Election 18-04-2019">FATEHPUR SIKRI</a> <a
                    href="constituency_id=888"
                    title="Date of Election 23-04-2019">FIROZABAD</a> <a href="constituency_id=875"
                    >GAUTAM BUDDHA NAGAR</a> <a
                    href="constituency_id=874"
                    >GHAZIABAD</a> <a href="constituency_id=948"
                    title="Date of Election 19-05-2019">GHAZIPUR</a> <a href="constituency_id=945"
                    title="Date of Election 19-05-2019">GHOSI</a> <a href="constituency_id=923"
                    title="Date of Election 06-05-2019">GONDA</a> <a href="constituency_id=941"
                    title="Date of Election 19-05-2019">GORAKHPUR</a> <a href="constituency_id=908"
                    title="Date of Election 29-04-2019">HAMIRPUR</a> <a href="constituency_id=898"
                    title="Date of Election 29-04-2019">HARDOI</a> <a href="constituency_id=880"
                    title="Date of Election 18-04-2019">HATHRAS</a> <a href="constituency_id=906"
                    title="Date of Election 29-04-2019">JALAUN</a> <a href="constituency_id=936"
                    title="Date of Election 12-05-2019">JAUNPUR</a> <a href="constituency_id=907"
                    title="Date of Election 29-04-2019">JHANSI</a> <a href="constituency_id=869"
                    >KAIRANA</a> <a href="constituency_id=922"
                    title="Date of Election 06-05-2019">KAISERGANJ</a> <a href="constituency_id=903"
                    title="Date of Election 29-04-2019">KANNAUJ</a> <a href="constituency_id=904"
                    title="Date of Election 29-04-2019">KANPUR</a> <a href="constituency_id=918"
                    title="Date of Election 06-05-2019">KAUSHAMBI</a> <a href="constituency_id=897"
                    title="Date of Election 29-04-2019">KHERI</a> <a href="constituency_id=942"
                    title="Date of Election 19-05-2019">KUSHI NAGAR</a> <a
                    href="constituency_id=934"
                    title="Date of Election 12-05-2019">LALGANJ</a> <a href="constituency_id=913"
                    title="Date of Election 06-05-2019">LUCKNOW</a> <a href="constituency_id=937"
                    title="Date of Election 12-05-2019">MACHHLISHAHR</a> <a
                    href="constituency_id=940"
                    title="Date of Election 19-05-2019">MAHARAJGANJ</a> <a
                    href="constituency_id=889"
                    title="Date of Election 23-04-2019">MAINPURI</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1024">MAINPURI
                    : BYE ELECTION ON 05-12-2022</a> <a href="constituency_id=881"
                    title="Date of Election 18-04-2019">MATHURA</a> <a href="constituency_id=872"
                    >MEERUT</a> <a href="constituency_id=951"
                    title="Date of Election 19-05-2019">MIRZAPUR</a> <a href="constituency_id=899"
                    title="Date of Election 29-04-2019">MISRIKH</a> <a href="constituency_id=912"
                    title="Date of Election 06-05-2019">MOHANLALGANJ</a> <a
                    href="constituency_id=885"
                    title="Date of Election 23-04-2019">MORADABAD</a> <a href="constituency_id=870"
                    >MUZAFFARNAGAR</a> <a
                    href="constituency_id=876"
                    title="Date of Election 18-04-2019">NAGINA</a> <a href="constituency_id=927"
                    title="Date of Election 12-05-2019">PHULPUR</a> <a href="constituency_id=894"
                    title="Date of Election 23-04-2019">PILIBHIT</a> <a href="constituency_id=926"
                    title="Date of Election 12-05-2019">PRATAPGARH</a> <a href="constituency_id=914"
                    title="Date of Election 06-05-2019">RAE BARELI</a> <a href="constituency_id=886"
                    title="Date of Election 23-04-2019">RAMPUR</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1022">RAMPUR
                    : BYE ELECTION ON 23-06-2022 </a> <a href="constituency_id=952"
                    title="Date of Election 19-05-2019">ROBERTSGANJ</a> <a
                    href="constituency_id=868"
                    >SAHARANPUR</a> <a href="constituency_id=946"
                    title="Date of Election 19-05-2019">SALEMPUR</a> <a href="constituency_id=887"
                    title="Date of Election 23-04-2019">SAMBHAL</a> <a href="constituency_id=933"
                    title="Date of Election 12-05-2019">SANT KABIR NAGAR</a> <a
                    href="constituency_id=896"
                    title="Date of Election 29-04-2019">SHAHJAHANPUR</a> <a
                    href="constituency_id=930"
                    title="Date of Election 12-05-2019">SHRAWASTI</a> <a href="constituency_id=911"
                    title="Date of Election 06-05-2019">SITAPUR</a> <a href="constituency_id=925"
                    title="Date of Election 12-05-2019">SULTANPUR</a> <a href="constituency_id=900"
                    title="Date of Election 29-04-2019">UNNAO</a> <a href="constituency_id=950"
                    title="Date of Election 19-05-2019">VARANASI</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '61')"> UTTARAKHAND </button>
            <div id="item_61" >
                <a href="state_id=61"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=956"
                    >ALMORA</a> <a href="constituency_id=955"
                    >GARHWAL</a> <a href="constituency_id=958"
                    >HARIDWAR</a> <a href="constituency_id=957"
                    >NAINITAL-UDHAMSINGH NAGAR</a> <a
                    href="constituency_id=954"
                    >TEHRI GARHWAL</a>
            </div>
        </div>
    </div>
    <div class="state">
        <div class="constituency">
            <button class="state-btn"
                onclick="handle_dropdown('item', '58')"> WEST BENGAL </button>
            <div id="item_58" >
                <a href="state_id=58"
                    > ALL CONSTITUENCIES </a>
                <a href="constituency_id=960"
                    >ALIPURDUARS</a> <a
                    href="constituency_id=984"
                    title="Date of Election 06-05-2019">ARAMBAG</a> <a href="constituency_id=975"
                    title="Date of Election 29-04-2019">ASANSOL</a> <a class="w3-button w3-white w3-mobile w3-small"
                    href="https://www.myneta.info/LokSabha2019/constituency_id=1020">ASANSOL
                    : BYE ELECTION ON 12-04-2022</a> <a href="constituency_id=969"
                    title="Date of Election 29-04-2019">BAHARAMPUR</a> <a href="constituency_id=964"
                    title="Date of Election 23-04-2019">BALURGHAT</a> <a href="constituency_id=978"
                    title="Date of Election 06-05-2019">BANGAON</a> <a href="constituency_id=992"
                    title="Date of Election 12-05-2019">BANKURA</a> <a href="constituency_id=995"
                    title="Date of Election 19-05-2019">BARASAT</a> <a href="constituency_id=974"
                    title="Date of Election 29-04-2019">BARDHAMAN DURGAPUR</a> <a
                    href="constituency_id=972"
                    title="Date of Election 29-04-2019">BARDHAMAN PURBA</a> <a
                    href="constituency_id=979"
                    title="Date of Election 06-05-2019">BARRACKPUR</a> <a href="constituency_id=996"
                    title="Date of Election 19-05-2019">BASIRHAT</a> <a href="constituency_id=977"
                    title="Date of Election 29-04-2019">BIRBHUM</a> <a href="constituency_id=993"
                    title="Date of Election 12-05-2019">BISHNUPUR</a> <a href="constituency_id=976"
                    title="Date of Election 29-04-2019">BOLPUR</a> <a href="constituency_id=959"
                    >COOCH BEHAR</a> <a
                    href="constituency_id=962"
                    title="Date of Election 18-04-2019">DARJEELING</a> <a href="constituency_id=999"
                    title="Date of Election 19-05-2019">DIAMOND HARBOUR</a> <a
                    href="constituency_id=994"
                    title="Date of Election 19-05-2019">DUM DUM</a> <a href="constituency_id=987"
                    title="Date of Election 12-05-2019">GHATAL</a> <a href="constituency_id=983"
                    title="Date of Election 06-05-2019">HOOGHLY</a> <a href="constituency_id=980"
                    title="Date of Election 06-05-2019">HOWRAH</a> <a href="constituency_id=1000"
                    title="Date of Election 19-05-2019">JADAVPUR</a> <a href="constituency_id=961"
                    title="Date of Election 18-04-2019">JALPAIGURI</a> <a href="constituency_id=967"
                    title="Date of Election 23-04-2019">JANGIPUR</a> <a href="constituency_id=997"
                    title="Date of Election 19-05-2019">JAYNAGAR</a> <a href="constituency_id=989"
                    title="Date of Election 12-05-2019">JHARGRAM</a> <a href="constituency_id=986"
                    title="Date of Election 12-05-2019">KANTHI</a> <a href="constituency_id=1001"
                    title="Date of Election 19-05-2019">KOLKATA DAKSHIN</a> <a
                    href="constituency_id=1002"
                    title="Date of Election 19-05-2019">KOLKATA UTTAR</a> <a
                    href="constituency_id=970"
                    title="Date of Election 29-04-2019">KRISHNANAGAR</a> <a
                    href="constituency_id=966"
                    title="Date of Election 23-04-2019">MALDAHA DAKSHIN</a> <a
                    href="constituency_id=965"
                    title="Date of Election 23-04-2019">MALDAHA UTTAR</a> <a
                    href="constituency_id=998"
                    title="Date of Election 19-05-2019">MATHURAPUR</a> <a href="constituency_id=990"
                    title="Date of Election 12-05-2019">MEDINIPUR</a> <a href="constituency_id=968"
                    title="Date of Election 23-04-2019">MURSHIDABAD</a> <a
                    href="constituency_id=991"
                    title="Date of Election 12-05-2019">PURULIA</a> <a href="constituency_id=963"
                    title="Date of Election 18-04-2019">RAIGANJ</a> <a href="constituency_id=971"
                    title="Date of Election 29-04-2019">RANAGHAT</a> <a href="constituency_id=982"
                    title="Date of Election 06-05-2019">SREERAMPUR</a> <a href="constituency_id=985"
                    title="Date of Election 12-05-2019">TAMLUK</a> <a href="constituency_id=981"
                    title="Date of Election 06-05-2019">ULUBERIA</a>
            </div>
        </div>
    </div>
</div>`;
    // Load HTML content using Cheerio
    const $ = cheerio.load(html);

    // Initialize an object to store constituencies by state
    const statesInformation = [];
    const constituenciesByState = {};

    // Find the <div> containing constituency information
    const constituencyDivs = $('.country .state .constituency');

    // Loop through each constituency <div>
    constituencyDivs.each((index, constituencyDiv) => {
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

      // Create an array for the state if it doesn't exist
      if (!constituenciesByState[stateName]) {
        constituenciesByState[stateName] = [];
      }

      // Loop through each constituency link within the current constituency <div>
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

      const dataFolderPath = path.join(__dirname, `/data/${stateName}`);
      if (!fs.existsSync(dataFolderPath)) {
        fs.mkdirSync(dataFolderPath);
      }
    });

    const stateFolderPath = path.join(__dirname, `/data/_stateIds`);
    if (!fs.existsSync(stateFolderPath)) {
      fs.mkdirSync(stateFolderPath);
    }
    const jsonFilePath = path.join(stateFolderPath, `statesIds.json`);
    fs.writeFileSync(jsonFilePath, JSON.stringify(statesInformation, null, 2));

    Object.entries(constituenciesByState).map(([key, value]) => {
      console.log(value);
      //  if (key === 'kerala') {
      //    scrapeConstituencies(value);
      //  }
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

async function scrapeData(state, constituencyId, constituencyFile) {
  const browser = await playwright.chromium.launch({
    headless: false,
    timeout: 300000,
  });
  const page = await browser.newPage();

  try {
    await page.goto(
      `https://www.myneta.info/LokSabha2019/index.php?action=show_candidates&constituency_id=${constituencyId}`
    );
    let html = await page.content();
    const $ = cheerio.load(html);

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

    const dataFolderPath = path.join(
      __dirname,
      `/data/${state}/${constituencyId}`
    );
    const jsonFilePath = path.join(dataFolderPath, `${constituencyFile}.json`);

    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath);
    }

    fs.writeFileSync(jsonFilePath, JSON.stringify(candidates, null, 2));
    console.log(`Data saved successfully to ${constituencyFile}.json`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

scrapeListOfConstituenciesStateWise();
//scrapeData();
