const express = require('express');
const paypal = require('paypal-rest-sdk');

// paypal.configure({
//     'mode': 'sandbox',
//     'client_id': 'AdGZZHrgZPjV_YzULNeRaOS5CNmj-ezFIrfgYUjpk-CA_VbOgJV4Wz7C7UIpeImqlb0DOj-dvTDho9CO',
//     'client_secret': 'EGEUWTEqX9hwNceXz6D6ZgF83s3S4j8NqE4G8in9hFNWEfEO4Y6cHiHq3bXZ3aoBVXfc11OjP17R0jbu'
// });

paypal.configure({
    'mode': 'sandbox',
    'client_id': 'AUsOLyUw6REcQm_8M255-qOYJUJolmAcKLbj1BnIuOpfb_A4TEnNCCyR8Pcy14F9_niLzWY_Cmh4Aada',
    'client_secret': 'ENh5zchUjk7rAC7dy72pK4iud0HBexTNNzSJtcG7xND2exBDJ5EyGIHGfMNx8tGtz8PdDaXKHf9IWeP9'
});

const app = express();

var amt = null;

app.get('/pay/:amt', (req, res) => {

    amt = req.params.amt;

    console.log(amt);

    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": `${req.protocol}://${req.get('host')}/success`,
            "cancel_url": `${req.protocol}://${req.get('host')}/cancel`
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Buy Gold Coin",
                    "sku": "001",
                    "price": amt,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": amt
            },
            "description": "Buy gold coin"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.sendFile(__dirname + "/cancel.html");
        } else {
            for (let i = 0; i < payment.links.length; i++){
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log("payerId", payerId, "paymentId", paymentId);
    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": amt
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            res.sendFile(__dirname + "/cancel.html");
        } else {
            res.sendFile(__dirname + "/success.html");
        }
    });
});

app.get('/cancel', (req, res) => res.sendFile(__dirname + "/cancel.html"));

const PORT = process.env.PORT || 4444;

app.listen(PORT, () => console.log(`server started on ${PORT}`));