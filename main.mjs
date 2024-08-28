import express from "express";

const app = express();

app.use(express.json());

// if you do not understand the console.log, please read the documentation of the web site https://docs.click.uz/en/click-api-error/
// this code does not work, beacuse there is no database connection and user table and transaction table and etc.
// this code is just an example

// we meke a two endpoint for click payment, prepare and complate
// after then we need to add these endpoints to https://merchant.click.uz/home/service
// for example: https://yourdomain.com/v1/api/payment/prepare
// for example: https://yourdomain.com/v1/api/payment/complate
// 

app.post("/v1/api/payment/prepare", async (req, res) => {
      const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string,
      } = req.body;

      const signature = `${click_trans_id}${service_id}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`;
      const check_signat =
            crypto.createHash("md5").update(signature).digest("hex") ===
            sign_string;
      const time = new Date().getTime();
      if (action !== "0") {
            console.log({
                  error: "-3",
                  error_note: "Запрашиваемое действие не найдено",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: "-3",
                        error_note: "Запрашиваемое действие не найдено",
                  });
      }

      if (!check_signat) {
            console.log({
                  error: -1,
                  error_note: "Ошибка проверки подписи",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -1,
                        error_note: "Ошибка проверки подписи",
                  });
      }
      if (!user) {
            console.log({
                  error: -5,
                  error_note: "Заказ не найден",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -5,
                        error_note: "Заказ не найден",
                  });
      }
      if (parseInt(amount) == 0) {
            console.log({
                  error: -2,
                  error_note: "Неверная сумма оплаты",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -2,
                        error_note: "Неверная сумма оплаты",
                  });
      }
      const newTransaction = await ClickTransaction.query().insert({
            click_transaction_id: click_trans_id,
            user: user.id,
            state: "1",
            status: "waiting",
            create: time,
            merchant_prepare_id: Math.floor(
                  Math.random() * 1000000000
            ).toString(),
            amount,
            click_prepare_confirm: time,
      });
      return res
            .set({
                  headers: {
                        "Content-Type":
                              "application/x-www-form-urlencoded; charset=UTF-8",
                  },
            })
            .send({
                  click_trans_id: newTransaction.click_transaction_id,
                  merchant_trans_id: merchant_trans_id,
                  merchant_prepare_id: newTransaction.merchant_prepare_id,
                  error: 0,
                  error_note: "Success",
            });
});
app.post("/v1/api/payment/complate", async (req, res) => {
      const {
            click_trans_id,
            service_id,
            click_paydoc_id,
            merchant_trans_id,
            amount,
            action,
            error,
            error_note,
            sign_time,
            sign_string,
      } = req.body;
      // User table
      // Transaction table
      const user = await User.query().findOne({ uid: merchant_trans_id });
      const transaction = await ClickTransaction.query().findOne(
            "merchant_prepare_id",
            merchant_prepare_id
      );
      const signature = `${click_trans_id}${service_id}${process.env.CLICK_SECRET_KEY}${merchant_trans_id}${merchant_prepare_id}${amount}${action}${sign_time}`;
      const check_signat =
            crypto.createHash("md5").update(signature).digest("hex") ===
            sign_string;
      if (!transaction) {
            console.log({
                  error: -6,
                  error_note: "Не найдена транзакция",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -6,
                        error_note: "Не найдена транзакция",
                  });
      }
      if (transaction.status === "payed") {
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        click_trans_id: req.body.click_trans_id,
                        merchant_trans_id: merchant_trans_id,
                        merchant_confirm_id: transaction.click_prepare_confirm,
                        error: 0,
                        error_note: "Success",
                  });
      }
      if (transaction.state === "2") {
            console.log({
                  error: -4,
                  error_note: "Транзакция ранее была подтверждена",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -4,
                        error_note: "Транзакция ранее была подтверждена",
                  });
      }
      if (action !== "1") {
            console.log({
                  error: -3,
                  error_note: "Запрашиваемое действие не найдено",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -3,
                        error_note: "Запрашиваемое действие не найдено",
                  });
      }
      if (!check_signat) {
            console.log({
                  error: -1,
                  error_note: "Ошибка проверки подписи",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -1,
                        error_note: "Ошибка проверки подписи",
                  });
      }
      if (parseInt(amount) == 0) {
            console.log({
                  error: -2,
                  error_note: "Неверная сумма оплаты",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -2,
                        error_note: "Неверная сумма оплаты",
                  });
      }
      if (error === "-5017") {
            await ClickTransaction.query()
                  .findOne("id", transaction.id)
                  .update({
                        state: "-2",
                        status: "canceled",
                  });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -9,
                        error_note: "Нехватка средств",
                  });
      }

      if (transaction.state === "-2") {
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        error: -9,
                        error_note: "Транзакция ранее была отменена",
                  });
      }
      if (error === "0") {
            await Journal.query().insert({
                  user_id: user.id,
                  amount: transaction.amount,
                  pay_type: 2, // 2 click
                  status: 1,
            });
            const balans = user.balance + transaction.amount;
            await User.query()
                  .findOne("id", user.id)
                  .update({ balance: balans });
            await ClickTransaction.query()
                  .findOne("id", transaction.id)
                  .update({
                        state: "2",
                        perform: new Date(),
                        status: "payed",
                  });
            await Transfer.query().insert({
                  amount: transaction.amount,
                  type: 4, // payme
                  contract: null,
                  user_id: user.id,
                  reciver: user.id,
                  all: 0,
                  pay: "Click",
            });
            return res
                  .set({
                        headers: {
                              "Content-Type":
                                    "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                  })
                  .send({
                        click_trans_id: transaction.click_transaction_id,
                        merchant_trans_id: merchant_trans_id,
                        merchant_confirm_id: transaction.click_prepare_confirm,
                        error: 0,
                        error_note: "Success",
                  });
      }
});

app.listen(3000, () => {
      console.log("Server is running on port 3000");
});
