// require("dotenv").config();
console.log(process.env.BOT_TOKEN);

const TelegramBot = require("node-telegram-bot-api");
const { google } = require("googleapis");
// const spreadsheetId = "1Nw2cxhJ58hcbi-IRzOPO_AAbj0cVQhmPR1cUI8PNuBc";
const spreadsheetId = process.env.SPREADSHEET_ID;
// const token = "8262001392:AAG3cDvzhpPm3gwhcqbcnGVzZRgmt0_Zz_w";
//set BOT_TOKEN = "8262001392:AAG3cDvzhpPm3gwhcqbcnGVzZRgmt0_Zz_w"
const token = process.env.BOT_TOKEN;

if (!token) {
  console.log("BOT TOKEN KOSONG");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const sheetName = "Data Visit";

// GOOGLE AUTH
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Bot nyapa saat /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Halo Bayu! Bot kamu sudah aktif 🚀");
});

// bot.on("message", async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (!text) return;
//   if (msg.from.is_bot) return;

//   // Trigger: harus ada [nama]
//   if (!text.includes("[") || !text.includes("]")) return;

//   const nameMatch = text.match(/\[(.*?)\]/);
//   if (!nameMatch) return;

//   const name = nameMatch[1].trim();

//   // Tanggal otomatis
//   const now = new Date();
//   const day = now.getDate();
//   const month = now.getMonth() + 1;
//   const year = now.getFullYear();

//   const date = `${day}/${month}/${year}`;

//   // ================= INSERT KE SHEET =================

//   try {
//     // ===== CARI BARIS TERAKHIR =====

//     const getRows = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `${sheetName}!B:B`,
//     });

//     const lastRow = getRows.data.values ? getRows.data.values.length + 1 : 2;

//     // ===== LOCK KE BARIS TERTENTU =====

//     const targetRange = `${sheetName}!B${lastRow}:E${lastRow}`;

//     // ===== INSERT DATA =====

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: targetRange,
//       valueInputOption: "USER_ENTERED",
//       requestBody: {
//         values: [[date, "", "", name]],
//       },
//     });

//     // Balasan bot
//     bot.sendMessage(chatId, `✅ Tersimpan\n${name}\n${date}`);
//   } catch (error) {
//     console.error(error);
//     bot.sendMessage(chatId, "❌ Gagal simpan ke Google Sheet");
//   }
// });

// ================== MESSAGE HANDLER ==================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;
  if (msg.from.is_bot) return;

  // Trigger harus ada [nama]
  if (!text.includes("[") || !text.includes("]")) return;

  const nameMatch = text.match(/\[(.*?)\]/);
  if (!nameMatch) return;

  const name = nameMatch[1].trim();

  // Tanggal otomatis
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const date = `${day}/${month}/${year}`;

  try {
    // ===== AMBIL KOLOM B =====
    const colB = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!B:B`,
    });

    // ===== CARI BARIS KOSONG =====
    let nextRow = 2; // baris 1 header

    if (colB.data.values) {
      for (let i = 0; i < colB.data.values.length; i++) {
        if (!colB.data.values[i][0]) {
          nextRow = i + 1;
          break;
        }

        nextRow = colB.data.values.length + 1;
      }
    }

    // ===== TULIS KOLOM B (DATE) =====
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!B${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[date]],
      },
    });

    // ===== TULIS KOLOM D (NAME) =====
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!D${nextRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [["MN02391"]],
      },
    });

    // ===== BALASAN BOT =====
    bot.sendMessage(chatId, `Selamat Pagi ${name}.\nTerimakasih sudah absen`);
  } catch (err) {
    console.error(err);
    bot.sendMessage(chatId, "❌ Gagal simpan ke Google Sheet");
  }
});

console.log("BOT RUNNING...");
