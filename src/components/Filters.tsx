'use client';

import { Filter, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { FilterOptions } from '@/types';
import { categories, states, certificationTypes } from '@/data/suppliers';

interface FiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string | number) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      category: 'All Categories',
      location: 'All States',
      certification: 'All Certifications',
      priceRange: 'All Ranges',
      rating: 0,
    });
  };

  const hasActiveFilters = 
    filters.category !== 'All Categories' ||
    filters.location !== 'All States' ||
    filters.certification !== 'All Certifications' ||
    filters.priceRange !== 'All Ranges' ||
    filters.rating > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Mobile Filter Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-left text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-expanded={isOpen}
          aria-label="Toggle filters"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Active
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-t md:border-t-0">
          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 hidden md:block">
                Filters
              </h3>
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Clear all filters"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white text-gray-900"
                aria-label="Filter by category"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <select
                id="location"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white text-gray-900"
                aria-label="Filter by state"
              >
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Certification Filter */}
            <div>
              <label htmlFor="certification" className="block text-sm font-medium text-gray-700 mb-2">
                Certification
              </label>
              <select
                id="certification"
                value={filters.certification}
                onChange={(e) => updateFilter('certification', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white text-gray-900"
                aria-label="Filter by certification"
              >
                {certificationTypes.map((cert) => (
                  <option key={cert} value={cert}>
                    {cert}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                id="priceRange"
                value={filters.priceRange}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white text-gray-900"
                aria-label="Filter by price range"
              >
                <option value="All Ranges">All Ranges</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                id="rating"
                value={filters.rating}
                onChange={(e) => updateFilter('rating', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white text-gray-900"
                aria-label="Filter by minimum rating"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
