## gladtidings 


# api key 

15b9d00abc71f46bb29f6a407683655b3ced3c5d


Data

POST

BuyData
https://www.gladtidingsdata.com/v2/api/data/
AUTHORIZATION
OAuth 2.0
Body
raw (json)
json
{
    "network": 4,
    "mobile_number": "07013145679",
    "plan": 476,
    "Ported_number":true
}




Example request


curl --location 'https://www.gladtidingsdata.com/api/data/' \
--data '{
    "network": 1,
    "mobile_number": "08031234567",
    "plan": 353,
    "Ported_number":true,
    "ident": "Data12345678901234567890"
}'



Example response


{
  "id": 102914237,
  "ident": "Data12345678901234567890",
  "network": 1,
  "balance_before": "20176.49999999992",
  "payment_medium": "MTN SME2 DATA BALANCE",
  "balance_after": "20175.49999999992",
  "mobile_number": "0806232*******",
  "plan_type": "SME2",
  "duration": "30 days",
  "plan": 353,
  "client_ip": "197.210.71.206",
  "Status": "successful",
  "api_response": "Dear Customer, You have successfully shared 1000MB Data to 234806232437934. Your new Corporate Gifting data balance is 77191.21GB expires 17/10/2024. Thank you.",
  "plan_network": "MTN",
  "plan_name": "1.0GB",
  "plan_amount": "1.0",
  "create_date": "2024-09-10T10:47:01.643585",
  "Ported_number": true
}

