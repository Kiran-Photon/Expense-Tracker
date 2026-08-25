import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      description: "Salary",
      amount: 50000,
      type: "income",
      category: "Salary",
    },
    {
      id: 2,
      description: "Groceries",
      amount: 2500,
      type: "expense",
      category: "Food",
    },
    {
      id: 3,
      description: "Restaurant",
      amount: 1200,
      type: "expense",
      category: "Food",
    },
  ]);
 useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Other");

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = totalIncome - totalExpense;

  const addTransaction = (e) => {
    e.preventDefault();

    if (!description || !amount) {
      alert("Please enter description and amount.");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description,
      amount: Number(amount),
      type,
      category,
    };

    setTransactions([newTransaction, ...transactions]);

    setDescription("");
    setAmount("");
  };

  const deleteTransaction = (id) => {
    setTransactions(
      transactions.filter((transaction) => transaction.id !== id)
    );
  };

  return (
    <div className="app">
      <header>
        <h1>💰 Expense Tracker</h1>
        <p>Manage your income and expenses easily.</p>
      </header>

      <main>
        <section className="summary">
          <div className="card income">
            <h3>Total Income</h3>
            <h2>Rs. {totalIncome.toLocaleString()}</h2>
          </div>

          <div className="card expense">
            <h3>Total Expenses</h3>
            <h2>Rs. {totalExpense.toLocaleString()}</h2>
          </div>

          <div className="card balance">
            <h3>Balance</h3>
            <h2>Rs. {balance.toLocaleString()}</h2>
          </div>
        </section>

        <section className="content">
          <div className="form-container">
            <h2>Add Transaction</h2>

            <form onSubmit={addTransaction}>
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Salary">Salary</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
              </select>

              <button type="submit">Add Transaction</button>
            </form>
          </div>

          <div className="transactions">
            <h2>Recent Transactions</h2>

            {transactions.length === 0 ? (
              <p>No transactions available.</p>
            ) : (
              transactions.map((transaction) => (
                <div className="transaction" key={transaction.id}>
                  <div>
                    <h3>{transaction.description}</h3>
                    <p>{transaction.category}</p>
                  </div>

                  <div className="transaction-right">
                    <strong className={transaction.type}>
                      {transaction.type === "income" ? "+" : "-"} Rs.{" "}
                      {transaction.amount.toLocaleString()}
                    </strong>

                    <button
                      className="delete-btn"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;