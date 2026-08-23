'use client';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const currentTotal = payload.reduce(
      (sum: number, entry: any) => sum + Number(entry.value),
      0,
    );

    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 min-w-[240px]">
        <p className="text-gray-900 font-bold mb-3 pb-2 border-b border-gray-50">
          {label}
        </p>

        <div className="space-y-2.5 mb-4">
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center gap-6 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600">
                  {entry.name.split(' ')[0]}
                </span>
              </div>
              <span className="font-semibold text-gray-800">
                {Number(entry.value).toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                PLN
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-gray-900">Suma:</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-blue-600">
              {currentTotal.toLocaleString('pl-PL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              PLN
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueChart({
  data,
  companyNames,
  title,
}: {
  data: any[];
  companyNames: string[];
  title?: string;
}) {
  return (
    <div className="h-[350px]  bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">
        {title ? title : 'Przychody firm w czasie'}
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
          <Legend
            content={() => (
              <ul className="flex flex-wrap justify-center gap-6 pt-4">
                {companyNames.map((name, index) => (
                  <li
                    key={name}
                    className="flex items-center gap-2 text-sm text-gray-600 font-medium"
                  >
                    <span
                      className="block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {name.substring(0, 20)}
                  </li>
                ))}
              </ul>
            )}
          />

          {companyNames.map((name, index) => (
            <Line
              type="monotone"
              key={name}
              stroke={COLORS[index % COLORS.length]}
              dataKey={name}
              fill={COLORS[index % COLORS.length]}
              activeDot={{ r: 6 }}
              animationBegin={200}
              animationDuration={1300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
