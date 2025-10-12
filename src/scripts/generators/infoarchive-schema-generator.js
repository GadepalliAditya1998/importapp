class InfoArchiveGenerator {
  constructor(DBName, metaData, tableData) {
    this.DBName = DBName;
    this.metaData = metaData;
    this.tableData = tableData;
  }

  generateInfoArchiveSchema() {
    let skeletonSchema = this.generateSkeletonSchema();
    let metaDataSchema = this.generateMetaDataSchema();
    let dbLevelSchema = this.generateDBLevelSchema(metaDataSchema);
    let tableListSchema = this.generateTableListSchema(dbLevelSchema);

    return `${skeletonSchema}
            ${tableListSchema}
            `;
  }

  generateSkeletonSchema() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;
  }

  generateMetaDataSchema() {
    let result = `<metadata>`;
    for (const [key, value] of Object.entries(this.metaData)) {
      result += `<${key}>${value}</${key}>`;
    }

    result += `{{META_DATA_TABLE_LIST_PLACEHOLDER}}`;
    result += `</metadata>`;
    return result;
  }

  generateDBLevelSchema(metadata) {
    let tablesLength = Object.keys(this.tableData).length;
    let dbSchema = `
        <schemaMetadataList>
            <name>${this.DBName}</name>
            <tableCount>${tablesLength}</tableCount>
            {{TABLE_METADATA_PLACEHOLDER}}
        </schemaMetadataList>
    `;

    metadata = metadata.replace("{{META_DATA_TABLE_LIST_PLACEHOLDER}}", dbSchema);
    return metadata;
  }

  generateTableListSchema(metadata) {
    let tableMetadataSchema = "<tableMetadataList>";
    for(let table in this.tableData){
        let tableData  = this.tableData[table];
        let columns = tableData.columns;
        let tableSchema = `
            <tableMetadata>
                <name>${table}</name>
                <recordCount>${tableData.recordCount}</recordCount>
                ${this.generateTableColumnsSchema(columns)}
            </tableMetadata>
        `;

        tableMetadataSchema += tableSchema;
    }

    tableMetadataSchema += "</tableMetadataList>";

    metadata = metadata.replace("{{TABLE_METADATA_PLACEHOLDER}}", tableMetadataSchema);
    return metadata;
  }

  generateTableColumnsSchema(columnsData) {
    let columnListSchema = `<columnList>
                        `;
    let columnsLength = columnsData.length;
    for(let i = 0; i < columnsLength; i++){
        let column = columnsData[i];

        let columnSchema = `
            <column>
                <name>${column.name}</name>
                <ordinal>${i}</ordinal>
                <type>${column.type}</type>
                <typeLength>${column.length}</typeLength>
                <scale>${column.scale ?? 0}</scale>
            </column>
        `;
        columnListSchema += columnSchema;
    }

    columnListSchema += `</columnList>`;
    return columnListSchema;
  }
}
