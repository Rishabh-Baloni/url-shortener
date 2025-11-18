module.exports = {
  $randomString,
  $randomNumber
};

function $randomString() {
  return Math.random().toString(36).substring(2, 15);
}

function $randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
