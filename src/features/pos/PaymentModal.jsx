import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { formatCurrency } from '../../utils/formatters';
import { 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  Smartphone, 
  CheckCircle2,
  Receipt
} from 'lucide-react';

export function PaymentModal({
  isOpen,
  onClose,
  totalAmount = 0,
  cartItems = [],
  onConfirmPayment,
  isProcessing = false
}) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [amountTendered, setAmountTendered] = useState(String(totalAmount));

  useEffect(() => {
    if (isOpen) {
      setAmountTendered(String(totalAmount));
      setPaymentMethod('Cash');
    }
  }, [isOpen, totalAmount]);

  const tenderedNum = Number(amountTendered) || 0;
  const change = Math.max(0, tenderedNum - totalAmount);
  const isShortfall = tenderedNum < totalAmount && paymentMethod === 'Cash';

  const handleQuickAmount = (val) => {
    setAmountTendered(String(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isShortfall) return;
    onConfirmPayment({
      paymentMethod,
      amountPaid: paymentMethod === 'Cash' ? tenderedNum : totalAmount
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finalize Customer Payment"
      subtitle={`Processing ${cartItems.length} item(s) through FEFO inventory`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Total Display Banner */}
        <div className="bg-primary/10 border border-primary/20 p-4 text-txt text-center">
          <span className="text-[10px] uppercase tracking-widest text-primary font-semibold block">Total Amount Due</span>
          <span className="text-2xl font-bold tracking-tight mt-1 block tabular-nums">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Payment Method Selector */}
        <div>
          <label className="block text-xs font-semibold text-txt mb-2">Select Payment Method</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Cash', label: 'Cash Tender', icon: Banknote },
              { id: 'POS Card / Transfer', label: 'POS / Card', icon: CreditCard },
              { id: 'Bank Transfer', label: 'Bank Transfer', icon: Smartphone }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`
                    p-3 border text-center flex flex-col items-center justify-center transition-colors
                    ${isSelected
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-bdr bg-bg-card text-txt-muted hover:border-txt-light hover:text-txt'}
                  `}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="text-[11px]">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bank Transfer Details */}
        {paymentMethod === 'Bank Transfer' && (
          <div className="p-3.5 border border-bdr bg-bg-alt text-center space-y-1.5">
            <p className="text-[10px] font-semibold text-txt-muted uppercase tracking-wider">Transfer Details</p>
            <div>
              <p className="text-xl font-bold text-primary tracking-widest font-mono">9153703007</p>
              <p className="text-xs font-semibold text-txt mt-0.5">Opay - Akolo Aku Danjuma</p>
              <p className="text-[11px] text-txt-muted mt-1.5 border-t border-bdr pt-1.5">Please verify transfer receipt before completing sale.</p>
            </div>
          </div>
        )}

        {/* Cash Tender & Change Calculation */}
        {paymentMethod === 'Cash' && (
          <div className="space-y-3 pt-1">
            <Input
              label="Cash Received from Customer (₦)"
              type="number"
              min="0"
              step="50"
              value={amountTendered}
              onChange={(e) => setAmountTendered(e.target.value)}
              placeholder="e.g. 5000"
              autoFocus
            />

            {/* Quick cash denomination buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[totalAmount, 1000, 2000, 5000, 10000, 20000].filter(v => v >= totalAmount).slice(0, 5).map((amt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="px-2.5 py-1 text-[11px] font-medium border border-bdr bg-bg-alt hover:border-txt-light hover:text-txt transition-colors text-txt-muted"
                >
                  {amt === totalAmount ? 'Exact' : formatCurrency(amt)}
                </button>
              ))}
            </div>

            {/* Change computation box */}
            <div className={`p-2.5 border flex items-center justify-between text-xs ${isShortfall ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'}`}>
              <span className="font-medium">
                {isShortfall ? 'Shortfall Amount:' : 'Change Due to Customer:'}
              </span>
              <span className="text-sm font-bold tabular-nums">
                {isShortfall ? formatCurrency(totalAmount - tenderedNum) : formatCurrency(change)}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-bdr">
          <Button variant="secondary" onClick={onClose} type="button" disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            loading={isProcessing}
            disabled={isShortfall}
            icon={ArrowRight}
            className="font-bold shadow-md shadow-primary/20"
          >
            Complete Sale & Issue Receipt
          </Button>
        </div>
      </form>
    </Modal>
  );
}
