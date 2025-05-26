import React from 'react';
import { Select, Slider } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';

export interface FilterValues {
  cities: string[];
  donationRange: [number, number];
  communicationPreferences: string[];
}

interface DonorFilterPanelProps {
  show: boolean;
  setShow: (value: boolean) => void;
  filters: FilterValues;
  setFilters: React.Dispatch<React.SetStateAction<FilterValues>>;
  cityNames: string[];
  communicationOptions: { label: string; value: string }[];
  loading: boolean;
  onApply: () => void;
  onClear: () => void;
}


const DonorFilterPanel: React.FC<DonorFilterPanelProps> = ({
  show,
  setShow,
  filters,
  setFilters,
  cityNames,
  communicationOptions,
  loading,
  onApply,
  onClear,
}) => {
  if (!show) return null;

  return (
    <div className="absolute z-50 top-[6rem] left-1/2 -translate-x-1/2 w-[90%] md:w-[640px]
                    bg-gradient-to-r from-gray-800/95 to-gray-700/95 backdrop-blur-lg
                    border border-white/20 p-4 rounded-2xl shadow-xl">
      <div className="mb-3">
        <h4 className="text-white text-sm font-semibold flex items-center gap-2">
          <FilterOutlined className="text-blue-400" />
          Filter Donors
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">Cities</label>
          <Select
            mode="multiple"
            className="w-full"
            placeholder="Select cities"
            value={filters.cities}
            onChange={(cities) => setFilters(prev => ({ ...prev, cities }))}
            maxTagCount="responsive"
            size="small"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
            }}
          >
            {cityNames.map(city => (
              <Select.Option key={city} value={city}>
                {city}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">Total Donations</label>
          <div className="px-2 py-1">
            <Slider
              range
              min={0}
              max={20}
              step={1}
              value={filters.donationRange}
              onChange={(range) => setFilters(prev => ({ ...prev, donationRange: range as [number, number] }))}
              marks={{ 0: '0', 10: '10', 20: '20' }}
              className="!text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">Communication Preferences</label>
          <Select
            mode="multiple"
            className="w-full"
            placeholder="Select preferences"
            value={filters.communicationPreferences}
            onChange={(prefs) => setFilters(prev => ({ ...prev, communicationPreferences: prefs }))}
            maxTagCount="responsive"
            size="small"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '8px',
            }}
          >
            {communicationOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onApply}
          disabled={loading}
          className="bg-gradient-45-indigo-purple text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
        >
          Apply Filters
        </button>
        <button
          onClick={onClear}
          className="bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
        >
          <ClearOutlined />
          Clear All
        </button>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-white px-3 py-1.5 text-sm transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DonorFilterPanel;
