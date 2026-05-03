import { useState } from 'react';

export function HeaderInput({ onSubmit }: { onSubmit: (data: HeaderFormData) => void }): React.ReactNode {
  const [formData, setFormData] = useState<HeaderFormData>({
    projectLabel: '',
    headerSpanFeet: '',
    loadWidthInches: '',
    stories: '',
    headerSpecies: '',
    headerGrade: '',
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
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md" aria-label="Header/Girder Inputs Form">
      <h2 className="mb-4 text-xl font-semibold">Header/Girder Inputs</h2>
      
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
        <label htmlFor="headerSpanFeet" className="block mb-1 font-medium">Span (feet)</label>
        <input
          id="headerSpanFeet"
          name="headerSpanFeet"
          type="number"
          value={formData.headerSpanFeet}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
          placeholder="Enter header span"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="loadWidthInches" className="block mb-1 font-medium">Load Width (inches)</label>
        <input
          id="loadWidthInches"
          name="loadWidthInches"
          type="number"
          value={formData.loadWidthInches}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
          step="any"
          placeholder="Enter load width"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="stories" className="block mb-1 font-medium">Stories Supported</label>
        <select
          id="stories"
          name="stories"
          value={formData.stories}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select stories</option>
          <option value="1">1 Story</option>
          <option value="2">2 Stories</option>
          <option value="3">3 Stories</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="headerSpecies" className="block mb-1 font-medium">Species</label>
        <select
          id="headerSpecies"
          name="headerSpecies"
          value={formData.headerSpecies}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select species</option>
          <option value="Southern Pine">Southern Pine</option>
          <option value="Douglas Fir-Larch">Douglas Fir-Larch</option>
          <option value="Hem-Fir">Hem-Fir</option>
          <option value="Spruce-Pine-Fir">Spruce-Pine-Fir</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="headerGrade" className="block mb-1 font-medium">Grade</label>
        <select
          id="headerGrade"
          name="headerGrade"
          value={formData.headerGrade}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select grade</option>
          <option value="#1">#1</option>
          <option value="#2">#2</option>
          <option value="#3">#3</option>
          <option value="Stud">Stud</option>
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

interface HeaderFormData {
  projectLabel: string;
  headerSpanFeet: string;
  loadWidthInches: string;
  stories: string;
  headerSpecies: string;
  headerGrade: string;
}