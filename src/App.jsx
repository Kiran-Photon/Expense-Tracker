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

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Bonus",
  "Gift",
  "Interest",
  "Other Income",
];

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Fuel",
  "Rent",
  "Utilities",
  "Electricity",
  "Internet",
  "Mobile",
  "Education",
  "Healthcare",
  "Shopping",
  "Entertainment",
  "Travel",
  "Insurance",
  "Subscriptions",
  "Personal Care",
  "Family",
  "Gifts & Donations",
  "EMI / Loan",
  "Taxes",
  "Other Expense",
];

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function App() {
  // ============================
  // TRANSACTIONS
  // ============================

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: "Salary",
      amount: 50000,
      type: "income",
      category: "Salary",
      date: getToday(),
    },
    {
      id: 2,
      description: "Groceries",
      amount: 2500,
      type: "expense",
      category: "Groceries",
      date: getToday(),
    },
    {
      id: 3,
      description: "Restaurant",
      amount: 1200,
      type: "expense",
      category: "Food & Dining",
      date: getToday(),
    },
  ]);

  // ============================
  // FORM
  // ============================

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food & Dining");
  const [customCategory, setCustomCategory] =
    useState("");
  const [date, setDate] = useState(getToday());

  // ============================
  // EDIT
  // ============================

  const [editingId, setEditingId] = useState(null);
  const [previousTransaction, setPreviousTransaction] =
    useState(null);

  // ============================
  // UNDO
  // ============================

  const [undoData, setUndoData] = useState(null);
  const [notification, setNotification] =
    useState("");

  // ============================
  // FILTERS
  // ============================

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] =
    useState("all");

  // ============================
  // LOCAL STORAGE
  // ============================

  useEffect(() => {
    const savedTransactions =
      localStorage.getItem("transactions");

    if (savedTransactions) {
      try {
        setTransactions(
          JSON.parse(savedTransactions)
        );
      } catch {
        console.log(
          "Unable to load saved transactions."
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  // ============================
  // NOTIFICATION
  // ============================

  const showNotification = (message) => {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 4000);
  };

  // ============================
  // TOTALS
  // ============================

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const balance = totalIncome - totalExpense;

  // ============================
  // CATEGORY LIST
  // ============================

  const availableCategories =
    type === "income"
      ? INCOME_CATEGORIES
      : EXPENSE_CATEGORIES;

  // ============================
  // CLEAR FORM
  // ============================

  const clearForm = () => {
    setDescription("");
    setAmount("");
    setType("expense");
    setCategory("Food & Dining");
    setCustomCategory("");
    setDate(getToday());
    setEditingId(null);
    setPreviousTransaction(null);
  };

  // ============================
  // ADD / UPDATE
  // ============================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !description.trim() ||
      !amount ||
      Number(amount) <= 0
    ) {
      showNotification(
        "Please enter a valid description and amount."
      );
      return;
    }

    if (
      category === "Other Expense" ||
      category === "Other Income"
    ) {
      if (!customCategory.trim()) {
        showNotification(
          "Please specify your category."
        );
        return;
      }
    }

    const finalCategory =
      category === "Other Expense" ||
      category === "Other Income"
        ? customCategory.trim()
        : category;

    // UPDATE
    if (editingId !== null) {
      setTransactions((previous) =>
        previous.map((transaction) =>
          transaction.id === editingId
            ? {
                ...transaction,
                description:
                  description.trim(),
                amount: Number(amount),
                type,
                category: finalCategory,
                date,
              }
            : transaction
        )
      );

      setUndoData({
        type: "edit",
        transaction: previousTransaction,
      });

      showNotification(
        "Transaction updated successfully."
      );

      clearForm();
      return;
    }

    // ADD
    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: Number(amount),
      type,
      category: finalCategory,
      date,
    };

    setTransactions((previous) => [
      newTransaction,
      ...previous,
    ]);

    showNotification(
      "Transaction added successfully."
    );

    clearForm();
  };

  // ============================
  // EDIT TRANSACTION
  // ============================

  const editTransaction = (transaction) => {
    setEditingId(transaction.id);

    setPreviousTransaction({
      ...transaction,
    });

    setDescription(transaction.description);
    setAmount(transaction.amount);
    setType(transaction.type);
    setDate(transaction.date);

    const standardCategories =
      transaction.type === "income"
        ? INCOME_CATEGORIES
        : EXPENSE_CATEGORIES;

    if (
      standardCategories.includes(
        transaction.category
      )
    ) {
      setCategory(transaction.category);
      setCustomCategory("");
    } else {
      setCategory(
        transaction.type === "income"
          ? "Other Income"
          : "Other Expense"
      );

      setCustomCategory(
        transaction.category
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ============================
  // UNDO EDIT
  // ============================

  const undoEdit = () => {
    if (
      !undoData ||
      undoData.type !== "edit" ||
      !undoData.transaction
    ) {
      return;
    }

    setTransactions((previous) =>
      previous.map((transaction) =>
        transaction.id ===
        undoData.transaction.id
          ? undoData.transaction
          : transaction
      )
    );

    setUndoData(null);

    showNotification(
      "Previous transaction restored."
    );
  };

  // ============================
  // DELETE
  // ============================

  const deleteTransaction = (id) => {
    const transaction =
      transactions.find(
        (item) => item.id === id
      );

    if (!transaction) return;

    setTransactions((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );

    setUndoData({
      type: "delete",
      transaction,
    });

    showNotification(
      "Transaction deleted."
    );
  };

  // ============================
  // UNDO DELETE
  // ============================

  const undoDelete = () => {
    if (
      !undoData ||
      undoData.type !== "delete"
    ) {
      return;
    }

    setTransactions((previous) => [
      undoData.transaction,
      ...previous,
    ]);

    setUndoData(null);

    showNotification(
      "Transaction restored successfully."
    );
  };

  // ============================
  // UNDO BUTTON
  // ============================

  const handleUndo = () => {
    if (!undoData) return;

    if (undoData.type === "delete") {
      undoDelete();
    }

    if (undoData.type === "edit") {
      undoEdit();
    }
  };

  // ============================
  // FILTER
  // ============================

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

  // ============================
  // CHART
  // ============================

  const categoryTotals = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce((acc, transaction) => {
      acc[transaction.category] =
        (acc[transaction.category] || 0) +
        Number(transaction.amount);

      return acc;
    }, {});

  const chartData = Object.entries(
    categoryTotals
  ).map(([name, value]) => ({
    name,
    value,
  }));

  // ============================
  // RESET FILTERS
  // ============================

  const resetFilters = () => {
    setSearch("");
    setFilterType("all");
    setFilterCategory("all");
  };

  // ============================
  // RENDER
  // ============================

  return (
    <div className="app">

      {/* NOTIFICATION */}

      {notification && (
        <div className="notification">
          <span>{notification}</span>

          {undoData && (
            <button onClick={handleUndo}>
              ↩ Undo
            </button>
          )}
        </div>
      )}

      {/* HEADER */}

      <header className="header">

        <div className="header-content">

          <div>
            <div className="logo">
              💰
            </div>

            <div>
              <h1>
                Personal Expense Tracker
              </h1>

              <p>
                Take control of your money.
              </p>
            </div>
          </div>

        </div>

      </header>

      <main>

        {/* SUMMARY */}

        <section className="summary">

          <div className="card income-card">

            <div className="card-icon">
              💵
            </div>

            <div>
              <p>Total Income</p>

              <h2>
                Rs.{" "}
                {totalIncome.toLocaleString()}
              </h2>
            </div>

          </div>

          <div className="card expense-card">

            <div className="card-icon">
              💸
            </div>

            <div>
              <p>Total Expenses</p>

              <h2>
                Rs.{" "}
                {totalExpense.toLocaleString()}
              </h2>
            </div>

          </div>

          <div className="card balance-card">

            <div className="card-icon">
              💰
            </div>

            <div>
              <p>Current Balance</p>

              <h2>
                Rs.{" "}
                {balance.toLocaleString()}
              </h2>
            </div>

          </div>

        </section>

        {/* CHART */}

        <section className="chart-container">

          <div className="section-heading">

            <div>
              <span className="section-label">
                ANALYTICS
              </span>

              <h2>
                Expense Overview
              </h2>
            </div>

            <span className="chart-total">
              Rs.{" "}
              {totalExpense.toLocaleString()}
            </span>

          </div>

          {chartData.length === 0 ? (
            <div className="empty-message">
              No expense data available.
            </div>
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
                  outerRadius={105}
                  innerRadius={55}
                  paddingAngle={3}
                  label
                >
                  {chartData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
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

        {/* MAIN GRID */}

        <section className="content">

          {/* FORM */}

          <div className="form-container">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  {editingId !== null
                    ? "EDIT"
                    : "NEW TRANSACTION"}
                </span>

                <h2>
                  {editingId !== null
                    ? "Edit Transaction"
                    : "Add Transaction"}
                </h2>
              </div>

            </div>

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
                min="0"
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
                onChange={(e) => {
                  const newType =
                    e.target.value;

                  setType(newType);

                  if (newType === "income") {
                    setCategory(
                      "Salary"
                    );
                  } else {
                    setCategory(
                      "Food & Dining"
                    );
                  }

                  setCustomCategory("");
                }}
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
                {availableCategories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {/* CUSTOM CATEGORY */}

              {(category ===
                "Other Expense" ||
                category ===
                  "Other Income") && (
                <>
                  <label>
                    Specify Category
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Pet Care"
                    value={
                      customCategory
                    }
                    onChange={(e) =>
                      setCustomCategory(
                        e.target.value
                      )
                    }
                  />
                </>
              )}

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
                className="primary-btn"
                type="submit"
              >
                {editingId !== null
                  ? "✓ Update Transaction"
                  : "+ Add Transaction"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={clearForm}
                >
                  Cancel Edit
                </button>
              )}

            </form>

          </div>

          {/* TRANSACTIONS */}

          <div className="transactions">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  RECORDS
                </span>

                <h2>
                  Transactions
                </h2>
              </div>

              <span className="transaction-count">
                {filteredTransactions.length}
              </span>

            </div>

            {/* FILTERS */}

            <div className="filters">

              <input
                type="text"
                placeholder="🔍 Search transactions..."
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

                {[
                  ...INCOME_CATEGORIES,
                  ...EXPENSE_CATEGORIES,
                ].map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}

              </select>

              <button
                className="reset-btn"
                onClick={resetFilters}
              >
                Reset
              </button>

            </div>

            {/* LIST */}

            <div className="transaction-list">

              {filteredTransactions.length ===
              0 ? (
                <div className="empty-message">
                  No transactions found.
                </div>
              ) : (
                filteredTransactions.map(
                  (transaction) => (
                    <div
                      className="transaction"
                      key={transaction.id}
                    >

                      <div className="transaction-left">

                        <div
                          className={`transaction-icon ${
                            transaction.type
                          }`}
                        >
                          {transaction.type ===
                          "income"
                            ? "↗"
                            : "↘"}
                        </div>

                        <div>
                          <h3>
                            {
                              transaction.description
                            }
                          </h3>

                          <p>
                            {
                              transaction.category
                            }{" "}
                            •{" "}
                            {
                              transaction.date
                            }
                          </p>
                        </div>

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
                          {Number(
                            transaction.amount
                          ).toLocaleString()}
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

          </div>

        </section>

      </main>

      {/* DEVELOPER */}

      <footer>

        <div className="developer">

          <div className="developer-avatar">
            KG
          </div>

          <div>
            <p>
              Personal Expense Tracker
            </p>

            <span>
              Developed by{" "}
              <strong>
                Kiran Gajmer
              </strong>
            </span>

            <small>
              Built with React.js
            </small>
          </div>

        </div>

        <p className="copyright">
          © {new Date().getFullYear()} Kiran
          Gajmer. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;