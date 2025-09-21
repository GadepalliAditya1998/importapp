function generateXML(headers, data) {
  let xml = "<root>\n";

  // Add headers as XML elements
  xml += "  <headers>\n";
  headers.forEach((header) => {
    xml += `    <header>${header}</header>\n`;
  });
  xml += "  </headers>\n";

  // Add data rows as XML elements
  xml += "  <rows>\n";
  data.forEach((row) => {
    xml += "    <row>\n";
    row.forEach((cell, index) => {
      xml += `      <column${index}>${cell ?? ""}</column${index}>\n`;
    });
    xml += "    </row>\n";
  });
  xml += "  </rows>\n";
  xml += "</root>";

  return xml;
}

export { generateXML };