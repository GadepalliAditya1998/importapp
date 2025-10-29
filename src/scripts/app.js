let transformedData = [];
const fileDataMap = new Map();
const fileColumnsMap = new Map();
var currentStep = 0;

var infoArchiveGenerator;

document
  .getElementById("excelFile")
  .addEventListener("change", onUploadSuccess);

function onUploadSuccess(event) {
  document.getElementById("loadingOverlay").style.display = "flex";
  const fileInput = document.getElementById("excelFile");
  const fileNamesUl = document.getElementById("fileNames");

  fileNamesUl.innerHTML = ""; // Clear previous file names
  fileDataMap.clear(); // Clear previous data
  fileInput.style.display = "none"; // Hide file input after upload

  handleFile(event);
}

function handleFile(e) {
  const files = e.target.files;
  if (!files.length) return;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Process each sheet in the workbook
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract headers and rows
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        fileColumnsMap.set(file.name, headers); // Store headers for this file

        // Generate XML
        // const xmlOutput = generateXML(headers, rows);
        // console.log(xmlOutput); // For demonstration, log the XML output

        onFileReadSuccess();
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

function onFileReadSuccess() {
  document.getElementById("loadingOverlay").style.display = "none";
  const importWizard = document.getElementById("importWizard");
  const wizardContainer = document.getElementById("wizardContainer");

  importWizard.style.display = "block"; // Show the wizard container

  // Show wizard container
  wizardContainer.classList.remove("wizard-container-hidden");
  wizardContainer.classList.add("wizard-container-visible");
}

function generateXML(fileName, headers, rows, transformConfig) {
  let xml = transformConfig?.rootTag
    ? `<${transformConfig.rootTag}>\n`
    : "<root>\n";
    const tableName = fileName.split('.')[0];
  xml+=`<${tableName}>\n`;
  rows.forEach((row) => {
    xml += transformConfig?.rowTag
      ? `  <${transformConfig.rowTag}>\n`
      : "  <row>\n";
    if (transformConfig) {
      const macroRegex = /\{\{(.*?)\}\}/g;
      
      xml+= transformConfig.xml.replace(macroRegex, (match, p1) => {
          const macroIdx = headers.indexOf(p1.trim());
          return macroIdx !== -1 ? ((row[macroIdx] ?? "")) : match;
        });
      // headers.forEach((header, index) => {
      //   xml += `    <${header}>${row[index] ?? ""}</${header}>\n`;
      // });
      xml += transformConfig?.rowTag
        ? `  </${transformConfig.rowTag}>\n`
        : "  </row>\n";
    }
  });
  xml+=`</${tableName}>\n`;
  xml += transformConfig?.rootTag ? `</${transformConfig.rootTag}>` : "</root>";
  return xml;
}

document.getElementById("excelFile").addEventListener("change", function (e) {
  const files = Array.from(e.target.files);
  const fileNamesUl = document.getElementById("fileNames");
  fileNamesUl.innerHTML = "";
  fileDataMap.clear();

  // Enable Proceed button if files are uploaded
  document.getElementById("proceedBtn").disabled = files.length === 0;

  files.forEach((file, idx) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, {
        type: "array",
        cellDates: true,
        // cellNF: true,
        // cellText: false,
      });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
      });
      fileDataMap.set(file.name, jsonData);
    };
    reader.readAsArrayBuffer(file);

    const li = document.createElement("li");
    li.setAttribute("title", file.name);
    li.textContent = file.name;
    li.dataset.index = idx;
    li.addEventListener("click", function () {
      document.getElementById("sheetPreview").style.display = "none";
      Array.from(fileNamesUl.children).forEach((el) =>
        el.classList.remove("selected")
      );
      li.classList.add("selected");
      showPreview(file.name);
    });
    fileNamesUl.appendChild(li);
  });

  document.getElementById("sheetPreview").textContent =
    "Select a file to preview";
});

