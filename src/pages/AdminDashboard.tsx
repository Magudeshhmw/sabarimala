import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { StatCard } from '@/components/StatCard';
import { MemberTable } from '@/components/MemberTable';
import { AddMemberForm } from '@/components/AddMemberForm';
import { BusOverview } from '@/components/BusOverview';
import { Users, CreditCard, IndianRupee, AlertCircle, Bus } from 'lucide-react';

export default function AdminDashboard() {
  const { user, users } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const totalMembers = users.length;
  const paidCount = users.filter(u => u.payment_status === 'PAID').length;
  const unpaidCount = users.filter(u => u.payment_status === 'UNPAID').length;
  const totalAmount = users.reduce((sum, u) => sum + (u.payment_status === 'PAID' ? u.amount : 0), 0);
  const totalBuses = new Set(users.map(u => u.bus_number)).size;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
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

        {/* Members Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-semibold text-foreground">
              All Members
            </h2>
            <AddMemberForm />
          </div>
          <MemberTable canEdit canDelete />
        </div>
      </main >
    </div >
  );
}
