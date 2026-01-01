import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod, PAYMENT_RECEIVERS } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserPlus, Banknote, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AddMemberForm() {
  const { addUser, users } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile_number: '',
    bag_number: '',
    bus_number: '',
    seat_number: '',
    payment_status: 'UNPAID' as 'PAID' | 'UNPAID',
    payment_method: 'NONE' as PaymentMethod,
    payment_receiver: '',
    amount: 2500,
  });

  const handlePaymentStatusChange = (status: 'PAID' | 'UNPAID') => {
    if (status === 'UNPAID') {
      setFormData({ 
        ...formData, 
        payment_status: status, 
        payment_method: 'NONE',
        payment_receiver: '' 
      });
    } else {
      setFormData({ ...formData, payment_status: status });
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData({ 
      ...formData, 
      payment_method: method,
      payment_receiver: '' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.mobile_number.trim() || !formData.bag_number.trim() || !formData.bus_number.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile_number)) {
      toast({
        title: 'Invalid Mobile Number',
        description: 'Please enter a valid 10-digit mobile number',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(u => u.mobile_number === formData.mobile_number)) {
      toast({
        title: 'Duplicate Entry',
        description: 'A member with this mobile number already exists',
        variant: 'destructive',
      });
      return;
    }

    if (users.some(u => u.bag_number === formData.bag_number)) {
      toast({
        title: 'Duplicate Entry',
        description: 'A member with this bag number already exists',
        variant: 'destructive',
      });
      return;
    }

    if (formData.payment_status === 'PAID' && formData.payment_method === 'NONE') {
      toast({
        title: 'Validation Error',
        description: 'Please select a payment method for paid members',
        variant: 'destructive',
      });
      return;
    }

    if (formData.payment_status === 'PAID' && !formData.payment_receiver) {
      toast({
        title: 'Validation Error',
        description: 'Please select who received the payment',
        variant: 'destructive',
      });
      return;
    }

    addUser(formData);
    
    toast({
      title: 'Member Added',
      description: `${formData.name} has been added successfully`,
    });

    setFormData({
      name: '',
      mobile_number: '',
      bag_number: '',
      bus_number: '',
      seat_number: '',
      payment_status: 'UNPAID',
      payment_method: 'NONE',
      payment_receiver: '',
      amount: 2500,
    });
    setOpen(false);
  };

  const receivers = formData.payment_method !== 'NONE' 
    ? PAYMENT_RECEIVERS[formData.payment_method] 
    : [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-saffron gap-2">
          <UserPlus className="w-4 h-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Member</DialogTitle>
          <DialogDescription>
            Enter the devotee's details to add them to the yatra.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number *</Label>
            <Input
              id="mobile"
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit mobile number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bag">Bag Number *</Label>
              <Input
                id="bag"
                value={formData.bag_number}
                onChange={(e) => setFormData({ ...formData, bag_number: e.target.value })}
                placeholder="e.g., BAG-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bus">Bus Number *</Label>
              <Input
                id="bus"
                value={formData.bus_number}
                onChange={(e) => setFormData({ ...formData, bus_number: e.target.value })}
                placeholder="e.g., BUS-01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seat">Seat Number</Label>
              <Input
                id="seat"
                value={formData.seat_number}
                onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                placeholder="e.g., A1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={handlePaymentStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.payment_status === 'PAID' && (
            <>
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('CASH')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.payment_method === 'CASH'
                        ? 'border-success bg-success/10 text-success'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="font-medium">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange('GPAY')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.payment_method === 'GPAY'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="font-medium">GPay</span>
                  </button>
                </div>
              </div>

              {formData.payment_method !== 'NONE' && (
                <div className="space-y-2">
                  <Label>Received By *</Label>
                  <Select
                    value={formData.payment_receiver}
                    onValueChange={(value) => setFormData({ ...formData, payment_receiver: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select who received payment" />
                    </SelectTrigger>
                    <SelectContent>
                      {receivers.map((receiver) => (
                        <SelectItem key={receiver} value={receiver}>
                          {receiver}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-saffron">
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
