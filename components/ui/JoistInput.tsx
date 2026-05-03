import { useState } from 'react';

export function JoistInput({ onSubmit }: { onSubmit: (data: JoistFormData) => void }): React.ReactNode {
  const [formData, setFormData] = useState<JoistFormData>({
    projectLabel: '',
    spanFeet: '',
    spacingInches: '',
    speciesGrade: '',
    loadCategory: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md" aria-label="Floor Joist Inputs Form">
      <h2 className="mb-4 text-xl font-semibold">Floor Joist Inputs</h2>
      
      <div className="mb-4">
        <label htmlFor="projectLabel" className="block mb-1 font-medium">Project Label</label>
        <input
          id="projectLabel"
          name="projectLabel"
          type="text"
          value={formData.projectLabel}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter project name or address"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="spanFeet" className="block mb-1 font-medium">Span (feet)</label>
        <input
          id="spanFeet"
          name="spanFeet"
          type="number"
          value={formData.spanFeet}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
          placeholder="Enter span length"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="spacingInches" className="block mb-1 font-medium">Spacing (inches)</label>
        <input
          id="spacingInches"
          name="spacingInches"
          type="number"
          value={formData.spacingInches}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
          placeholder="Enter joist spacing"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="speciesGrade" className="block mb-1 font-medium">Species/Grade</label>
        <select
          id="speciesGrade"
          name="speciesGrade"
          value={formData.speciesGrade}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select species/grade</option>
          <option value="Spruce-Pine-Fir #2">Spruce-Pine-Fir #2</option>
          <option value="Douglas Fir-Larch #2">Douglas Fir-Larch #2</option>
          <option value="Hem-Fir #2">Hem-Fir #2</option>
          <option value="Southern Pine #2">Southern Pine #2</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="loadCategory" className="block mb-1 font-medium">Live Load (psf)</label>
        <select
          id="loadCategory"
          name="loadCategory"
          value={formData.loadCategory}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select live load</option>
          <option value="30">30 psf</option>
          <option value="40">40 psf</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        Calculate Size
      </button>
    </form>
  );
}

interface JoistFormData {
  projectLabel: string;
  spanFeet: string;
  spacingInches: string;
  speciesGrade: string;
  loadCategory: string;
}