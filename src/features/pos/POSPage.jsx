import React, { useState } from 'react';
import { useFirestoreQuery } from '../../hooks/useFirestoreQuery';
import { useAuth } from '../../hooks/useAuth';
import { posService } from './posService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { SearchInput } from '../../components/common/SearchInput';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';
import { 
  ShoppingCart, 
  Camera, 
  Plus, 
  Minus, 
  Trash2, 
  Pill, 
  Barcode, 
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntilExpiry } from '../../utils/formatters';
import { getFefoBatchesForMedicine } from '../../utils/fefo';
import toast from 'react-hot-toast';

export function POSPage() {
  const { user } = useAuth();

  const { data: medicines = [], loading: medsLoading } = useFirestoreQuery('medicines');
  const { data: categories = [] } = useFirestoreQuery('categories');
  const { data: batches = [] } = useFirestoreQuery('batches');
  const { data: settings = [] } = useFirestoreQuery('settings');
  const activeSettings = settings[0] || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter medicines for quick search grid
  const availableMedicines = medicines.filter(med => {
    const matchesSearch = 
      med.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategory || med.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to cart with FEFO check
  const handleAddToCart = (medicine) => {
    const activeBatches = getFefoBatchesForMedicine(medicine.id, batches);
    const totalAvailable = activeBatches.reduce((sum, b) => sum + b.quantityRemaining, 0);

    if (totalAvailable <= 0) {
      toast.error(`"${medicine.name}" is currently out of stock.`);
      return;
    }

    const existingIndex = cart.findIndex(it => it.medicineId === medicine.id);
    const currentCartQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentCartQty + 1 > totalAvailable) {
      toast.error(`Cannot add more. Only ${totalAvailable} units available in active inventory.`);
      return;
    }

    const defaultSellingPrice = activeBatches[0]?.sellingPrice || 1000;

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        genericName: medicine.genericName,
        barcode: medicine.barcode,
        unitPrice: defaultSellingPrice,
        quantity: 1,
        earliestExpiry: activeBatches[0]?.expiryDate,
        totalAvailable
      }]);
    }
  };

  const handleUpdateQty = (medicineId, change) => {
    const item = cart.find(it => it.medicineId === medicineId);
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty <= 0) {
      handleRemoveItem(medicineId);
      return;
    }

    if (newQty > item.totalAvailable) {
      toast.error(`Maximum available inventory reached (${item.totalAvailable} units).`);
      return;
    }

    setCart(cart.map(it => it.medicineId === medicineId ? { ...it, quantity: newQty } : it));
  };

  const handleRemoveItem = (medicineId) => {
    setCart(cart.filter(it => it.medicineId !== medicineId));
  };

  const handleBarcodeScanned = (barcode) => {
    const matchedMed = medicines.find(m => m.barcode === barcode);
    if (matchedMed) {
      handleAddToCart(matchedMed);
      toast.success(`Added "${matchedMed.name}" to cart`);
    } else {
      toast.error(`No medicine found with barcode "${barcode}"`);
    }
  };

  const cartSubtotal = cart.reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0);

  const handleConfirmPayment = async ({ paymentMethod, amountPaid }) => {
    setIsProcessing(true);
    try {
      const completedSale = await posService.processSale({
        cartItems: cart,
        paymentMethod,
        amountPaid,
        cashierId: user?.uid || 'cashier',
        cashierName: user?.fullName || 'Staff Cashier'
      });

      setLastCompletedSale(completedSale);
      setCart([]);
      setPaymentModalOpen(false);
      setReceiptModalOpen(true);
      toast.success('Sale successfully completed & recorded!');
    } catch (err) {
      toast.error(err.message || 'Transaction failed. Stock counts preserved.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale (POS)"
        subtitle="High-speed dispensing terminal with automated FEFO batch allocation"
        actions={
          <Button
            variant="secondary"
            icon={Camera}
            onClick={() => setScannerOpen(true)}
          >
            Scan Barcode
          </Button>
        }
      />

      {/* Mobile: stacked. Desktop: side-by-side 7/5 split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Left 7 Columns: Product Search & Quick Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex gap-2">
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Type medicine name, generic name, or scan barcode..."
              className="flex-1"
            />
            <Button
              variant="secondary"
              icon={Camera}
              onClick={() => setScannerOpen(true)}
              className="hidden sm:inline-flex"
            >
              Scan
            </Button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${!selectedCategory ? 'bg-primary text-white' : 'border border-bdr text-txt-muted hover:text-txt hover:border-txt-light'}`}
              style={selectedCategory ? { backgroundColor: 'var(--color-bg-card)' } : {}}
            >
              All Medicines ({medicines.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.id ? 'bg-primary text-white' : 'border border-bdr text-txt-muted hover:text-txt hover:border-txt-light'}`}
                style={selectedCategory !== cat.id ? { backgroundColor: 'var(--color-bg-card)' } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Medicine Selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[55vh] lg:max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {availableMedicines.map(med => {
              const activeBatches = getFefoBatchesForMedicine(med.id, batches);
              const totalQty = activeBatches.reduce((sum, b) => sum + b.quantityRemaining, 0);
              const isOut = totalQty <= 0;
              const price = activeBatches[0]?.sellingPrice || 1000;
              const earliestExpiry = activeBatches[0]?.expiryDate;

              return (
                <div
                  key={med.id}
                  onClick={() => !isOut && handleAddToCart(med)}
                  className={`
                    p-3.5 border border-bdr transition-colors flex flex-col justify-between
                    ${isOut ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-txt-light hover:bg-white/2'}
                  `}
                  style={{ backgroundColor: 'var(--color-bg-card)' }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-xs text-txt line-clamp-1">{med.name}</h4>
                      <span className="font-bold text-xs text-primary flex-shrink-0 tabular-nums">
                        {formatCurrency(price)}
                      </span>
                    </div>
                    <p className="text-[11px] text-txt-muted mt-0.5 line-clamp-1">{med.genericName}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-bdr flex items-center justify-between text-[11px]">
                    <span className={isOut ? 'text-danger font-medium' : totalQty <= med.reorderThreshold ? 'text-warning font-medium' : 'text-txt-muted'}>
                      {isOut ? 'Out of Stock' : `${totalQty} in stock`}
                    </span>

                    {earliestExpiry && !isOut && (
                      <span className="text-[10px] text-txt-muted flex items-center gap-1">
                        <Clock className="w-3 h-3 text-txt-light" />
                        {formatDate(earliestExpiry)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Columns: Cart & Dispensing Checkout Panel */}
        <div className="lg:col-span-5">
          <Card
            title="Dispensing Cart"
            subtitle={`${cart.reduce((s, it) => s + it.quantity, 0)} item(s) staged`}
            action={
              cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-danger hover:underline font-semibold"
                >
                  Clear Cart
                </button>
              )
            }
          >
            {cart.length === 0 ? (
              <div className="py-12 text-center text-txt-muted">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-60 text-bdr" />
                <p className="text-xs font-semibold text-txt">Your register is empty</p>
                <p className="text-[11px] mt-0.5">Click any product on the left or scan a barcode.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-[40vh] lg:max-h-[calc(100vh-420px)] overflow-y-auto pr-1 divide-y divide-bdr">
                  {cart.map((item) => (
                    <div key={item.medicineId} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs text-txt truncate">{item.medicineName}</h5>
                        <div className="flex items-center gap-2 text-[10px] text-txt-muted mt-0.5">
                          <span>{formatCurrency(item.unitPrice)} each</span>
                          {item.earliestExpiry && (
                            <span className="text-primary font-medium">
                              • Lot exp: {formatDate(item.earliestExpiry)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1 p-0.5 border border-bdr"
                           style={{ backgroundColor: 'var(--color-bg-alt)' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.medicineId, -1)}
                          className="w-5 h-5 border border-bdr text-txt flex items-center justify-center text-xs hover:bg-bg-card transition-colors"
                          style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-5 text-center font-semibold text-xs text-txt tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.medicineId, 1)}
                          className="w-5 h-5 border border-bdr text-txt flex items-center justify-center text-xs hover:bg-bg-card transition-colors"
                          style={{ backgroundColor: 'var(--color-bg-card)' }}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="font-semibold text-xs text-txt block tabular-nums">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.medicineId)}
                          className="text-[10px] text-txt-muted hover:text-danger mt-0.5 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Checkout Action */}
                <div className="pt-4 border-t border-bdr space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-txt-muted uppercase tracking-wider">Grand Total:</span>
                    <span className="text-xl font-bold text-primary tabular-nums">{formatCurrency(cartSubtotal)}</span>
                  </div>

                  <div className="p-2.5 border border-bdr text-[11px] text-txt-muted flex items-center gap-2"
                       style={{ backgroundColor: 'var(--color-bg-alt)' }}>
                    <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>FEFO engine will automatically decrement soonest-expiring batches.</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setPaymentModalOpen(true)}
                    className="w-full text-sm font-semibold"
                    icon={ArrowRight}
                  >
                    Proceed to Payment ({formatCurrency(cartSubtotal)})
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleBarcodeScanned}
      />

      {/* Payment Processing Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        totalAmount={cartSubtotal}
        cartItems={cart}
        onConfirmPayment={handleConfirmPayment}
        isProcessing={isProcessing}
      />

      {/* Instant Receipt Preview Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        sale={lastCompletedSale}
        settings={activeSettings}
      />
    </div>
  );
}
