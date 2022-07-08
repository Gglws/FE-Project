## Description
* Crypto simulator is a website that allows you to simulate purchasing cryptocurrencies with fake cash. This lets you manage your portfolio and view profits as the crypto markets fluctuates. 

## Key Features
* User enters the amount of cash they'd like to start with.
* Search bar searches market for crypto.
* User can buy or sell crypto.
* Bought crypto appears in user's wallet.
* Update button fetches current crypto prices and calculates profit.
* Save/load feature allows user to save wallet and reload upon next visit.

## Lessons Learned
* A lot of CSS styling to get page to work properly. How things are positioned (fixed/absolute) and sized (px vs %) affects how it looks on different sized screens or when the window is resized. 
* $.get request do not work well inside loops, as the loop keeps going without waiting for the request to finish. 