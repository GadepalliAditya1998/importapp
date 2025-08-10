const availableTransforms = {
    removeQuotes: { name: 'Remove Quotes', description: 'Removes all quotes from the text and replaces with blank character', function: removeQuotes },
    removeExtraSpaces: { name: 'Remove Extra Spaces', description: 'Removes extra spaces from the text and replaces with blank character', function: removeExtraSpaces },
    removeNewLines: { name: 'Remove New Lines', description: 'Removes new line characters from the text and replaces with blank character', function: removeNewLines },
    removeCommas: { name: 'Remove Commas', description: 'Removes all commas from the text and replaces with blank character', function: removeCommas }
};

function removeQuotes(str) {
    return str.replace(/"/g, '').replace(/'/g, '');
}

function removeExtraSpaces(str) {
    return str.replace(/\s+/g, '').trim();
}

function removeNewLines(str) {
    return str.replace(/[\r\n]+/g, '').trim();
}

function removeCommas(str) {
    return str.replace(/,/g, '');
}