

function response(response) {

  this.success;
  this.error;
  this.message = '';

  if (response) {
    this.success = response.success;
    this.error = response.error;
  }
}

module.exports=response;
