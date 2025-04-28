require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const TelegramBot = require('node-telegram-bot-api');
const nodeCron = require('node-cron');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

//Dữ liệu chính
async function getDataXSMB(chatID) {
  try {
    const response = await axios.get(process.env.XSMB_API.toString())
    const data = response.data;
    const inf = {
      num: data?.countNumbers,
      time: data?.time,
      gdb: data?.results?.ĐB[0],
      g1: data?.results?.G1[0],
      g2: data?.results?.G2.join(", ").toString(),
      g3: data?.results?.G3.join(", ").toString(),
      g4: data?.results?.G4.join(", ").toString(),
      g5: data?.results?.G5.join(", ").toString(),
      g6: data?.results?.G6.join(", ").toString(),
      g7: data?.results?.G7.join(", ").toString(),
    };
    // Xử lý và gửi dữ liệu trả về cho người dùng
    return bot.sendMessage(chatID, `Xổ số miền bắc ngày ${inf.time}:\nĐB: ${inf.gdb}\nG1: ${inf.g1}\nG2: ${inf.g2}\nG3: ${inf.g3}\nG4: ${inf.g4}\nG5: ${inf.g5}\nG6: ${inf.g6}\nG7: ${inf.g7}`);
  } catch (error) {
    console.error('Lỗi khi gọi API:', error.message);
    return bot.sendMessage(chatID, 'Xin lỗi, không thể lấy dữ liệu mới nhất. Vui lòng thử lại sau.');
  }
}

// Thiết lập danh sách các lệnh cho bot
bot.setMyCommands([
  { command: '/moinhat', description: 'Thông tin xổ số mới nhất' },
  { command: '/start', description: 'Bắt đầu sử dụng bot' },
  { command: '/menu', description: 'Hiển thị menu các lệnh' },
  // { command: '/help', description: 'Hướng dẫn sử dụng bot' },
]);

// Câu chào mừng khi người dùng bắt đầu trò chuyện với bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Xin chào! Tôi là một bot XSMB. Hãy gửi cho tôi một câu hỏi và tôi sẽ trả lời nó.');
});

// Hiển thị kết quá xổ số miền bắc mới nhất
bot.onText(/\/moinhat/, (msg) => {
  const chatId = msg.chat.id;
  getDataXSMB(chatId);
});

// Lên lịch chạy hàm getDataXSMB mỗi ngày vào lúc 18h40p hàng ngày
nodeCron.schedule('40 18 * * *', () => {
  getDataXSMB(process.env.CHAT_ID)
}, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh"
})

app.listen(port = process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + port);
});