"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAndEnsureDataDirectory = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * Checks if the data directory and required subfolders exist, creates them if missing,
 * ensures nifty50list.csv exists in the broad folder, and lists all CSV files in each folder.
 * @returns Promise resolving to the directory structure
 */
function readAndEnsureDataDirectory() {
    return __awaiter(this, void 0, void 0, function* () {
        const desktopPath = path.join(os.homedir(), "Desktop");
        const nseDataPath = path.join(desktopPath, "NSE-Data");
        const dataPath = path.join(nseDataPath, "data");
        const requiredFolders = ["broad", "indice", "stock", "option"];
        const expectedFiles = {
            broad: ["nifty50list.csv"],
            indice: [],
            stock: [],
            option: [], // Date-based files, e.g., op21072025.csv
        };
        try {
            // Check and create data directory
            try {
                yield fs.access(dataPath);
            }
            catch (_a) {
                yield fs.mkdir(dataPath, { recursive: true });
            }
            const folderStructure = [];
            // Process each required folder
            for (const folder of requiredFolders) {
                const folderPath = path.join(dataPath, folder);
                // Check and create folder
                try {
                    yield fs.access(folderPath);
                }
                catch (_b) {
                    yield fs.mkdir(folderPath, { recursive: true });
                }
                // Ensure expected files exist for broad folder
                const files = [];
                if (expectedFiles[folder].length > 0) {
                    for (const file of expectedFiles[folder]) {
                        const filePath = path.join(folderPath, file);
                        try {
                            yield fs.access(filePath);
                            files.push(file);
                        }
                        catch (_c) {
                            // Create empty file if it doesn't exist
                            yield fs.writeFile(filePath, "");
                            files.push(file);
                        }
                    }
                }
                // List all CSV files in the folder
                const folderFiles = yield fs.readdir(folderPath);
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
        }
        catch (error) {
            throw new Error(`Failed to process directory structure: ${error}`);
        }
    });
}
exports.readAndEnsureDataDirectory = readAndEnsureDataDirectory;
