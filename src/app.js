const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const cron = require("node-cron");
require('dotenv').config()

const app = express();

// TelegramBotToken
const token = "6489242894:AAEIhsjPozk452h-mZ3l9c2jJ2Oe7Ha8Gsw";
const bot = new TelegramBot(token, { polling: true });

app.use("/", (req, res) => {
   return res.send("Oke");
});

cron.schedule(
   "*/30 * * * *",
   () => {
      axios
         .get("https://api-xsmb.cyclic.app/api/v1")
         .then((res) => {
            if (res.data && res.data.countNumbers === 27) {
               const result = res?.data?.results;
               const data = {
                  time: res?.data?.time,
                  gdb: result?.ĐB[0],
                  g1: result?.G1[0],
                  g2: result?.G2.join(" ").toString(),
                  g3: result?.G3.join(" ").toString(),
                  g4: result?.G4.join(" ").toString(),
                  g5: result?.G5.join(" ").toString(),
                  g6: result?.G6.join(" ").toString(),
                  g7: result?.G7.join(" ").toString(),
               };
               const message = `XSMB ngày: ${data.time}\n---------------\nGiải đặc biệt: ${data.gdb}\nGiải nhất: ${data.g1}\nGiải nhì: ${data.g2}\nGiải ba: ${data.g3}\nGiải tư: ${data.g4}\nGiải năm: ${data.g5}\nGiải sáu: ${data.g6}\nGiải bảy: ${data.g7}`;
               bot.sendMessage(6421546016, message);
            } else {
               console.log("Server is running...");
            }
         })
         .catch((err) => {
            console.error("Đã có lỗi xảy ra: ", err);
            bot.sendMessage(6421546016, "Đã có lỗi xảy ra!");
            throw err;
         });
   },
   {
      scheduled: true,
      timezone: "Asia/Ho_Chi_Minh",
   }
);

app.listen((PORT = process.env.PORT || 3000), () => {
   console.log("App listen on PORT: ", PORT);
});


