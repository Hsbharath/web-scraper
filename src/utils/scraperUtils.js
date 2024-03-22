function extractStateId(onclickAttribute) {
  const stateId = onclickAttribute.match(/'(\d+)'/);
  return stateId[1];
}

function extractConstituencyId(hrefAttribute) {
  const regex = /constituency_id=(\d+)/;
  const match = hrefAttribute.match(regex);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

function extractAmount(str) {
  // Use regex to match the numerical value
  const match = str.match(/Rs\s*([\d,]+)\s*~/);

  if (match && match[1]) {
    // Remove commas from the matched value and convert it to a number
    const amount = Number(match[1].replace(/,/g, ''));
    return amount;
  } else {
    return null; // Return null if no match found
  }
}

module.exports = { extractStateId, extractConstituencyId, extractAmount };
