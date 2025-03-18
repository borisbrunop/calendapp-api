function paramsValidate(validParams, body) {
  let valid = true;
  if (!body) return false;

  validParams.forEach((attr) => {
    if (!Object.prototype.hasOwnProperty.call(body, attr)) {
      valid = false;
    }
  });

  return valid ? body : valid;
}

module.exports = paramsValidate;
