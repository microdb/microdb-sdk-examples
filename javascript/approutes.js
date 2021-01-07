var
  common = require('./common'),
  microdb = require('microdb-api')(process.env.MICRODB_APIKEY)
;

function init(app) {
  app.get('/', homepage);
  app.post('/tables/get', OnTablesGet);
  app.post('/data/get', OnGet);
  app.post('/data/save', OnSave);
}

function homepage(req, res) {
  res.render('index');
}


function OnTablesGet(req, res, next) {
  if (microdb.Init) {
    var response = new common.response();
     microdb.getTables().then(function (tbRes) {
      response.data = { Tables: tbRes };
      res.status(200).send(response);
    });
  }
}

function OnGet(req, res, next) {
  //example
  // microdb.Tables.customers.get({ pageSize: 100 }).then(onGetCustomers);

  //here we are accepting the table passed in from the client
  microdb.Tables[req.body.data.table].get({ pageSize: 100 }).then(onData);
  
  function onData(gcRes) {
    if (gcRes.success) {
      res.status(200).send(gcRes);
    }
    else {
      var response = new common.response();
      //var server_msg = gcRes.message; // log if needed
      response.message = 'request did not succeed';
      res.status(200).send(response);
    }
  }
}

// here we are accepting whatever the client is passing in to save
function OnSave(req, res, next) {
  var row ={};
  var columns = req.body.data.data;
  for (var i = 0; i < columns.length; i++) {
    var key = columns[i].column;
    var value = columns[i].value;
    row[key] = value;
  }

  microdb.Tables[req.body.data.table].saveNew(row).then(onSaveData);

  function onSaveData(gcRes) {
    if (gcRes.success) {
      res.status(200).send(gcRes);
    }
    else {
      var response = new common.response();
      response.message = 'request did not succeed';
      res.status(200).send(response);
    }
  }
}


exports.init = init;