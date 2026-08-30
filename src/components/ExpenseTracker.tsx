import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  DollarSign,
  PieChart as PieChartIcon,
  PlusCircle,
  Trash2,
  Receipt,
  Search,
  Filter,
  Car,
  Building,
  Utensils,
  ShoppingBag,
  Ticket,
  MoreHorizontal,
  Wallet,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Trip, Expense, ExpenseCategory, CategorySummaryDTO } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ExpenseTrackerProps {
  trips: Trip[];
  selectedTripId?: string;
  onSelectTripId: (tripId: string) => void;
  onAddExpense: (tripId: string, expense: any) => Promise<void>;
  onDeleteExpense: (expenseId: string) => Promise<void>;
  onUpdateBudget: (tripId: string, amount: number, currency: string) => Promise<void>;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ReactNode> = {
  TRANSPORTATION: <Car className="w-4 h-4 text-blue-400" />,
  HOTEL: <Building className="w-4 h-4 text-indigo-400" />,
  FOOD: <Utensils className="w-4 h-4 text-emerald-400" />,
  SHOPPING: <ShoppingBag className="w-4 h-4 text-amber-400" />,
  ENTERTAINMENT: <Ticket className="w-4 h-4 text-pink-400" />,
  MISCELLANEOUS: <MoreHorizontal className="w-4 h-4 text-purple-400" />,
};

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  TRANSPORTATION: '#38bdf8', // sky
  HOTEL: '#818cf8', // indigo
  FOOD: '#34d399', // emerald
  SHOPPING: '#fbbf24', // amber
  ENTERTAINMENT: '#f472b6', // pink
  MISCELLANEOUS: '#c084fc', // purple
};

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  trips,
  selectedTripId,
  onSelectTripId,
  onAddExpense,
  onDeleteExpense,
  onUpdateBudget,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetAmount, setNewBudgetAmount] = useState<number>(0);

  // Form State for Add Expense
  const [formData, setFormData] = useState<{
    category: ExpenseCategory;
    amount: string;
    expenseDate: string;
    description: string;
    receiptLink: string;
  }>({
    category: 'FOOD',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    description: '',
    receiptLink: '',
  });

  const activeTrip = useMemo(() => {
    if (!trips.length) return null;
    return trips.find((t) => t.id === selectedTripId) || trips[0];
  }, [trips, selectedTripId]);

  const expenses = activeTrip?.expenses || [];
  const budget = activeTrip?.budget || { amount: 2000, currency: 'USD' };
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = budget.amount - totalSpent;
  const budgetPercentage = Math.min(Math.round((totalSpent / (budget.amount || 1)) * 100), 100);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.payerName && e.payerName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, categoryFilter]);

  // Aggregate Category Breakdown
  const categorySummary: CategorySummaryDTO[] = useMemo(() => {
    const categories: ExpenseCategory[] = [
      'TRANSPORTATION',
      'HOTEL',
      'FOOD',
      'SHOPPING',
      'ENTERTAINMENT',
      'MISCELLANEOUS',
    ];

    return categories.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat);
      const sum = catExpenses.reduce((acc, e) => acc + e.amount, 0);
      return {
        category: cat,
        totalAmount: sum,
        count: catExpenses.length,
        percentage: totalSpent > 0 ? Number(((sum / totalSpent) * 100).toFixed(1)) : 0,
      };
    });
  }, [expenses, totalSpent]);

  // Chart Data: Donut
  const doughnutData = {
    labels: categorySummary.filter((c) => c.totalAmount > 0).map((c) => c.category),
    datasets: [
      {
        data: categorySummary.filter((c) => c.totalAmount > 0).map((c) => c.totalAmount),
        backgroundColor: categorySummary
          .filter((c) => c.totalAmount > 0)
          .map((c) => CATEGORY_COLORS[c.category]),
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#475569',
          font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
          padding: 12,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = totalSpent > 0 ? ((val / totalSpent) * 100).toFixed(1) : 0;
            return ` ${budget.currency} ${val.toLocaleString()} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip || !formData.amount || Number(formData.amount) <= 0) return;

    await onAddExpense(activeTrip.id, {
      category: formData.category,
      amount: Number(formData.amount),
      expenseDate: formData.expenseDate,
      description: formData.description || `${formData.category} expense`,
      receiptLink: formData.receiptLink,
    });

    setFormData({
      category: 'FOOD',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      description: '',
      receiptLink: '',
    });
    setIsAddingExpense(false);
  };

  const handleSaveBudget = async () => {
    if (!activeTrip || newBudgetAmount <= 0) return;
    await onUpdateBudget(activeTrip.id, newBudgetAmount, budget.currency);
    setIsEditingBudget(false);
  };

  if (!activeTrip) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-500">No trips available. Create a trip to manage expenses.</p>
      </div>
    );
  }

  return (
    <div id="expense-tracker-module" className="space-y-6">
      {/* Trip Selector & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div>
          <label className="text-xs text-slate-500 font-semibold block mb-1">Active Trip Expenses</label>
          <select
            id="select-expense-trip"
            value={activeTrip.id}
            onChange={(e) => onSelectTripId(e.target.value)}
            className="bg-slate-50 text-slate-900 text-sm font-bold py-2 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tripName} ({t.destination})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-add-expense-modal"
            onClick={() => setIsAddingExpense(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Budget</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            {isEditingBudget ? (
              <div className="flex items-center space-x-2 w-full mt-1">
                <input
                  type="number"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(Number(e.target.value))}
                  className="w-28 bg-slate-50 text-slate-900 px-2 py-1 text-base rounded border border-slate-300"
                />
                <button
                  onClick={handleSaveBudget}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-xs rounded font-bold text-white cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingBudget(false)}
                  className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-2xl font-extrabold text-slate-900">
                  {budget.currency} {budget.amount.toLocaleString()}
                </h4>
                <button
                  onClick={() => {
                    setNewBudgetAmount(budget.amount);
                    setIsEditingBudget(true);
                  }}
                  className="text-xs text-sky-600 hover:text-sky-700 underline font-bold cursor-pointer"
                >
                  Edit
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">Allocated financial threshold for {activeTrip.tripName}</p>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h4 className="text-2xl font-extrabold text-slate-900">
              {budget.currency} {totalSpent.toLocaleString()}
            </h4>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>{budgetPercentage}% of budget</span>
            <span>{expenses.length} transactions</span>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Remaining</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                remainingBudget < 0
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h4
              className={`text-2xl font-extrabold ${
                remainingBudget < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {budget.currency} {remainingBudget.toLocaleString()}
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            {remainingBudget < 0 ? '⚠️ Budget limit exceeded!' : 'Available balance remaining'}
          </p>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-slate-700 font-bold">Budget Consumption</span>
          <span className="text-slate-500">
            {budget.currency} {totalSpent.toLocaleString()} / {budget.currency} {budget.amount.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              remainingBudget < 0
                ? 'bg-rose-500'
                : budgetPercentage > 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Analytics & Category Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (Chart.js Donut) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4 text-sky-600" />
              <span>Category Distribution</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">{expenses.length} Records</span>
          </div>

          <div className="h-64 flex items-center justify-center relative">
            {expenses.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-400 text-xs">
                <PieChartIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No expense data yet. Click "Log Expense" to begin.</span>
              </div>
            )}
          </div>

          {/* Category Quick Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
            {categorySummary.map((cat) => (
              <div
                key={cat.category}
                className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center space-x-2 text-xs"
              >
                <div className="p-1 rounded-md bg-white border border-slate-200">{CATEGORY_ICONS[cat.category]}</div>
                <div className="truncate">
                  <p className="text-[10px] text-slate-500 uppercase font-bold truncate">{cat.category}</p>
                  <p className="font-extrabold text-slate-900">
                    {budget.currency} {cat.totalAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense History & Itemized Table */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Expense Journal</span>
              </h3>

              {/* Filter controls */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-50 text-xs text-slate-800 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 w-36 sm:w-44 focus:bg-white"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 text-xs text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="TRANSPORTATION">Transport</option>
                  <option value="HOTEL">Hotel</option>
                  <option value="FOOD">Food</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="MISCELLANEOUS">Misc</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto max-h-80 overflow-y-auto pr-1">
              {filteredExpenses.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="sticky top-0 bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-medium">{exp.expenseDate}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-800">
                            {CATEGORY_ICONS[exp.category]}
                            <span className="capitalize">{exp.category.toLowerCase()}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-slate-900">{exp.description}</p>
                          {exp.payerName && (
                            <span className="text-[10px] text-slate-500 font-normal">Payer: {exp.payerName}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                          {budget.currency} {exp.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-center whitespace-nowrap">
                          <button
                            id={`btn-delete-expense-${exp.id}`}
                            onClick={() => onDeleteExpense(exp.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No matching expenses found for this filter.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredExpenses.length} of {expenses.length} entries</span>
            <span className="font-bold text-slate-800">
              Filtered Total: {budget.currency}{' '}
              {filteredExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Log Travel Expense</h3>
              </div>
              <button
                onClick={() => setIsAddingExpense(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      'TRANSPORTATION',
                      'HOTEL',
                      'FOOD',
                      'SHOPPING',
                      'ENTERTAINMENT',
                      'MISCELLANEOUS',
                    ] as ExpenseCategory[]
                  ).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        formData.category === cat
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <div className="mb-1">{CATEGORY_ICONS[cat]}</div>
                      <span className="text-[10px] capitalize">{cat.toLowerCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Amount ({budget.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 45.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bullet train tickets, dinner at bistro..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              {/* Receipt URL / Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Receipt URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.receiptLink}
                  onChange={(e) => setFormData({ ...formData, receiptLink: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-md transition-all cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
