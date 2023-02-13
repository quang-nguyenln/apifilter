import APIFilter from './apiFilter.js'
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const https = require('https');
let url = "https://61c3deadf1af4a0017d990e7.mockapi.io/offers/near_by?lat=1.313492&lon=103.860359&rad=20";
const { stdin, stdout } = process;

function prompt(question) {
  return new Promise((resolve, reject) => {
    stdin.resume();
    stdout.write(question);

    stdin.on('data', data => resolve(data.toString().trim()));
    stdin.on('error', err => reject(err));
  });
}

function isValidDate(day, month, year) {
    if (day <= 0 || month <= 0 || year <= 0) {
        return false;
    }
    if (month <= 12) {
        if ([1,3,5,7,8,10,12].includes(month)) {
          return day <= 31;
        } else if ([4, 6, 9,11].includes(month)) {
          return day <= 30;
        } else {
            if (year % 4 == 0) {
                return day <= 29;
            } else {
                return day <= 28;
            }
        }
    } else {
        return false;
    }
}   

async function main() {
  try {
    let obj = {};
    https.get(url,(res) => {
        let bufferImage = Buffer.from('');
        res.on("data", (chunk) => {
            bufferImage = Buffer.concat([bufferImage, chunk]);
        });
        res.on("end", () => {
            try {
                let json = JSON.parse(bufferImage);
                obj = json;
            } catch (error) {
                console.error(error.message);
            };
        });
    }).on("error", (error) => {
        console.error(error.message);
    });
    while (true) {
      console.log("Please fill in checkin date.")
      const day = await prompt("Day: ")
      const month = await prompt("Month: ");
      const year = await prompt("Year: ");
      
      if (isValidDate(day, month, year)) {
        let filter = new APIFilter(obj, new Date(year, month - 1, day))
        filter.runFilters();
        console.log("%j", filter.getOffers());
        stdin.pause();
        return;
      } else {
        console.log("Checkin Date is invalid. Please try again!")
      }  
    }
  } catch(error) {
    console.log("There's an error!");
    console.log(error);
  }
  process.exit();
}

main();



