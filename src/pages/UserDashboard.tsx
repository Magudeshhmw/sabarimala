import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserIdCard } from '@/components/UserIdCard';

export default function UserDashboard() {
  const { user, getUsersByMobile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'user' || !user.mobile_number) return null;

  const userDatum = getUsersByMobile(user.mobile_number);

  if (!userDatum || userDatum.length === 0) {
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

      <main className="container mx-auto px-4 py-4 sm:py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Your Yatra Details
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Swamiye Saranam Ayyappa 🙏
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Left Column: ID Card (List) */}
          <div className="lg:col-span-5 space-y-6">
            {userDatum.map((u) => (
              <UserIdCard key={u.id} user={u} />
            ))}

            <div className="text-center text-sm text-muted-foreground lg:hidden">
              <p>For any queries, please contact the organizers.</p>
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-8 text-left h-full">
              <div>
                <h3 className="text-xl font-heading font-semibold text-primary mb-4 flex items-center gap-2">
                  🧾 TAKE & COME FROM HOME – INSTRUCTION (ENGLISH)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
                  <li>All devotees must bring ONLY the following items from home:</li>
                  <li>ID Proof (Aadhaar / any valid ID)</li>
                  <li>Mobile Phone</li>
                  <li>Power Bank + Charging Cable</li>
                  <li>Towel</li>
                  <li>Torchlight</li>
                  <li>Small cash (as per personal requirement)</li>
                  <li>1 Extra Dress (if you want)</li>
                  <li>Innerwear</li>
                </ul>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm font-medium border border-border/50">
                  <p>👉 All bags, Irumudi and pooja items will be provided by the organizer.</p>
                  <p className="mt-1">👉 Please bring only personal essentials and follow group instructions strictly.</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-8">
                <h3 className="text-xl font-heading font-semibold text-primary mb-4 flex items-center gap-2">
                  🧾 வீட்டிலிருந்து கொண்டு வர வேண்டியவை – வழிமுறைகள் (TAMIL)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
                  <li>அனைத்து ஐயப்ப பக்தர்களும் கீழே கூறப்பட்ட பொருட்களை மட்டும் வீட்டிலிருந்து கொண்டு வர வேண்டும்:</li>
                  <li>அடையாள அட்டை (ஆதார் / செல்லுபடியாகும் ஏதேனும் அடையாள அட்டை)</li>
                  <li>கைப்பேசி</li>
                  <li>பவர் பேங்க் + சார்ஜிங் கேபிள்</li>
                  <li>துவையல் துணி (Towel)</li>
                  <li>டார்ச் லைட்</li>
                  <li>தனிப்பட்ட தேவைக்கேற்ப சிறிய பணம்</li>
                  <li>1 கூடுதல் உடை (விருப்பமிருந்தால்)</li>
                  <li>உள்ளாடைகள்</li>
                </ul>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm font-medium border border-border/50">
                  <p>👉 பைகள், இருமுடி மற்றும் பூஜை பொருட்கள் அனைத்தும் ஏற்பாட்டாளரால் வழங்கப்படும்.</p>
                  <p className="mt-1">👉 தனிப்பட்ட தேவைகளுக்கான பொருட்களை மட்டும் கொண்டு வந்து குழு விதிமுறைகளை பின்பற்றவும்.</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-8">
                <h3 className="text-xl font-heading font-semibold text-primary mb-4 flex items-center gap-2">
                  🧾 घर से लाने के निर्देश (HINDI)
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-base text-muted-foreground">
                  <li>सभी श्रद्धालु केवल निम्नलिखित वस्तुएँ घर से लेकर आएँ:</li>
                  <li>पहचान पत्र (आधार / कोई भी वैध ID)</li>
                  <li>मोबाइल फोन</li>
                  <li>पावर बैंक + चार्जिंग केबल</li>
                  <li>तौलिया</li>
                  <li>टॉर्च लाइट</li>
                  <li>आवश्यकता अनुसार थोड़ा नकद पैसा</li>
                  <li>1 अतिरिक्त कपड़ा (यदि आप चाहें)</li>
                  <li>अंदर पहनने के कपड़े (Innerwear)</li>
                </ul>
                <div className="mt-4 p-4 bg-muted/30 rounded-lg text-sm font-medium border border-border/50">
                  <p>👉 सभी बैग, इरुमुडी और पूजा सामग्री आयोजक द्वारा प्रदान की जाएगी।</p>
                  <p className="mt-1">👉 केवल व्यक्तिगत आवश्यक वस्तुएँ लाएँ और समूह के निर्देशों का पालन करें।</p>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-6 hidden lg:block">
              <p>For any queries, please contact the organizers.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
