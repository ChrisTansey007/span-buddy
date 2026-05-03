"use client";

import { useState } from 'react';
import { sizeFloorJoist } from '@/engine/sizeFloorJoist';
import { sizeHeader } from '@/engine/sizeHeader';
import { JoistInput } from '@/components/ui/JoistInput';
import { HeaderInput } from '@/components/ui/HeaderInput';

export default function Calculator() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'joist' | 'header'>('joist');

  const handleJoistSubmit = (data: {
    projectLabel: string;
    spanFeet: string;
    spacingInches: string;
    speciesGrade: string;
    loadCategory: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const spanInches = parseFloat(data.spanFeet) * 12;
      const spacing = parseFloat(data.spacingInches);
      const liveLoad = parseFloat(data.loadCategory);

      // Split speciesGrade into species and grade (assuming format "Species Grade")
      const lastSpaceIndex = data.speciesGrade.lastIndexOf(' ');
      const species = data.speciesGrade.slice(0, lastSpaceIndex);
      const grade = data.speciesGrade.slice(lastSpaceIndex + 1);

      // Use the unified sizeFloorJoist function for both 30 and 40 psf
      const res = sizeFloorJoist(spanInches, spacing, species, grade, liveLoad);

      if (res.ok) {
        setResult(res);
      } else {
        setError(res.reason || 'Unknown error');
      }
    } catch (err) {
      setError((err as Error).message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleHeaderSubmit = (data: {
    projectLabel: string;
    headerSpanFeet: string;
    loadWidthInches: string;
    stories: string;
    headerSpecies: string;
    headerGrade: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const spanInches = parseFloat(data.headerSpanFeet) * 12;
      const loadWidth = parseFloat(data.loadWidthInches);
      const storiesInt = parseInt(data.stories, 10);

      const res = sizeHeader(spanInches, loadWidth, storiesInt, data.headerSpecies, data.headerGrade);

      if (res.ok) {
        setResult(res);
      } else {
        setError(res.reason || 'Unknown error');
      }
    } catch (err) {
      setError((err as Error).message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Span Buddy Calculator</h1>
      
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('joist')}
          className={`${activeTab === 'joist' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'} px-4 py-2 mr-2 rounded-t-lg`}
        >
          Floor Joist
        </button>
        <button
          onClick={() => setActiveTab('header')}
          className={`${activeTab === 'header' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'} px-4 py-2 ml-2 rounded-t-lg`}
        >
          Header/Girder
        </button>
      </div>

      {activeTab === 'joist' && (
        <JoistInput onSubmit={handleJoistSubmit} />
      )}

      {activeTab === 'header' && (
        <HeaderInput onSubmit={handleHeaderSubmit} />
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p>Error: {error}</p>
        </div>
      )}

      {result && result.ok && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Result</h2>
          {activeTab === 'joist' && (
            <>
              <p className="mb-1"><strong>Joist Size:</strong> {result.value.size}</p>
              <p className="mb-1"><strong>Spacing:</strong> {result.value.spacing}&quot;&quot;</p>
              <p className="mb-1"><strong>Span:</strong> {result.value.span}&quot;&quot;</p>
              <p className="mb-1"><strong>Species:</strong> {result.value.species}</p>
              <p className="mb-1"><strong>Grade:</strong> {result.value.grade}</p>
              <p className="mb-1"><strong>Allowable Span:</strong> {result.value.allowableSpan}&quot;&quot;</p>
              <p className="mb-1"><strong>Utilization:</strong> {(result.value.utilization * 100).toFixed(1)}%</p>
            </>
          )}
          {activeTab === 'header' && (
            <>
              <p className="mb-1"><strong>Header Size:</strong> {result.value.size}</p>
              <p className="mb-1"><strong>Span:</strong> {result.value.span}&quot;&quot;</p>
              <p className="mb-1"><strong>Species:</strong> {result.value.species}</p>
              <p className="mb-1"><strong>Grade:</strong> {result.value.grade}</p>
              <p className="mb-1"><strong>Number of Plies:</strong> {result.value.plies}</p>
              <p className="mb-1"><strong>Allowable Span:</strong> {result.value.allowableSpan}&quot;&quot;</p>
              <p className="mb-1"><strong>Utilization:</strong> {(result.value.utilization * 100).toFixed(1)}%</p>
            </>
          )}
          
          {result.warnings && result.warnings.length > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
              <h3 className="font-semibold mb-1">Warnings</h3>
              <ul className="list-disc list-inside text-sm">
                {result.warnings.map((w: string, i: number) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.assumptions && result.assumptions.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm">
              <h3 className="font-semibold mb-1">Assumptions</h3>
              <ul className="list-disc list-inside">
                {result.assumptions.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          
          {result.citations && result.citations.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm">
              <h3 className="font-semibold mb-1">Citations</h3>
              <ul className="list-disc list-inside">
                {result.citations.map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}