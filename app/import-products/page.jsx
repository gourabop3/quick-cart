"use client";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ImportProducts = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);

    try {
      const response = await axios.post("/api/import-products");
      
      if (response.data.success) {
        setImportResult(response.data);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import products");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-32 min-h-screen">
        <div className="flex flex-col items-center pt-12 max-w-2xl w-full">
          <h1 className="text-3xl font-bold mb-8">Import Products</h1>
          
          <div className="bg-white p-8 rounded-lg shadow-lg w-full">
            <p className="text-gray-600 mb-6">
              This will import all products from the external website into your database.
              Duplicate products will be skipped.
            </p>
            
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? "Importing..." : "Import Products"}
            </button>

            {importResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Import Results:</h3>
                <p className="text-green-600 mb-2">
                  ✅ {importResult.message}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Total found: {importResult.totalFound}
                </p>
                
                {importResult.imported.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium text-sm mb-1">Imported products:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {importResult.imported.map((product, index) => (
                        <li key={index}>{product}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {importResult.skipped.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-1">Skipped (already exist):</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {importResult.skipped.map((product, index) => (
                        <li key={index}>{product}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ImportProducts;