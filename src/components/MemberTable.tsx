import { utils, writeFile } from 'xlsx';

import { useState } from 'react';
import { User, PaymentMethod } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/dialog';
import { Edit2, Trash2, Search, Download, Filter, Banknote, Smartphone, Users, Bus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberTableProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

export function MemberTable({ canEdit = false, canDelete = false }: MemberTableProps) {
  const { users, updateUser, deleteUser, user: currentUser, paymentReceivers } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterBus, setFilterBus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  const busNumbers = [...new Set(users.map(u => u.bus_number))].sort();

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile_number.includes(search) ||
      user.bag_number.toLowerCase().includes(search.toLowerCase());

    const matchesPayment = filterPayment === 'all' || user.payment_status === filterPayment;
    const matchesBus = filterBus === 'all' || user.bus_number === filterBus;

    return matchesSearch && matchesPayment && matchesBus;
  });
  const handleExport = () => {
    const exportData = filteredUsers.map(u => {
      // Handle Payment Receiver privacy for Admin
      let receiver = u.payment_receiver || '-';
      if (currentUser?.role === 'admin' && receiver.toLowerCase().includes('owner')) {
        receiver = 'Protected';
      }

      return {
        'Name': u.name,
        'Mobile': u.mobile_number,
        'Bag Number': u.bag_number,
        'Bus Number': u.bus_number,
        'Payment Status': u.payment_status,
        'Payment Method': u.payment_method,
        'Received By': receiver,
        'Amount': u.amount,
        'Referral': u.referral || '-'
      };
    });

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Members");

    // Auto-width columns
    const max_width = exportData.reduce((w, r) => Math.max(w, r.Name.length), 10);
    ws['!cols'] = [
      { wch: max_width }, // Name
      { wch: 12 }, // Mobile
      { wch: 10 }, // Bag
      { wch: 10 }, // Bus
      { wch: 12 }, // Status
      { wch: 10 }, // Method
      { wch: 15 }, // Receiver
      { wch: 10 }, // Amount
      { wch: 15 }  // Referral
    ];

    writeFile(wb, `sri-sastha-seva-members-${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredUsers.length} members to Excel`,
    });
  };

  const handleEditOpen = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      mobile_number: user.mobile_number,
      bag_number: user.bag_number,
      bus_number: user.bus_number,
      seat_number: user.seat_number || '',
      payment_status: user.payment_status,
      payment_method: user.payment_method,
      payment_receiver: user.payment_receiver || '',
      amount: user.amount,
    });
  };

  const handlePaymentStatusChange = (status: 'PAID' | 'UNPAID') => {
    if (status === 'UNPAID') {
      setEditForm({
        ...editForm,
        payment_status: status,
        payment_method: 'NONE',
        payment_receiver: ''
      });
    } else {
      setEditForm({ ...editForm, payment_status: status });
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setEditForm({
      ...editForm,
      payment_method: method,
      payment_receiver: ''
    });
  };

  const handleEditSave = () => {
    if (editingUser && editForm.name && editForm.mobile_number) {
      if (editForm.payment_status === 'PAID' && editForm.payment_method === 'NONE') {
        toast({
          title: 'Validation Error',
          description: 'Please select a payment method',
          variant: 'destructive',
        });
        return;
      }
      if (editForm.payment_status === 'PAID' && !editForm.payment_receiver) {
        toast({
          title: 'Validation Error',
          description: 'Please select who received the payment',
          variant: 'destructive',
        });
        return;
      }
      updateUser(editingUser.id, editForm);
      toast({
        title: 'Member Updated',
        description: `${editForm.name}'s details have been updated`,
      });
      setEditingUser(null);
      setEditForm({});
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteUser(deleteConfirm.id);
      toast({
        title: 'Member Deleted',
        description: `${deleteConfirm.name} has been removed`,
        variant: 'destructive',
      });
      setDeleteConfirm(null);
    }
  };

  const getReceivers = () => {
    if (!editForm.payment_method || editForm.payment_method === 'NONE') return [];

    let list = paymentReceivers[editForm.payment_method] || [];

    // Filter out Owner details for Admin
    if (currentUser?.role === 'admin') {
      list = list.filter(r => !r.toLowerCase().includes('owner'));
    }

    return list;
  };

  const receivers = getReceivers();

  return (
    <div className="space-y-4">
      {/* Bus Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* All Buses Card */}


        {/* Individual Bus Cards */}
        {busNumbers.map(bus => {
          const count = users.filter(u => u.bus_number === bus).length;
          return (
            <div
              key={bus}
              onClick={() => setFilterBus(bus)}
              className={`cursor-pointer p-4 rounded-xl border transition-all hover:shadow-md ${filterBus === bus ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-muted-foreground font-medium">Bus {bus}</span>
                <div className={`p-2 rounded-lg ${filterBus === bus ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Bus className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold font-heading">{count}</div>
              <div className="text-xs text-muted-foreground mt-1">Devotees</div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, mobile, or bag number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterPayment} onValueChange={setFilterPayment}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="UNPAID">Unpaid</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBus} onValueChange={setFilterBus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Bus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buses</SelectItem>
              {busNumbers.map(bus => (
                <SelectItem key={bus} value={bus}>{bus}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Bag #</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit || canDelete ? 9 : 8} className="text-center py-8 text-muted-foreground">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono text-sm">{user.mobile_number}</TableCell>
                  <TableCell>{user.bag_number}</TableCell>
                  <TableCell>{user.bus_number}</TableCell>
                  <TableCell>
                    <span className={user.payment_status === 'PAID' ? 'status-paid' : 'status-unpaid'}>
                      {user.payment_status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.payment_method === 'CASH' && (
                      <span className="flex items-center gap-1 text-success text-sm">
                        <Banknote className="w-4 h-4" /> Cash
                      </span>
                    )}
                    {user.payment_method === 'GPAY' && (
                      <span className="flex items-center gap-1 text-primary text-sm">
                        <Smartphone className="w-4 h-4" /> GPay
                      </span>
                    )}
                    {user.payment_method === 'NONE' && (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{user.amount.toLocaleString()}</TableCell>
                  {(canEdit || canDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditOpen(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteConfirm(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} members
      </p>

      {/* Edit Member Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Member</DialogTitle>
            <DialogDescription>
              Update the devotee's details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-mobile">Mobile Number</Label>
              <Input
                id="edit-mobile"
                value={editForm.mobile_number || ''}
                onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-bag">Bag Number</Label>
                <Input
                  id="edit-bag"
                  value={editForm.bag_number || ''}
                  onChange={(e) => setEditForm({ ...editForm, bag_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-bus">Bus Number</Label>
                <Input
                  id="edit-bus"
                  value={editForm.bus_number || ''}
                  onChange={(e) => setEditForm({ ...editForm, bus_number: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount (₹)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount || 0}
                onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select
                value={editForm.payment_status}
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

            {editForm.payment_status === 'PAID' && (
              <>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange('CASH')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${editForm.payment_method === 'CASH'
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
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${editForm.payment_method === 'GPAY'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-muted-foreground'
                        }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="font-medium">GPay</span>
                    </button>
                  </div>
                </div>

                {editForm.payment_method && editForm.payment_method !== 'NONE' && (
                  <div className="space-y-2">
                    <Label>Received By</Label>
                    <Select
                      value={editForm.payment_receiver || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, payment_receiver: value })}
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
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} className="btn-saffron">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
