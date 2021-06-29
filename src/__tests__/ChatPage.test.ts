import puppeteer, {Browser} from "puppeteer";

jest.setTimeout(30000);

let browser: Browser;

const headless: boolean = true;

beforeAll(async () => {
  browser = await puppeteer.launch({headless});
})

afterAll(async () => {
  await browser.close();
});

describe("ChatPage connection and messaging test", () => {
  it("Loads welcome page", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/", {waitUntil: 'domcontentloaded'});
    const html = await page.content();
    expect(html).toContain("Welcome to AnonComms");
  });

  it("Goes to create chat room page", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/", {waitUntil: 'domcontentloaded'});
    await page.click(".m-3.btn.btn-success");
    const html = await page.content();
    expect(html).toContain('<input placeholder="Room ID" type="text" class="form-control" value="">');
  });

  it("Goes to join chat room page", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/", {waitUntil: 'domcontentloaded'});
    await page.click("div > button:nth-of-type(2)");
    const html = await page.content();
    expect(html).toContain('<input placeholder="Room ID" type="text" class="form-control" value="">');
  });

  it("Goes to chat room page", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:3000/", {waitUntil: 'domcontentloaded'});
    await page.click(".m-3.btn.btn-success");
    const id = Math.random().toString(36).substring(5);
    await page.type(".form-control", id);
    await page.click("form > button:nth-of-type(2)");
    await page.waitForTimeout(1000);
    const html = await page.content();
    expect(html).toContain(id);
  });
})
