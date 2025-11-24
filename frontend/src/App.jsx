// frontend/src/App.jsx
import { useEffect, useState } from "react";
import { fetchHealth, fetchUsers, createUser } from "./api/client";

function App() {
  const [health, setHealth] = useState("Loading...");
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((text) => setHealth(text))
      .catch(() => setHealth("Backend connection failed"));

    fetchUsers()
      .then((data) => setUsers(data))
      .catch((err) => {
        console.error(err);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    try {
      setLoading(true);
      const newUser = await createUser(form);
      setUsers((prev) => [...prev, newUser]);
      setForm({ name: "", email: "" });
    } catch (err) {
      console.error("Failed to create user", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Camin Frontend</h1>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Backend Health</h2>
        <p>{health}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2>Create User</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add"}
          </button>
        </form>
      </section>

      <section>
        <h2>User List</h2>
        {users.length === 0 ? (
          <p>No users yet.</p>
        ) : (
          <ul>
            {users.map((u) => (
              <li key={u.id}>
                {u.name} ({u.email})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
