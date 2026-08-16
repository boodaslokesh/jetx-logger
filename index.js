const puppeteer = require('puppeteer');

const GAME_URL = "https://1wkeup.com/casino/play/v_smartsoft:jetx?sub1=20260812-0509-1293-adb8-29c740635efa&sub2=22831_aviator_game_in_net_reg";

async function startLogger() {
    console.log("Launching cloud browser session...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-127.0.6533.88/chrome-linux64/chrome',
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--disable-gpu"
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    page.on('websocket', (ws) => {
        console.log(`[WebSocket Connected]: ${ws.url()}`);
        
        ws.on('framereceived', (event) => {
            const payload = event.payload;
            if (typeof payload === 'string' && payload.length > 0) {
                if (payload.includes('coefficient') || payload.includes('multiplier') || payload.includes('x')) {
                    console.log(`[Game Packet]: ${payload}`);
                    
                    const match = payload.match(/(\d+\.\d+)x?/i);
                    if (match && match[1]) {
                        console.log(`>>> LOGGED MULTIPLIER: ${match[1]}x at ${new Date().toISOString()}`);
                    }
                }
            }
        });
    });

    console.log(`Navigating to game URL...`);
    try {
        await page.goto(GAME_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log("Successfully loaded game page. Listening for data...");
    } catch (err) {
        console.error("Navigation error:", err);
    }

    setInterval(() => {
        console.log("Cloud logger active and listening...");
    }, 60000);
}

startLogger().catch(console.error);
