// Imports
import React from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

const CourseCohortChart = ({ data }) => {

    if (!data || data.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                No cohort data available to display yet.
            </div>
        );
    }

    const chartHeight = Math.max(300, data.length * 55);

    return (
        <div style={{ width: '100%', height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 20, right: 0, left: 0, bottom: 50,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

                    {/* Cohort Count */}
                    <XAxis 
                        type="number"
                        label={{ value: 'Total Cohorts', position: 'bottom', offset: 0 }}
                        allowDecimals={false}
                        stroke="#4b5563"
                        tickLine={false} 
                        axisLine={false}
                    />

                    {/* Course Name */}
                    <YAxis 
                        type="category"
                        dataKey="courseName"
                        stroke="#4b5563"
                        width={80}
                        tickLine={false} 
                        axisLine={false}
                    />

                    {/* Show detailed data on hover */}
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #ccc',
                            borderRadius: '4px' 
                        }}
                        formatter={(value, name) => [value, 'Cohorts']}
                    />

                    <Legend 
                        wrapperStyle={{ paddingTop: '20px' }} 
                        iconType="circle"
                    />

                    <Bar 
                        dataKey="cohortsCount" 
                        fill="#8884d8" 
                        name="Total Cohorts"
                        radius={[4, 4, 0, 0]} 
                    >
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default CourseCohortChart;
