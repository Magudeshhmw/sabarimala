import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserIdCard } from '@/components/UserIdCard';

export default function UserDashboard() {
  const { user, getUserByMobile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'user' || !user.mobile_number) return null;

  const userData = getUserByMobile(user.mobile_number);

  if (!userData) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">User data not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Your Yatra Details
            </h2>
            <p className="text-muted-foreground mt-1">
              Swamiye Saranam Ayyappa 🙏
            </p>
          </div>
          
          <UserIdCard user={userData} />

          <div className="text-center text-sm text-muted-foreground">
            <p>For any queries, please contact the organizers.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
