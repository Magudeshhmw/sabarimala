import { User } from '@/types/auth';
import { Mountain, Phone, Package, Bus, Armchair, CreditCard, CheckCircle, XCircle, Banknote, Smartphone } from 'lucide-react';

interface UserIdCardProps {
  user: User;
}

export function UserIdCard({ user }: UserIdCardProps) {
  return (
    <div className="id-card max-w-sm mx-auto animate-scale-in bg-gradient-to-br from-white via-orange-50 to-orange-100 overflow-hidden shadow-2xl border border-orange-200/60">
      {/* Header */}
      <div className="text-center pt-10 pb-4">
        <div className="w-48 h-48 mx-auto mb-6">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain drop-shadow-lg" />
        </div>
        <h2 className="font-heading text-2xl font-bold tracking-wide text-primary">
          SRI SASTHA SEVA SAMITHI 2026
        </h2>
        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest">Devotee ID Card</p>
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
          {/* Irumudi Number - Primary Focus */}
          <div className="col-span-1 p-4 rounded-xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-center">
            <Package className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Irumudi Number</p>
            <p className="text-3xl font-bold text-orange-950 mt-1">{user.bag_number}</p>
          </div>

          {/* Bus Number - Primary Focus */}
          <div className="col-span-1 p-4 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
            <Bus className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Bus Number</p>
            <p className="text-3xl font-bold text-blue-950 mt-1">{user.bus_number}</p>
          </div>

          {/* Mobile - Secondary */}
          <div className="col-span-2 flex items-center justify-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Phone className="w-4 h-4 text-gray-500" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Mobile Number</p>
              <p className="font-medium text-foreground">{user.mobile_number}</p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="pt-4 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Payment Status</span>
            </div>
            <span className={`font-semibold flex items-center gap-1.5 ${user.payment_status === 'PAID' ? 'text-success' : 'text-destructive'
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



        </div>
      </div>

      {/* Footer */}
      <div className={`py-4 text-center text-sm font-semibold ${user.payment_status === 'PAID'
        ? 'bg-success/15 text-success'
        : 'bg-destructive/15 text-destructive'
        }`}>
        {user.payment_status === 'PAID' ? '✓ CONFIRMED' : '⚠ PENDING PAYMENT'}
      </div>
    </div>
  );
}
