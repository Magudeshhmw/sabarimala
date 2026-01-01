import { useState } from 'react';
import { User } from '@/types/auth';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit2, Trash2, Search, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberTableProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

export function MemberTable({ canEdit = false, canDelete = false }: MemberTableProps) {
  const { users, updateUser, deleteUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [filterBus, setFilterBus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    const headers = ['Name', 'Mobile', 'Bag Number', 'Bus Number', 'Seat Number', 'Payment Status', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(u => [
        u.name,
        u.mobile_number,
        u.bag_number,
        u.bus_number,
        u.seat_number || '',
        u.payment_status,
        u.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabarimala-yatra-members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredUsers.length} members to CSV`,
    });
  };

  const handlePaymentToggle = (user: User) => {
    const newStatus = user.payment_status === 'PAID' ? 'UNPAID' : 'PAID';
    updateUser(user.id, { payment_status: newStatus });
    toast({
      title: 'Payment Status Updated',
      description: `${user.name}'s payment marked as ${newStatus}`,
    });
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

  return (
    <div className="space-y-4">
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

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Bag #</TableHead>
              <TableHead>Bus</TableHead>
              <TableHead>Seat</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              {(canEdit || canDelete) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit || canDelete ? 8 : 7} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>{user.seat_number || '-'}</TableCell>
                  <TableCell>
                    {canEdit ? (
                      <button
                        onClick={() => handlePaymentToggle(user)}
                        className={user.payment_status === 'PAID' ? 'status-paid' : 'status-unpaid'}
                      >
                        {user.payment_status}
                      </button>
                    ) : (
                      <span className={user.payment_status === 'PAID' ? 'status-paid' : 'status-unpaid'}>
                        {user.payment_status}
                      </span>
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
                            onClick={() => setEditingUser(user)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
