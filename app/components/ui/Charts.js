'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  ResponsiveContainer 
} from 'recharts';

// Couleurs pour les graphiques
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

// Composant pour le graphique de consommation de budget
export const BudgetConsumptionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={80}
          fontSize={12}
        />
        <YAxis 
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          fontSize={12}
        />
        <Tooltip 
          formatter={(value, name) => [
            new Intl.NumberFormat('fr-FR').format(value) + ' CFA',
            name === 'initial' ? 'Budget Initial' :
            name === 'consomme' ? 'Budget Consommé' : 'Budget Restant'
          ]}
        />
        <Legend />
        <Bar dataKey="initial" fill="#E5E7EB" name="Budget Initial" />
        <Bar dataKey="consomme" fill="#3B82F6" name="Budget Consommé" />
        <Bar dataKey="restant" fill="#10B981" name="Budget Restant" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Composant pour le graphique de répartition par mandat
export const MandatBudgetChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Ne pas afficher les labels pour les petites portions
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [
            new Intl.NumberFormat('fr-FR').format(value) + ' CFA',
            'Budget'
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Composant pour le graphique d'évolution des conventions
export const ConventionEvolutionChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  };

  const formattedData = data.map(item => ({
    ...item,
    monthLabel: formatMonth(item.month)
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="monthLabel" fontSize={12} />
        <YAxis yAxisId="left" fontSize={12} />
        <YAxis yAxisId="right" orientation="right" fontSize={12} />
        <Tooltip 
          formatter={(value, name) => [
            name === 'montant' ? new Intl.NumberFormat('fr-FR').format(value) + ' CFA' : value,
            name === 'count' ? 'Nombre de conventions' : 'Montant total'
          ]}
          labelFormatter={(label) => `Mois: ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#3B82F6" 
          strokeWidth={2}
          name="Nombre de conventions"
          yAxisId="left"
        />
        <Line 
          type="monotone" 
          dataKey="montant" 
          stroke="#10B981" 
          strokeWidth={2}
          name="Montant (CFA)"
          yAxisId="right"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Composant pour le graphique de statut des conventions
export const ConventionStatusChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
    if (value === 0) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {value}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data.filter(item => item.value > 0)}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.filter(item => item.value > 0).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Conventions']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Composant pour afficher un graphique de progression
export const ProgressBar = ({ value, max, label, color = 'blue' }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{new Intl.NumberFormat('fr-FR').format(value)} CFA</span>
        <span>{new Intl.NumberFormat('fr-FR').format(max)} CFA</span>
      </div>
    </div>
  );
};
