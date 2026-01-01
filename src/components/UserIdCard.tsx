import { User } from '@/types/auth';
import { Mountain, Phone, Package, Bus, Armchair, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface UserIdCardProps {
  user: User;
}

export function UserIdCard({ user }: UserIdCardProps) {
  return (
    <div className="id-card max-w-sm mx-auto animate-scale-in">
      {/* Header */}
      <div className="id-card-header">
        <Mountain className="w-12 h-12 mx-auto mb-3 text-white/90" />
        <h2 className="font-heading text-xl font-bold tracking-wide">
          SABARIMALA YATRA 2026
        </h2>
        <p className="text-white/80 text-sm mt-1">Devotee ID Card</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Name */}
        <div className="text-center pb-4 border-b border-border/50">
          <p className="text-sm text-muted-foreground">Name</p>
          <h3 className="text-2xl font-heading font-bold text-foreground mt-1">
            {user.name}
          </h3>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/15">
              <Phone className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile</p>
              <p className="font-medium text-foreground">{user.mobile_number}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bag Number</p>
              <p className="font-medium text-foreground">{user.bag_number}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-secondary/15">
              <Bus className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bus Number</p>
              <p className="font-medium text-foreground">{user.bus_number}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Armchair className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seat Number</p>
              <p className="font-medium text-foreground">{user.seat_number || 'Not Assigned'}</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Payment Status</span>
            </div>
            <span className={`font-semibold flex items-center gap-1.5 ${
              user.payment_status === 'PAID' ? 'text-success' : 'text-destructive'
            }`}>
              {user.payment_status === 'PAID' ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  PAID
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  UNPAID
                </>
              )}
            </span>
          </div>
          <p className="text-right text-xl font-heading font-bold text-foreground mt-2">
            ₹{user.amount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`py-4 text-center text-sm font-semibold ${
        user.payment_status === 'PAID' 
          ? 'bg-success/15 text-success' 
          : 'bg-destructive/15 text-destructive'
      }`}>
        {user.payment_status === 'PAID' ? '✓ CONFIRMED' : '⚠ PENDING PAYMENT'}
      </div>
    </div>
  );
}
