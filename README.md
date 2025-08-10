# Excel Import to XML

This project allows users to upload one or more Excel files, processes the data, and generates an XML output containing the sheet's column headers and the corresponding data rows.

## Project Structure

```
excel-import-xml
├── src
│   ├── index.html        # HTML structure for the application
│   ├── app.js            # Main JavaScript file for handling file uploads and processing
│   └── utils
│       └── xmlGenerator.js # Utility for generating XML from data
├── package.json          # npm configuration file
└── README.md             # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd excel-import-xml
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Open `index.html` in a web browser:**
   You can simply open the `src/index.html` file in your preferred web browser to use the application.

## Usage Guidelines

1. Click on the file input to upload one or more Excel files (.xlsx or .xls).
2. After selecting the files, the application will process the data and generate an XML output.
3. The generated XML can be downloaded or viewed as needed.

## Dependencies

- **xlsx**: A library for parsing and writing various spreadsheet formats.

## License

This project is licensed under the MIT License.