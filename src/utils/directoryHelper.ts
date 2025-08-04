import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

interface FolderStructure {
  folderName: string;
  path: string;
  files: string[];
}

interface DirectoryStructure {
  dataPath: string;
  folders: FolderStructure[];
}

/**
 * Checks if the data directory and required subfolders exist, creates them if missing,
 * ensures nifty50list.csv exists in the broad folder, and lists all CSV files in each folder.
 * @returns Promise resolving to the directory structure
 */
export async function readAndEnsureDataDirectory(): Promise<DirectoryStructure> {
  const desktopPath = path.join(os.homedir(), "Desktop");
  const dataPath = path.join(desktopPath, "data");
  const requiredFolders = ["broad", "indice", "stock", "option"];
  const expectedFiles: { [key: string]: string[] } = {
    broad: ["nifty50list.csv"], // Static file in broad
    indice: [], // Date-based files, e.g., ind_close_all_01072025.csv
    stock: [], // Date-based files, e.g., sec_bhavdata_full_01072025.csv
    option: [], // Date-based files, e.g., op21072025.csv
  };

  try {
    // Check and create data directory
    try {
      await fs.access(dataPath);
    } catch {
      await fs.mkdir(dataPath, { recursive: true });
    }

    const folderStructure: FolderStructure[] = [];

    // Process each required folder
    for (const folder of requiredFolders) {
      const folderPath = path.join(dataPath, folder);

      // Check and create folder
      try {
        await fs.access(folderPath);
      } catch {
        await fs.mkdir(folderPath, { recursive: true });
      }

      // Ensure expected files exist for broad folder
      const files: string[] = [];
      if (expectedFiles[folder].length > 0) {
        for (const file of expectedFiles[folder]) {
          const filePath = path.join(folderPath, file);
          try {
            await fs.access(filePath);
            files.push(file);
          } catch {
            // Create empty file if it doesn't exist
            await fs.writeFile(filePath, "");
            files.push(file);
          }
        }
      }

      // List all CSV files in the folder
      const folderFiles = await fs.readdir(folderPath);
      const csvFiles = folderFiles.filter((file) => file.endsWith(".csv"));

      folderStructure.push({
        folderName: folder,
        path: folderPath,
        files: csvFiles,
      });
    }

    return {
      dataPath,
      folders: folderStructure,
    };
  } catch (error) {
    throw new Error(`Failed to process directory structure: ${error}`);
  }
}
