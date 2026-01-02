import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { read, utils } from 'xlsx';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { DashboardHeader } from '@/components/DashboardHeader';
import { StatCard } from '@/components/StatCard';
import { MemberTable } from '@/components/MemberTable';
import { AddMemberForm } from '@/components/AddMemberForm';
import { BusOverview } from '@/components/BusOverview';
import { AdminPasswordForm } from '@/components/AdminPasswordForm';
import { Users, CreditCard, IndianRupee, AlertCircle, Bus } from 'lucide-react';

export default function OwnerDashboard() {
  const { user, users, addUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as any[];

      const newMembers = jsonData.map((row: any) => ({
        name: row['Name'] || row['name'],
        mobile_number: String(row['Mobile'] || row['mobile'] || row['Phone'] || row['phone']).replace(/\D/g, '').slice(0, 10),
        bag_number: row['Bag'] || row['bag'] || row['Bag Number'],
        bus_number: row['Bus'] || row['bus'] || row['Bus Number'],
        seat_number: row['Seat'] || row['seat'] || row['Seat Number'] || '',
        payment_status: (((row['Payment'] || row['payment'] || 'UNPAID') as string).toUpperCase() === 'PAID' ? 'PAID' : 'UNPAID') as 'PAID' | 'UNPAID',
        payment_method: ((row['Method'] || row['method'] || 'NONE') as string).toUpperCase() as any,
        payment_receiver: row['Receiver'] || row['receiver'] || '',
        amount: Number(row['Amount'] || row['amount'] || 2500),
        referral: row['Referral'] || row['referral'] || '',
      }));

      let addedCount = 0;
      let errorCount = 0;

      toast.info(`Processing ${newMembers.length} records...`);

      for (const member of newMembers) {
        if (!member.name || !member.mobile_number || !member.bag_number || !member.bus_number) {
          console.warn('Skipping invalid member:', member);
          errorCount++;
          continue;
        }

        try {
          await addUser(member);
          addedCount++;
        } catch (error) {
          console.error('Failed to add member:', member, error);
          errorCount++;
        }
      }

      toast.success(`Upload Complete: Added ${addedCount} members.`);
      if (errorCount > 0) {
        toast.warning(`Skipped ${errorCount} records due to errors or duplicates.`);
      }

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Excel parse error:', error);
      toast.error('Error parsing Excel file');
    }
  };
  if (!user || user.role !== 'owner') return null;

  const totalMembers = users.length;
  const paidCount = users.filter(u => u.payment_status === 'PAID').length;
  const unpaidCount = users.filter(u => u.payment_status === 'UNPAID').length;
  const totalAmount = users.reduce((sum, u) => sum + (u.payment_status === 'PAID' ? u.amount : 0), 0);
  const totalBuses = new Set(users.map(u => u.bus_number)).size;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-4 sm:py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Members"
            value={totalMembers}
            icon={Users}
            description="Registered devotees"
            variant="primary"
          />
          <StatCard
            title="Total Buses"
            value={totalBuses}
            icon={Bus}
            description="Active vehicles"
            variant="primary"
          />
          <StatCard
            title="Paid"
            value={paidCount}
            icon={CreditCard}
            description={`${((paidCount / totalMembers) * 100).toFixed(0)}% of total`}
            variant="success"
          />
          <StatCard
            title="Unpaid"
            value={unpaidCount}
            icon={AlertCircle}
            description="Pending payments"
            variant="warning"
          />
          <StatCard
            title="Collected"
            value={`₹${totalAmount.toLocaleString()}`}
            icon={IndianRupee}
            description="Total amount"
            variant="default"
          />
        </div>



        {/* Bus Overview */}
        <BusOverview />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Password Section */}
          <div className="lg:col-span-1">
            <AdminPasswordForm />
          </div>

          {/* Members Table */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-semibold text-foreground">
                All Members
              </h2>
              <div className="flex gap-2">
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Upload Excel"
                  />
                  <button className="btn-saffron flex items-center gap-2 px-4 py-2">
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline">Bulk Upload</span>
                  </button>
                </div>
                <AddMemberForm />
              </div>
            </div>
            <MemberTable canEdit canDelete />
          </div>
        </div>
      </main >
    </div >
  );
}
