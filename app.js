//creates user object to keep track of money in different forms the user has
let user = {
  cashAmount: 100000,
  totalCoinValue: 0,
  coinPurse: {},
};

//keeps current crypto values
let coinPrices = {};

let saveObj = {};

let startingAmount = 0;

//search bar
const $userForm = $("#user-section");

//returns result aftet search
$userForm.submit((event) => {
  event.preventDefault();

  $("#result-container").empty();
  $("#result-container").hide();

  searchText = $('input[name="search"]').val();
  searchText = searchText.toLowerCase();

  //access API
  $.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${searchText}&vs_currencies=usd`,
    function (data) {
      var coinName = capitalizeFirstLetter(searchText);

      if (data[`${searchText}`] == undefined) {
        alert("No coin found");
      } else {
        //replace lowercase coin name with uppercase
        if (`${searchText}` !== `${coinName}`) {
          Object.defineProperty(
            data,
            `${coinName}`,
            Object.getOwnPropertyDescriptor(data, `${searchText}`)
          );
          delete data[`${searchText}`];
        }

        coinPrices[coinName] = data[`${coinName}`]["usd"];

        //creates result elements to display on screen
        $resultCard = $("<span> </span>").addClass("result-card");

        $("<h2></h2>")
          .addClass("coin-title")
          .text("Name: " + coinName)
          .appendTo($resultCard);

        var tempNum = data[`${coinName}`]["usd"].toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });

        $("<h3></h3>")
          .addClass("coin-price")
          .text("Price: " + tempNum)
          .appendTo($resultCard);

        $("<h3></h3>")
          .addClass("coinAmount")
          .text("Amount held: " + getAmountHeld(coinName))
          .appendTo($resultCard);

        $btns = $("<div></div>")
          .addClass("btnContainer2")
          .appendTo($resultCard);

        $("<button></button>")
          .text("X")
          .click(() => {
            $("#result-container").hide();
          })
          .addClass("exitBtn")
          .appendTo($resultCard);

        $("<button></button>")
          .addClass("buyButton")
          .text("Buy")
          .click(() => {
            buyFunction(data, coinName);
          })
          .appendTo($btns);

        $("<button></button>")
          .addClass("sellButton")
          .text("Sell")
          .click(() => {
            sellFunction(data, coinName);
          })
          .appendTo($btns);

        $resultCard.appendTo($("#result-container"));
        $("#result-container").show();
      }
    }
  );
});

//buy button functionality
let buyFunction = (data, name) => {
  let buyAmount = Number(prompt("How many would you like to buy?"));

  if (isNaN(buyAmount)) {
    alert("Please enter a number.");
  } else {
    if (buyAmount * data[`${name}`]["usd"] > user.cashAmount) {
      alert("Sorry, you're broke.");
    } else {
      user.cashAmount -= buyAmount * data[`${name}`]["usd"];

      if (user.coinPurse[name] === undefined) {
        user.coinPurse[name] = buyAmount;
        $(".coinAmount").text("Amount held: " + user.coinPurse[name]);
      } else {
        user.coinPurse[name] += buyAmount;
        $(".coinAmount").text("Amount held: " + user.coinPurse[name]);
      }
    }

    updateWallet();
  }
};

//sell button functionality
let sellFunction = (data, name) => {
  if (user.coinPurse[name] === undefined) {
    alert("Sorry, you do not have any to sell.");
    return;
  }

  let sellAmount = Number(prompt("How many would you like to sell?"));

  if (isNaN(sellAmount)) {
    alert("Please enter a number.");
  } else {
    if (sellAmount > user.coinPurse[name]) {
      alert("Sorry, you do not have that much to sell.");
    } else {
      user.coinPurse[name] -= sellAmount;
      user.cashAmount += sellAmount * data[`${name}`]["usd"];
      $(".coinAmount").text("Amount held: " + user.coinPurse[name]);
    }

    updateWallet();
  }
};

//gets amount of coin currently held in wallet
let getAmountHeld = (name) => {
  if (user.coinPurse[name] === undefined) {
    return 0;
  } else {
    return user.coinPurse[name];
  }
};

//updates cash amount in wallet
let updateWallet = () => {
  cashText = $("#cash");
  cashText.text(
    "Cash: " +
      user.cashAmount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
  );

  //inner wallet displays coins owned
  $("#innerWallet").empty();
  for (const key in user.coinPurse) {
    if (user.coinPurse[key] !== 0) {
      let value = user.coinPurse[key] * coinPrices[key];
      value = value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      let each = coinPrices[key];
      each = each.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
      $("<h4></h4>")
        .text(
          `${key} | Held: ${user.coinPurse[key]} | Value: ${value} (Each: ${each})`
        )
        .on("click", () => {
          pullUpCrypto(key);
        })
        .appendTo("#innerWallet");
    }
  }

  updateCoinTotal();
};

//capitalize first letter to prevent search issues/improve look
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//updates total coin value
let updateCoinTotal = () => {
  user.totalCoinValue = 0;
  for (const key in user.coinPurse) {
    user.totalCoinValue += user.coinPurse[key] * coinPrices[key];
  }

  cryptoCashText = $("#cryptoCash");
  cryptoCashText.text(
    "Total Coin Value: " +
      user.totalCoinValue.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
  );

  updateProfit();
};

//updates profit
let updateProfit = () => {
  profitText = $("#profit");
  var profit = user.cashAmount + user.totalCoinValue - startingAmount;

  if (profit < 0) {
    $(profitText).css("color", " red");
  } else if (profit > 0) {
    $(profitText).css("color", "green");
  } else {
    $(profitText).css("color", "black");
  }

  profit = profit.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  profitText.text(`Profit: ${profit}`);
};

//gets list of top 250 coins and searches in list for current coins in wallet
//updates new prices
$("#update").on("click", () => {
  $.get(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`,
    function (data) {
      for (const key in coinPrices) {
        newKey = key.toLowerCase();

        for (let i = 0; i < data.length; i++) {
          if (data[i]["id"] == newKey) {
            coinPrices[key] = data[i]["current_price"];
          }
        }
      }

      updateWallet();
    }
  );
});

//pulls up crypto from clicked crypto in wallet
function pullUpCrypto(key) {
  $('input[name="search"]').val(key);
  $userForm.submit();
}

//saves input name to save obj with user and coinprices objs
$("#save").on("click", () => {
  var result = prompt("Enter a name");

  if (result === null || result.length === 0) {
  } else {
    result = result.toLowerCase();

    saveObj[result] = [user, coinPrices, startingAmount];

    localStorage.setItem("saveObj", JSON.stringify(saveObj));
  }
});

//loads input name
$("#load").on("click", () => {
  var result = prompt("Enter a name");
  if (result === null || result.length === 0) {
  } else {
    result = result.toLowerCase();

    const retrievedObj = JSON.parse(localStorage.getItem("saveObj"));

    if (retrievedObj[result] === undefined) {
      alert("No save found for given name.");
    } else {
      user = retrievedObj[result][0];
      coinPrices = retrievedObj[result][1];
      startingAmount = retrievedObj[result][2];
    }

    $("#update").click();
  }
});

//refresh page
$('#restart').on('click', () => {
  window.location.reload();
})

//inital page setup 
function start() {
  startingAmount = Number(prompt("Please enter a starting amount"));
  if (isNaN(startingAmount)) {
    alert("Please enter a number");
    start();
  } else {
    user.cashAmount = startingAmount;
  }

  updateWallet();
}

start();
