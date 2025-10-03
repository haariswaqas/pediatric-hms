// src/children/components/GrowthCharts.jsx
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ScatterChart,
  Scatter, ZAxis
} from 'recharts';

export default function GrowthCharts({ children }) {
  const [chartType, setChartType] = useState('height-age'); // height-age, weight-age, weight-height
  
  // Process data for height vs age chart
  const heightByAge = children
    .filter(child => child.age && child.current_height)
    .map(child => ({
      age: parseInt(child.age),
      height: parseFloat(child.current_height),
      name: `${child.first_name} ${child.last_name}`,
      gender: child.gender
    }))
    .sort((a, b) => a.age - b.age);
  
  // Process data for weight vs age chart
  const weightByAge = children
    .filter(child => child.age && child.current_weight)
    .map(child => ({
      age: parseInt(child.age),
      weight: parseFloat(child.current_weight),
      name: `${child.first_name} ${child.last_name}`,
      gender: child.gender
    }))
    .sort((a, b) => a.age - b.age);
  
  // Process data for weight vs height chart (BMI visualization)
  const weightByHeight = children
    .filter(child => child.current_height && child.current_weight)
    .map(child => {
      const height = parseFloat(child.current_height);
      const weight = parseFloat(child.current_weight);
      // Calculate BMI if height is in cm and weight is in kg
      const heightInM = height / 100;
      const bmi = weight / (heightInM * heightInM);
      
      return {
        height,
        weight,
        bmi: isNaN(bmi) ? 0 : bmi,
        name: `${child.first_name} ${child.last_name}`,
        gender: child.gender
      };
    });
  
  return (
    <div>
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setChartType('height-age')}
          className={`px-4 py-2 rounded ${
            chartType === 'height-age' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Height vs Age
        </button>
        <button
          onClick={() => setChartType('weight-age')}
          className={`px-4 py-2 rounded ${
            chartType === 'weight-age' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Weight vs Age
        </button>
        <button
          onClick={() => setChartType('weight-height')}
          className={`px-4 py-2 rounded ${
            chartType === 'weight-height' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          }`}
        >
          Weight vs Height
        </button>
      </div>
      
      <div className="h-96">
        {chartType === 'height-age' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={heightByAge}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Age (years)', position: 'insideBottomRight', offset: -5 }} 
                type="number"
                domain={[0, 'dataMax + 1']}
              />
              <YAxis 
                label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} 
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                formatter={(value, name, props) => [value, name === 'height' ? 'Height (cm)' : name]}
                labelFormatter={(age) => `Age: ${age} years`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="height" 
                stroke="#3B82F6" 
                activeDot={{ r: 8 }} 
                name="Height"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'weight-age' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weightByAge}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="age" 
                label={{ value: 'Age (years)', position: 'insideBottomRight', offset: -5 }} 
                type="number"
                domain={[0, 'dataMax + 1']}
              />
              <YAxis 
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} 
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                formatter={(value, name, props) => [value, name === 'weight' ? 'Weight (kg)' : name]}
                labelFormatter={(age) => `Age: ${age} years`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#F59E0B" 
                activeDot={{ r: 8 }} 
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        
        {chartType === 'weight-height' && (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
              }}
            >
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="height" 
                name="Height" 
                unit="cm"
                label={{ value: 'Height (cm)', position: 'insideBottomRight', offset: -5 }} 
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <YAxis 
                type="number" 
                dataKey="weight" 
                name="Weight" 
                unit="kg"
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} 
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <ZAxis dataKey="bmi" range={[50, 400]} name="BMI" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value, name, props) => {
                  if (name === 'bmi') return [`${value.toFixed(1)}`, 'BMI'];
                  return [value, name];
                }}
              />
              <Legend />
              <Scatter 
                name="Male" 
                data={weightByHeight.filter(d => d.gender === 'M')} 
                fill="#3B82F6" 
                shape="circle"
              />
              <Scatter 
                name="Female" 
                data={weightByHeight.filter(d => d.gender === 'F')} 
                fill="#EC4899" 
                shape="circle"
              />
              <Scatter 
                name="Other" 
                data={weightByHeight.filter(d => d.gender !== 'M' && d.gender !== 'F')} 
                fill="#8B5CF6" 
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {chartType === 'height-age' && 'This chart shows the height of patients according to their age, helping to track growth patterns.'}
          {chartType === 'weight-age' && 'This chart shows the weight of patients according to their age, helping to monitor healthy weight progression.'}
          {chartType === 'weight-height' && 'This scatter plot shows the relationship between height and weight. The size of each point represents the BMI value.'}
        </p>
      </div>
    </div>
  );
}