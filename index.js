const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys")
const P = require("pino")
const chalk = require("chalk")
const figlet = require("figlet")

async function startBot() {
    console.log(chalk.green(figlet.textSync("Toxic-Hacker-MD")))
    console.log(chalk.cyan("🚀 Starting WhatsApp Bot with Pair Code...\n"))

    const { state, saveCreds } = await useMultiFileAuthState("auth_info")
    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false, // ✅ QR disable (pair code use karna hai)
        browser: Browsers.macOS("Safari"),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    // Pair Code System
    if (!state.creds.registered) {
        const phoneNumber = "92xxxxxxxxxx" // ⚠️ Apna WhatsApp number country code ke sath
        const code = await sock.requestPairingCode(phoneNumber)
        console.log(chalk.yellow(`🔑 Your Pairing Code: ${chalk.bold(code)}`))
    }

    sock.ev.on("connection.update", (update) => {
        const { connection } = update
        if (connection === "open") {
            console.log(chalk.green("✅ Bot is now connected with WhatsApp!"))
        }
    })

    // Message handler
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0]
        if (!msg.message) return
        const from = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text

        if (!text) return
        console.log(chalk.blue(`💬 ${from}: ${text}`))

        if (text.toLowerCase() === "ping") {
            await sock.sendMessage(from, { text: "pong 🏓" })
        } else if (text.toLowerCase() === "menu") {
            await sock.sendMessage(from, { text: "✨ Toxic Hacker MD Bot Menu ✨\n\n1. ping\n2. menu\n3. help" })
        } else if (text.toLowerCase() === "help") {
            await sock.sendMessage(from, { text: "🛠 Help Menu:\n- ping → pong\n- menu → show menu\n- help → this message" })
        }
    })
}

startBot()
