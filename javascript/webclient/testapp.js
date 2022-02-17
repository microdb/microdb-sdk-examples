(function () {
  'use strict';

  var dataCache;

  var myapp = {
    baseURL: 'http://localhost',
    port: ':9002/',
    currentTable: '',
    getData: getData,

  };


  function init() {
    $(document).ready(function () {
      getTables().then(function (res) {
        myapp.Tables = res.data.Tables.sort(sortAlpha);
        for (var index = 0; index < myapp.Tables.length; index++) {
          const element = myapp.Tables[index];
          var el = document.createElement('li');
          el.innerText = element.name;
          el.addEventListener('click', OnTableNameClick, { useCapture: true });
          $('.left ul').append(el);
        }
      });
      $('#createData').on('click', function () { showDynamicForm(); });
      $('.btn-save').on('click', SaveForm);
    });
  }


  function OnTableNameClick(evt) {
    // evt.stopPropagation();
    $('.table-container').show();
    $('.dynamic-data-entry').hide();
    if (evt.target.innerText) {
      for (var index = 0; index < myapp.Tables.length; index++) {
        const element = myapp.Tables[index];
        if (element.name == evt.target.innerText) {
          myapp.currentTable = element;
        }
      }
      $('#cust-tbl thead,#cust-tbl tbody').empty();
      myapp.getData().then(onData);
    }
  }

  function getTables(opts) {
    return postMsg('tables/get', opts);
  }

  function getData(options) {
    var req = {
      table: myapp.currentTable.name
    };
    return postMsg('data/get', req);
  }

  function onData(res) {
    if (res.success) {

      if (res.data.Rows.length == 0) {
        var hdrRow = $('<tr>');
        $.each(myapp.currentTable.columns, function (idx, col) {
          hdrRow.append('<td>' + col.FormattedName + '</td>');
        });
        hdrRow.append('<td></td>');
        $('#cust-tbl thead').append(hdrRow);
      }

      if (res.data.Rows.length > 0) {
        dataCache = res.data.Rows;

        //set table header
        var datarow = dataCache[0];
        var hdrCols = Object.keys(datarow);
        var hdrRow = $('<tr>');
        $.each(hdrCols, function (idx, col) {
          var dd = myapp.currentTable.columns.find(function (e) { return e.FormattedName == col; });
          hdrRow.append('<td>' + dd.Name + '</td>');
        });
        hdrRow.append('<td></td>');
        $('#cust-tbl thead').append(hdrRow);

        for (var index = 0; index < dataCache.length; index++) {
          const datarow = dataCache[index];
          var tableDOMRow = $('<tr>');
          var columns = Object.keys(datarow);
          for (var elIdx = 0; elIdx < columns.length; elIdx++) {
            var c = datarow[columns[elIdx]];
            tableDOMRow.append('<td>' + c + '</td>');
          }
          var btn = document.createElement('BUTTON');
          btn.type = 'button';
          btn.innerText = 'edit';
          btn.setAttribute('data-id', datarow.primarykey);
          btn.addEventListener('click', OnEditBtnClick, { useCapture: true });

          var td = $('<td>');
          td.append(btn);
          tableDOMRow.append(td)
          $('#cust-tbl tbody').append(tableDOMRow);
        }
      }
    }
    else {
      var bad = res.message;
    }


  }

  function OnEditBtnClick(evt) {
    if (evt.target) {
      var id = evt.target.getAttribute('data-id');
      showDynamicForm(id);
    }
  }

  function showDynamicForm(id) {

    $('.dynamic-data-entry .form').empty();
    $('.table-container').hide();
    $('.dynamic-data-entry').show();

    if (id) {
      //is edit
      $('.dynamic-data-entry .tblname').text('Edit row in ' + myapp.currentTable.name);
      const datarow = dataCache.find(function (e) { return e.primarykey == id; });
      var columns = Object.keys(datarow);
     
      for (var index = 0; index < columns.length; index++) {

        var formField = $('<div>');
        var lbl = document.createElement('LABEL');
        lbl.innerText = myapp.currentTable.columns.find(function (e) { return e.FormattedName == columns[index]; }).Name;
        formField.append(lbl);

        var datavalueFieldType;
        datavalueFieldType = document.createElement('input');
        datavalueFieldType.type = 'text';
        datavalueFieldType.value = datarow[columns[index]];
         if (columns[index] == 'primarykey') {
          datavalueFieldType.readOnly=true;
          datavalueFieldType.disabled=true;
        }

        datavalueFieldType.setAttribute('data-columnname', columns[index]);
        formField.append(datavalueFieldType);
        $('.dynamic-data-entry .form').append(formField);
      }
    }
    else {
      // is new
      $('.dynamic-data-entry .tblname').text('Add data to ' + myapp.currentTable.name);
      for (var index = 0; index < myapp.currentTable.columns.length; index++) {
        const column = myapp.currentTable.columns[index];
        if (column.FormattedName == 'primarykey') {
          continue;
        }

        var formField = $('<div>');
        var lbl = document.createElement('LABEL');
        lbl.innerText = column.Name;
        formField.append(lbl);

        var datavalueFieldType;
        switch (column.DataType) {
          case 'datetime':
            datavalueFieldType = document.createElement('input');
            datavalueFieldType.type = 'datetime-local';
            break;
          default:
            datavalueFieldType = document.createElement('input');
            datavalueFieldType.type = 'text';
            break;
        }

        datavalueFieldType.setAttribute('data-columnname', column.FormattedName);

        formField.append(datavalueFieldType);
        $('.dynamic-data-entry .form').append(formField);
      }
    }



  }

  function SaveForm() {
    var req = {
      table: myapp.currentTable.name,
      data: []
    };

    $('.dynamic-data-entry .form input').each(function (idx, ele) {
      req.data.push({
        column: $(ele).attr('data-columnname'),
        value: $(ele).val()
      });
    });
    saveData(req);
    
  }

  function saveData(options) {
    return postMsg('data/save', options);
  }

  
  function postMsg(route, data) {

    return new Promise((resolve) => {

      var data_url = myapp.baseURL + myapp.port + route;
      var contentType = "application/json;charset=UTF-8";
      var Request = {
        'data': data
      };
      var xhr = new XMLHttpRequest();
      xhr.open('POST', data_url, true);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.onload = function (e) {
        if (this.status === 200) {
          // res.data = JSON.parse(this.response);
          // res.success = res.data.success;
          resolve(JSON.parse(this.response));
        }
        else {
          if (this.response) {
            resolve(JSON.parse(this.response));
          }
          else {
            var res = new Response();
            res.success = false;
            resolve(res);
          }
        }
      };

      xhr.onerror = function (e) {
        res.success = false;
        res.message = xhr.statusText;
        res.data = this.response ? JSON.parse(this.response) : '';
        resolve(res);
      };

      xhr.send(JSON.stringify(Request));

    });
  }

  function Response(response) {
    this.success;
    this.error;
    this.message = '';
    this.data = '';

    if (response) {
      this.success = response.success;
      this.error = response.error;
    }
  }

  function sortAlpha(a, b) {
    if (a.name.toLowerCase() > b.name.toLowerCase()) {
      return 1;
    }
    if (a.name.toLowerCase() < b.name.toLowerCase()) {
      return -1;
    }
    return 0;
  }

  init();



})();

