import React, { useState, useEffect } from 'react';

const OrderTrackerModal = ({ order, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Placed, 2: Kitchen, 3: Out for Delivery, 4: Delivered
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!order) return;

    // Simulate real-time progress steps for food delivery
    const timer1 = setTimeout(() => setCurrentStep(2), 5000);
    const timer2 = setTimeout(() => setCurrentStep(3), 15000);
    const timer3 = setTimeout(() => setCurrentStep(4), 30000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(countdown);
    };
  }, [order]);

  if (!order) return null;

  const steps = [
    { id: 1, title: 'Order Confirmed', icon: '✅', desc: 'Received by kitchen' },
    { id: 2, title: 'Preparing Food', icon: '👨‍🍳', desc: 'Chef is cooking your dish' },
    { id: 3, title: 'Out for Delivery', icon: '🛵', desc: 'Rider is on the way' },
    { id: 4, title: 'Delivered', icon: '🎉', desc: 'Enjoy your meal!' }
  ];

  return (
    <div className="modal-overlay">
      <div className="tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tracker-header">
          <div className="tracker-badge">LIVE ORDER #{order._id}</div>
          <h2>🛵 Food is on its way!</h2>
          <p className="eta-text">
            Estimated Delivery: <strong>{timeLeft} mins</strong>
          </p>
        </div>

        <div className="tracker-timeline">
          {steps.map((step) => {
            const isCompleted = step.id <= currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                <div className="step-icon-circle">{step.icon}</div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="delivery-details-box">
          <div className="detail-row">
            <span><strong>Delivering To:</strong> {order.userName}</span>
            <span><strong>Phone:</strong> {order.phone}</span>
          </div>
          <div className="detail-row">
            <span><strong>Address:</strong> {order.address}</span>
          </div>
          <div className="detail-row">
            <span><strong>Payment:</strong> {order.paymentMethod} (₹{order.totalAmount})</span>
          </div>
        </div>

        <div className="tracker-actions">
          <button className="btn-primary" onClick={onClose}>
            Back to Food Studio
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackerModal;
