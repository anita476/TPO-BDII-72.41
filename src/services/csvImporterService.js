import fs from "fs";
import path from "path";
import { parse } from "csv-parse";
import { fileURLToPath } from "url";
import Cliente from "../models/Cliente.js";
import Siniestro from "../models/Siniestro.js";
import Agente from "../models/Agente.js";
import Vehiculo from "../models/Vehiculo.js";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);

// Define which model to use for each CSV file
const MODEL_MAPPING = {
  "clientes.csv": Cliente,
  "siniestros.csv": Siniestro,
  "agentes.csv": Agente,
  "vehiculos.csv": Vehiculo,
};

/**
 * Reads and parses a CSV file
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} Array of parsed records
 */
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true, // Use first row as column names
          skip_empty_lines: true,
          trim: true,
        })
      )
      //event called after csv line is read, creates an object with column names as keys
      .on("data", (record) => {
        records.push(record);
      })
      .on("end", () => {
        resolve(records);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

/**
 * Imports a single CSV file into MongoDB
 * @param {string} filePath - Path to the CSV file
 * @param {string} fileName - Name of the CSV file
 * @param {mongoose.Model} Model - Mongoose model to use for import
 */
async function importCSVFile(filePath, fileName, Model) {
  try {
    console.log(`\nImporting ${fileName}...`);

    const records = await readCSV(filePath);

    if (records.length === 0) {
      console.log(`${fileName} is empty, skipping...`);
      return;
    }

    // Clear existing data in the collection
    await Model.deleteMany({});
      try {
          await Model.collection.dropIndexes();
      } catch (indexError) {
          console.log("Could not drop indexes:", indexError.message);
      }

      // Transform records to match schema types
      const transformedRecords = records.map(record => {
          const transformed = { ...record };

          // Convert numeric fields (common to multiple models)
          if (transformed.id_cliente) transformed.id_cliente = parseInt(transformed.id_cliente);
          if (transformed.dni) transformed.dni = parseInt(transformed.dni);
          if (transformed.id_vehiculo) transformed.id_vehiculo = parseInt(transformed.id_vehiculo);
          if (transformed.anio) transformed.anio = parseInt(transformed.anio);

          // Convert boolean fields
          if (transformed.activo !== undefined) {
              transformed.activo = transformed.activo === 'True';
          }
          if (transformed.asegurado !== undefined) {
              transformed.asegurado = transformed.asegurado === 'True';
          }
          return transformed;
      });

    // Insert all records
    //TODO add insertion order
    console.log("RECORDS " , transformedRecords.length);
    const result = await Model.insertMany(transformedRecords, { ordered: false });
    console.log(`Imported ${result.length} records from ${fileName}`);
  } catch (error) {
    if (error.code === 11000) {
      console.log(`Some duplicate records skipped in ${fileName}`);
    } else {
      console.error(`Error importing ${fileName}:`, error.message);
    }
  }
}

/**
 * Imports all CSV files from the Datasets directory
 * @param {string} customPath - Optional custom path to datasets directory
 */
async function importAllCSVFiles(customPath) {
  try {
    // Use custom path if provided, otherwise use default
    const datasetsPath = customPath ? path.resolve(customPath) : null;
    if (!datasetsPath || !fs.existsSync(datasetsPath)) {
      console.log("Datasets directory not found. Skipping CSV import.");
      return;
    }
    console.log("\nStarting CSV import from:", datasetsPath);

    // Read all files in the directory
    const files = fs.readdirSync(datasetsPath);
    const csvFiles = files.filter((file) => file.endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.log("No CSV files found in Datasets directory");
      return;
    }

    console.log(
      `Found ${csvFiles.length} CSV file(s): ${csvFiles.join(", ")}\n`
    );

    // Import clientes
    const clientesFile = csvFiles.find(
      (f) => f.toLowerCase() === "clientes.csv"
    );
    if (clientesFile) {
      await importCSVFile(
        path.join(datasetsPath, clientesFile),
        clientesFile,
        Cliente
      );
    }

    // Import polizas and embed them into clientes
    const polizasFile = csvFiles.find((f) => f.toLowerCase() === "polizas.csv");
    if (polizasFile) {
      await importPolizasEmbedded(path.join(datasetsPath, polizasFile));
    }

    // Import remaining files
    for (const fileName of csvFiles) {
      if (["clientes.csv", "polizas.csv"].includes(fileName.toLowerCase())) {
        continue; // Skip already imported files
      }

      const Model = MODEL_MAPPING[fileName.toLowerCase()];
      if (!Model) {
        console.log(`No model mapping found for ${fileName}, skipping...`);
        continue;
      }

      await importCSVFile(path.join(datasetsPath, fileName), fileName, Model);
    }

    console.log("\nCSV import completed!\n");
  } catch (error) {
    console.error("Error during CSV import:", error);
  }
}
async function importPolizasEmbedded(filePath) {
  try {
    console.log(`\nImporting polizas.csv as embedded documents...`);

    const records = await readCSV(filePath);

    if (records.length === 0) {
      console.log(`polizas.csv is empty, skipping...`);
      return;
    }

    let updatedCount = 0;

    for (const poliza of records) {
      const { id_cliente, ...polizaData } = poliza;

      const result = await Cliente.updateOne(
        { id_cliente: parseInt(id_cliente) },
        { $push: { polizas: polizaData } }
      );

      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    }

    console.log(`Embedded ${updatedCount} polizas into clientes`);
  } catch (error) {
    console.error(`Error importing polizas:`, error.message);
  }
}
export { importAllCSVFiles, importCSVFile, readCSV };
