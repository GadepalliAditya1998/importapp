var tranformFileConfiguration = new Map();

function onTransformViewFileClicked(fileName) {
  const sheetHeaders = document.getElementById("sheetHeadersList");

  sheetHeaders.innerHTML = ""; // Clear previous headers
  const headers = fileColumnsMap.get(fileName);
  if (!headers || !headers.length) {
    sheetHeaders.textContent = "No headers found for this file.";
    return;
  }
  headers.forEach((header) => {
    const li = document.createElement("li");
    li.textContent = header;
    // li.addEventListener('mousedown', function (event) {
    //     event.preventDefault(); // Prevent text selection
    //     event.stopPropagation(); // Prevent click event from bubbling up
    // });
    // li.addEventListener('click', function (event) {
    //     event.preventDefault();
    //     event.stopPropagation();

    //     insertMacro(`{{${header}}}`);
    // });
    sheetHeaders.appendChild(li);
  });

  showXMLPreview(fileName);
}

function showXMLPreview(fileName) {
  const previewDiv = document.getElementById("xmlPreview");
  const data = fileDataMap.get(fileName);
  if (!data || !data.length) {
    previewDiv.textContent = "No data found in this file.";
    return;
  }

  // Clear previous content
  previewDiv.innerHTML = "";
  previewDiv.style.position = "relative";

  const dummyData = generateDummyXML(fileColumnsMap.get(fileName));

  // Create a preformatted text block for XML
  const pre = document.createElement("pre");
  // const parser = new fxparser.XMLParser();
  pre.textContent = dummyData.xml;
  pre.contentEditable = true; // Make it editable
  pre.addEventListener("input", function (event) {
    const updatedXML = event.target.textContent;
    if (tranformFileConfiguration.has(fileName)) {
      tranformFileConfiguration.get(fileName).xml = updatedXML;
    } else {
      tranformFileConfiguration.set(fileName, {
        rootTag: "root",
        rowTag: "row",
        xml: updatedXML,
      });
    }
  });
  // pre.textContent = parser.parse(dummyData);
  previewDiv.appendChild(pre);
}

function generateDummyXML(headers) {
  let xml = `
        {{row_Data}}
    `;

  let rowData = "";
  headers.forEach((header) => {
    rowData += `    <${header}>{{${header}}}</${header}>\n`;
  });

  xml = xml.replace("{{row_Data}}", rowData);
  return { xml: xml, rowData: rowData };
}

function insertMacro(text) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);

  const span = document.createElement("span");
  span.textContent = text;
  span.className = "macro";

  range.insertNode(span);
  range.collapse(false); // Move cursor after macro
}
