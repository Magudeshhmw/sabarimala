import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethod } from '@/types/auth';
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
import { UserPlus, Banknote, Smartphone, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AddMemberForm() {
  const { addUser, users, user, paymentReceivers, addReceiver, deleteReceiver } = useAuth();
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
    referral: '',
    discount: '', // using string for input, parse to number on submit
    yathirai_count: '',
  });

  const handlePaymentStatusChange = (status: 'PAID' | 'UNPAID') => {
    if (status === 'UNPAID') {
      setFormData({
        ...formData,
        payment_status: status,
        payment_method: 'NONE',
        payment_receiver: '',
        referral: '',
      });
    } else {
      setFormData({ ...formData, payment_status: status });
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setFormData({
      ...formData,
      payment_method: method,
      payment_receiver: '',
      referral: formData.referral,
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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



    try {
      setIsLoading(true);
      await addUser({
        ...formData,
        amount: Number(formData.amount),
        discount: formData.discount ? Number(formData.discount) : 0,
      });

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
        discount: '',
        referral: '',
        yathirai_count: '',
      });
      setOpen(false);
    } catch (error) {
      // Error is handled by AuthContext toast
    } finally {
      setIsLoading(false);
    }
  };

  const [newReceiver, setNewReceiver] = useState('');
  const [isAddingReceiver, setIsAddingReceiver] = useState(false);

  const getReceivers = () => {
    if (formData.payment_method === 'NONE') return [];

    let list = paymentReceivers[formData.payment_method] || [];

    // Filter out Owner details for Admin
    if (user?.role === 'admin') {
      list = list.filter(r => !r.toLowerCase().includes('owner'));
    }

    return list;
  };

  const receivers = getReceivers();

  const handleAddReceiver = async () => {
    if (!newReceiver.trim()) return;
    if (formData.payment_method === 'NONE') return;

    await addReceiver(newReceiver, formData.payment_method);
    setNewReceiver('');
    setIsAddingReceiver(false);
  };

  const handleDeleteReceiver = async (name: string) => {
    if (formData.payment_method === 'NONE') return;
    await deleteReceiver(name, formData.payment_method);
  };

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

          <div className="space-y-2">
            <Label htmlFor="yathirai_count">Yathirai Count</Label>
            <Input
              id="yathirai_count"
              value={formData.yathirai_count}
              onChange={(e) => setFormData({ ...formData, yathirai_count: e.target.value })}
              placeholder="e.g., 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral">Referral (Optional)</Label>
            <Input
              id="referral"
              value={formData.referral || ''}
              onChange={(e) => setFormData({ ...formData, referral: e.target.value })}
              placeholder="Enter referral name"
            />
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
            <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
              <p>Payment will be marked as collected.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-saffron" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
