async function sleep(delaySeconds) {
  return await new Promise((resolve) => {
    setTimeout(resolve, delaySeconds * 1000);
  });
}

module.exports = { sleep };
