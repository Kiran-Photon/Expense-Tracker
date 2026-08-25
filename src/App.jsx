import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

function App() {
  // ==============================
  // TRANSACTIONS
  // ==============================

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: "Salary",
      amount: 50000,
      type: "income",
      category: "Salary",
      date: "2026-08-25",
    },
    {
      id: 2,
      description: "Groceries",
      amount: 2500,
      type: "expense",
      category: "Food",
      date: "2026-08-24",
    },
    {
      id: 3,
      description: "Restaurant",
      amount: 1200,
      type: "expense",
      category: "Food",
      date: "2026-08-23",
    },
  ]);

  // ==============================
  // FORM
  // ==============================

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Stores the ID of the transaction currently being edited
  const [editingId, setEditingId] = useState(null);

  // ==============================
  // FILTERS
  // ==============================

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  // ==============================
  // LOAD FROM LOCAL STORAGE
  // ==============================

  useEffect(() => {
    const savedTransactions =
      localStorage.getItem("transactions");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // ==============================
  // SAVE TO LOCAL STORAGE
  // ==============================

  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  // ==============================
  // TOTALS
  // ==============================

  const totalIncome = transactions
    .filter(
      (transaction) => transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const totalExpense = transactions
    .filter(
      (transaction) => transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + transaction.amount,
      0
    );

  const balance = totalIncome - totalExpense;

  // ==============================
  // ADD / UPDATE TRANSACTION
  // ==============================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !description.trim() ||
      !amount ||
      Number(amount) <= 0
    ) {
      alert(
        "Please enter a valid description and amount."
      );
      return;
    }

    // UPDATE EXISTING TRANSACTION
    if (editingId !== null) {
      setTransactions((previousTransactions) =>
        previousTransactions.map((transaction) =>
          transaction.id === editingId
            ? {
                ...transaction,
                description:
                  description.trim(),
                amount: Number(amount),
                type,
                category,
                date,
              }
            : transaction
        )
      );

      setEditingId(null);
    }

    // ADD NEW TRANSACTION
    else {
      const newTransaction = {
        id: Date.now(),
        description: description.trim(),
        amount: Number(amount),
        type,
        category,
        date,
      };

      setTransactions(
        (previousTransactions) => [
          newTransaction,
          ...previousTransactions,
        ]
      );
    }

    clearForm();
  };

  // ==============================
  // CLEAR FORM
  // ==============================

  const clearForm = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Other");
    setDate(
      new Date().toISOString().split("T")[0]
    );
    setEditingId(null);
  };

  // ==============================
  // EDIT TRANSACTION
  // ==============================

  const editTransaction = (transaction) => {
    setEditingId(transaction.id);

    setDescription(transaction.description);
    setAmount(transaction.amount);
    setType(transaction.type);
    setCategory(transaction.category);
    setDate(transaction.date);
  };

  // ==============================
  // DELETE TRANSACTION
  // ==============================

  const deleteTransaction = (id) => {
    setTransactions(
      (previousTransactions) =>
        previousTransactions.filter(
          (transaction) =>
            transaction.id !== id
        )
    );
  };

  // ==============================
  // FILTER
  // ==============================

  const filteredTransactions =
    transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        filterType === "all" ||
        transaction.type === filterType;

      const matchesCategory =
        filterCategory === "all" ||
        transaction.category ===
          filterCategory;

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory
      );
    });

  // ==============================
  // CHART DATA
  // ==============================

  const categoryTotals = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] || 0) +
        transaction.amount;

      return acc;
    }, {});

  const chartData = Object.entries(
    categoryTotals
  ).map(([name, value]) => ({
    name,
    value,
  }));

  // ==============================
  // RESET FILTERS
  // ==============================

  const resetFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterCategory("all");
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="app">

      <header className="header">
        <h1>💰 Expense Tracker</h1>

        <p>
          Manage your income and expenses easily.
        </p>
      </header>

      <main>

        {/* SUMMARY */}

        <section className="summary">

          <div className="card income-card">
            <span>💵</span>
            <h3>Total Income</h3>

            <h2>
              Rs.{" "}
              {totalIncome.toLocaleString()}
            </h2>
          </div>

          <div className="card expense-card">
            <span>💸</span>
            <h3>Total Expenses</h3>

            <h2>
              Rs.{" "}
              {totalExpense.toLocaleString()}
            </h2>
          </div>

          <div className="card balance-card">
            <span>💰</span>
            <h3>Balance</h3>

            <h2>
              Rs.{" "}
              {balance.toLocaleString()}
            </h2>
          </div>

        </section>

        {/* CHART */}

        <section className="chart-container">

          <h2>📊 Expense Overview</h2>

          {chartData.length === 0 ? (
            <p className="empty-message">
              No expense data available.
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={320}
            >
              <PieChart>

                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >

                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                      />
                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `Rs. ${Number(
                      value
                    ).toLocaleString()}`
                  }
                />

                <Legend />

              </PieChart>
            </ResponsiveContainer>
          )}

        </section>

        {/* CONTENT */}

        <section className="content">

          {/* FORM */}

          <div className="form-container">

            <h2>
              {editingId !== null
                ? "✏️ Edit Transaction"
                : "➕ Add Transaction"}
            </h2>

            <form onSubmit={handleSubmit}>

              <label>
                Description
              </label>

              <input
                type="text"
                placeholder="e.g. Groceries"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />

              <label>
                Amount
              </label>

              <input
                type="number"
                placeholder="e.g. 2500"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
              />

              <label>
                Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
              >
                <option value="expense">
                  Expense
                </option>

                <option value="income">
                  Income
                </option>
              </select>

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option value="Food">
                  Food
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Salary">
                  Salary
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <label>
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />

              <button
                className="add-btn"
                type="submit"
              >
                {editingId !== null
                  ? "Update Transaction"
                  : "Add Transaction"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={clearForm}
                >
                  Cancel Edit
                </button>
              )}

            </form>

          </div>

          {/* TRANSACTIONS */}

          <div className="transactions">

            <h2>📋 Transactions</h2>

            {/* FILTERS */}

            <div className="filters">

              <input
                type="text"
                placeholder="🔍 Search..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Types
                </option>

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expense
                </option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All Categories
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Salary">
                  Salary
                </option>

                <option value="Bills">
                  Bills
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              <button
                className="reset-btn"
                onClick={resetFilters}
              >
                Reset
              </button>

            </div>

            {/* TRANSACTION LIST */}

            {filteredTransactions.length ===
            0 ? (
              <p className="empty-message">
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map(
                (transaction) => (

                  <div
                    className="transaction"
                    key={transaction.id}
                  >

                    <div className="transaction-info">

                      <h3>
                        {
                          transaction.description
                        }
                      </h3>

                      <p>
                        {transaction.category}
                        {" • "}
                        {transaction.date}
                      </p>

                    </div>

                    <div className="transaction-right">

                      <strong
                        className={
                          transaction.type ===
                          "income"
                            ? "amount-income"
                            : "amount-expense"
                        }
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}{" "}
                        Rs.{" "}
                        {transaction.amount.toLocaleString()}
                      </strong>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            editTransaction(
                              transaction
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteTransaction(
                              transaction.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )
            )}

          </div>

        </section>

      </main>

      <footer>
        <p>
          Expense Tracker • Built with React.js
        </p>
      </footer>

    </div>
  );
}

export default App;