import React, { useState } from 'react';
import { useMutation, UseMutationResult } from '@tanstack/react-query';

interface CsvImportFormProps {
  onImportSuccess: () => void;
}

export function CsvImportForm({ onImportSuccess }: CsvImportFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const importCsvMutation: UseMutationResult<any, Error, string, unknown> = useMutation({
    mutationFn: async (csvContent: string) => {
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({ csv: csvContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import CSV');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setMessage(data.message || 'CSV imported successfully!');
      setSelectedFile(null);
      onImportSuccess();
    },
    onError: (error: Error) => {
      setMessage(`Error: ${error.message}`);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(null);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      setMessage('Please select a CSV file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        importCsvMutation.mutate(e.target.result);
      }
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg shadow-md bg-gray-800 mb-4">
      <h2 className="text-xl font-bold mb-4 text-white">Import Transactions from CSV</h2>
      <input
        type="file"
        accept=".csv"
        aria-label="Choose File"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-500 file:text-white
          hover:file:bg-blue-600"
      />
      <button
        onClick={handleImport}
        disabled={!selectedFile || importCsvMutation.isPending}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {importCsvMutation.isPending ? 'Importing...' : 'Import CSV'}
      </button>
      {message && (
        <p className={`mt-2 ${importCsvMutation.isError ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
