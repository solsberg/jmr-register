const argparse = require('argparse'),
      csvparse = require('csv-parse'),
      fs = require('fs'),
      crypto = require('crypto'),
      axios = require('axios'),
      mailchimpConfig = require('./mailchimpConfig.json');

function parseArgs() {
  var parser = new argparse.ArgumentParser();
  parser.addArgument(
    '--file',
    {
      required: true,
      help: 'data file'
    }
  );
  return parser.parseArgs();
}

const FIELDS = [
  "address_1",
  "address_2",
  "city",
  "state",
  "post_code",
  "phone",
  "phone_2",
  ["date_of_birth", "DOB"]
];

function logData(data) {
  console.log(data);
}

function updateMember(data) {
  //calculate md5 hash of email
  if (!data.email) {
    console.log("Missing email for ", data);
    return;
  }

  let memberHash = crypto.createHash('md5').update(data.email.toLowerCase()).digest("hex");

  // const phone_fields = ['phone', 'phone_4', 'phone_2'];
  // let phone_values = [];
  // phone_fields.forEach(f => {
  //   if (!!data[f] && data[f].length > 0) {
  //     phone_values.push(data[f]);
  //   }
  // });
  //
  // data.phone = phone_values.length > 0 ? phone_values[0] : '';
  // data.phone_2 = phone_values.length > 1 ? phone_values[1] : '';

  axios({
    method: 'put',
    url: `https://us5.api.mailchimp.com/3.0/lists/${mailchimpConfig.LIST_ID}/members/${memberHash}`,
    auth: {
      username: 'anystring',
      password: mailchimpConfig.API_KEY
    },
    data: {
      merge_fields: FIELDS.reduce(function(obj, field) {
          let field_name, value;
          if (Array.isArray(field)) {
            field_name = field[1];
            value = data[field[0]];
          } else {
            field_name = field.toUpperCase();
            value = data[field];
          }
          if (!value) {
            value = '';
          }
          if (field_name == 'DOB' && value == '') {
            return obj;   //dont clear existing value
          }
          obj[field_name] = value;
          return obj;
        }, {})
    }
  })
  .then(() => {
    console.log("Updated data for " + data.email);
  })
  .catch(err => {
    console.log("Error updating data for " + data.email, {
      status: err.response.status,
      statusText: err.response.statusText,
      url: err.config.url,
      data: err.config.data
    });
  });
}

const args = parseArgs();
const file = args.file;
let num_processed = 0;

function forEachWithDelay(items, fn, delay) {
  let i = 0;

  const myLoop = function() {           //  create a loop function
     setTimeout(function () {    //  call a 3s setTimeout when the loop is called
        fn(items[i]);
        i++;                     //  increment the counter
        if (i < items.length) {            //  if the counter < 10, call the loop function
           myLoop();             //  ..  again which will trigger another
        }                        //  ..  setTimeout()
     }, delay);
  }
  myLoop();
}

var data = fs.readFileSync(file);

csvparse(data, {columns: true}, function(err, records){
  if (err) {
    console.log("Error: ", err)
    process.exit();
  } else {
    // records = records.slice(0, 5);
    forEachWithDelay(records, updateMember, 200);
    // Promise.all(records.map(updateMember))
    // .then(() => {
    //   process.exit();
    // })
    // .catch(err => {
    //   console.log({Error: {
    //     status: err.response.status,
    //     statusText: err.response.statusText,
    //     url: err.config.url,
    //     data: err.config.data
    //   }});
    //   process.exit();
    // })
  }
});