function showPreview(fileName) {
  const previewDiv = document.getElementById("virtualPreview");
  const data = fileDataMap.get(fileName);
  if (!data || !data.length) {
    previewDiv.textContent = "No data found in this file.";
    return;
  }

  const rowHeight = 32; // px
  const totalRows = data.length - 1; // Exclude header
  const visibleRows = Math.ceil(previewDiv.clientHeight / rowHeight);

  // Clear previous content
  previewDiv.innerHTML = "";
  previewDiv.style.position = "relative";

  // Spacer for scroll height
  const spacer = document.createElement("div");
  spacer.style.height = totalRows * rowHeight + "px";
  spacer.style.width = "100%";
  previewDiv.appendChild(spacer);

  // Table structure (absolute positioned)
  const table = document.createElement("table");
  table.style.position = "absolute";
  table.style.top = "0";
  table.style.left = "0";
  table.style.right = "0";
  table.style.width = "100%";

  // Table head
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  data[0].forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Table body
  const tbody = document.createElement("tbody");
  tbody.id = "virtualTbody";
  table.appendChild(tbody);

  previewDiv.appendChild(table);

  function renderRows(start) {
    tbody.innerHTML = "";
    for (let i = start; i < Math.min(start + visibleRows, totalRows + 1); i++) {
      const row = data[i + 1];
      const tr = document.createElement("tr");
      tr.style.height = rowHeight + "px";
      data[0].forEach((_, idx) => {
        const td = document.createElement("td");
        td.textContent = row ? convertToXMLSafeString(row[idx] ?? "") : "";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    table.style.transform = `translateY(${start * rowHeight}px)`;
  }

  // Initial render
  let startRow = 0;
  renderRows(startRow);

  // Scroll handler
  previewDiv.onscroll = function () {
    const scrollTop = previewDiv.scrollTop;
    startRow = Math.floor(scrollTop / rowHeight);
    renderRows(startRow);
  };
}

document.getElementById("proceedBtn").addEventListener("click", function () {
  // Hide wizard view, show transform view

  document.getElementById("fileUploadView").style.display = "none";
  document.getElementById("transformView").style.display = "none";
  document.getElementById("generateView").style.display = "none";

  currentStep++;

  const elements = document.getElementsByClassName("tab-btn");

  for (let index = 0; index < elements.length; index++) {
    if (index == currentStep) {
      elements[index].classList.add("active");
      elements[index].disabled = false;
    } else {
      elements[index].classList.remove("active");
      elements[index].disabled = true;
    }
  }

  switch (currentStep) {
    case 0:
      document.getElementById("wizardContainer").style.display = "block";
      break;
    case 1:
      document.getElementById("transformView").style.display = "block";
      // Copy file names to transformFileNames
      const fileNamesUl = document.getElementById("fileNames");
      const transformFileNamesUl =
        document.getElementById("transformFileNames");
      transformFileNamesUl.innerHTML = "";
      Array.from(fileNamesUl.children).forEach((li) => {
        const clone = li.cloneNode(true);
        // Remove any preview click handler for now
        clone.onclick = function (event) {
          event.target.classList.add("selected");
          onTransformViewFileClicked(event.target.textContent);
        };
        transformFileNamesUl.appendChild(clone);
      });
      break;
    case 2:
      document.getElementById("generateView").style.display = "block";
      // Load generate options or UI here
      break;
  }
});

// Generate & Download XML on button click
document
  .getElementById("generateXmlBtn")
  .addEventListener("click", function () {
    if(fileDataMap.size===0){
      alert("No files uploaded.");
      return;
    }

    const isInfoArchiveChecked = document.getElementById("chkGenerateInfoArchive").checked;
    infoArchiveGenerator = null;
    if (isInfoArchiveChecked) {
      const dbName = document.getElementById("dbNameInput").value.trim();
      if (!dbName) {
        alert("Please enter a valid Database Name for InfoArchive schema.");
        return;
      }

      tranformFileConfiguration.forEach(c=> {
        c.rootTag = dbName ?? 'root';
      });

      const isCaseInsensitive =
        document.getElementById("chkCaseInsensitive").checked;
      const isValidateOnIngest = document.getElementById(
        "chkvalidateOnIngest"
      ).checked;

      let metaData = {
        caseSensitive: isCaseInsensitive,
        validateOnIngest: isValidateOnIngest,
        locale: "en-US",
      };
      
      let tableDataList = {};

      fileDataMap.forEach((data, fileName) => {
        let tableName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
        const headers = data[0];
        const rows = data.slice(1);

        let columnLengths = getColumnMaxStringLengths(headers, rows);

        tableDataList[tableName] = {
          recordCount: rows.length,
          columns: headers.map(header => {
            return {
              name: header,
              type: 'NVARCHAR',
              length: Math.min(Math.max(columnLengths[header], 1), 4096),
              scale: 0
            }
          }),
        };
      });

      infoArchiveGenerator = new InfoArchiveGenerator(dbName, metaData, tableDataList);
      let infoArchiveSchema = infoArchiveGenerator.generateInfoArchiveSchema();
      console.log("Generated InfoArchive Schema:", infoArchiveSchema);

      const fileName = `InfoArchiveSchema - ${dbName} - ${new Date().toISOString()}.xml`;
      const blob = new Blob([infoArchiveSchema], { type: "text/xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName.replace(/\.[^/.]+$/, "")}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const format = "xml";

    fileDataMap.keys().forEach((key) => {
      const fileName = key;
      const data = fileDataMap.get(fileName);
      let content = "";
      let ext = "";
      if (format === "xml") {
        const headers = data[0];
        const rows = data.slice(1);
        content = generateXML(
          fileName,
          headers,
          rows,
          tranformFileConfiguration.get(fileName)
        );
        ext = "xml";

        const blob = new Blob([content], { type: "text/xml" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName.replace(/\.[^/.]+$/, "")}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });

    // const selectedLi = document.querySelector("#fileNames li.selected");
    // if (!selectedLi) {
    //   alert("Please select a file to export.");
    //   return;
    // }
    // const fileName = selectedLi.textContent;
    // const data = fileDataMap.get(fileName);
    // if (!data || !data.length) {
    //   alert("No data found in selected file.");
    //   return;
    // }
    
    
    // Future: add other formats here

    // Trigger download
  });

function showTransformHeaders(fileName) {
  const previewDiv = document.getElementById("transformSheetPreview");
  previewDiv.innerHTML = ""; // Clear previous

  const data = fileDataMap.get(fileName);
  if (!data || !data.length) {
    previewDiv.textContent = "No data found in this file.";
    return;
  }

  // Create headers section
  const headersSection = document.createElement("div");
  headersSection.innerHTML = "<h5>Sheet Columns</h5>";
  const headersList = document.createElement("ul");
  headersList.style.display = "flex";
  headersList.style.gap = "12px";
  headersList.style.flexWrap = "wrap";
  headersList.style.padding = "0";
  headersList.style.listStyle = "none";

  data[0].forEach((header) => {
    const li = document.createElement("li");
    li.textContent = header;
    li.style.background = "#f3f3f3";
    li.style.padding = "6px 12px";
    li.style.borderRadius = "4px";
    li.style.marginBottom = "4px";

    li.addEventListener("click", function () {
      insertMacro(`{{${header}}}`);
    });
    headersList.appendChild(li);
  });

  headersSection.appendChild(headersList);
  previewDiv.appendChild(headersSection);

  // Optionally, add output config section here
}


function onGenerateInfoArchiveChange(event) {
  const isChecked = event.target.checked;
  if(isChecked) {
    // Show additional options for InfoArchive generation
    document.getElementById("metaOptionsContainer").classList.remove("display-none");
    document.getElementById("metaOptionsContainer").classList.add("display-block");
  } else {
    // Hide additional options for InfoArchive generation
    document.getElementById("metaOptionsContainer").classList.remove("display-block");
    document.getElementById("metaOptionsContainer").classList.add("display-none");

    infoArchiveGenerator = null;
  }
}

function getColumnMaxStringLengths(headers, rows) {
  // Returns an object: { header1: maxLength, header2: maxLength, ... }
  const maxLengths = Array(headers.length).fill(0);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < headers.length; j++) {
      const value = row[j];
      if (typeof value === "string" && value.length > maxLengths[j]) {
        maxLengths[j] = value.length;
      }
    }
  }
  // Map header to max length
  const result = {};
  headers.forEach((header, idx) => {
    result[header] = maxLengths[idx];
  });
  return result;
}

function convertToXMLSafeString(str) {
  if (typeof str !== "string") return str;
  
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}