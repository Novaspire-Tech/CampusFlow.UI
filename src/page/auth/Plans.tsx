import React, { useState, useEffect } from 'react'; 
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import CampusFlowLogo from "../../assets/campusflow-logo.svg";
import { getRedirectPath } from '../../utils/authRedirect';


interface SubscriptionFormValues {
  planId: string;
  planName: string;
  paymentMethod: string;
  transactionId: string;
  amountPaid: number;
}

const SubscriptionPage: React.FC = () => {
  const methods = useForm<SubscriptionFormValues>({
    defaultValues: {
      planId: '',
      planName: '',
      paymentMethod: 'ONLINE',
      transactionId: '',
      amountPaid: 0,
    },
  });
  
  const { handleSubmit, register, setValue, watch } = methods;
  const { subscribe, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  useEffect(() => {
    if (loading) return; 
    
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!user.registrationCompleted) {
      navigate("/school-registration", { replace: true });
      return;
    }

    if (user.subscribed) {
        navigate(getRedirectPath(user), { replace: true });
    }
  }, [user, loading, navigate]);

  const plans = [
    {
      id: 'standard_plan',
      name: 'STANDARD',
      price: 30000,
      description: '₹30,000 One Time - Lifetime Access',
      features: [
        'Full Dashboard Access',
        'Student Management',
        'Fee Management',
        'Attendance Management',
        'Basic Reports',
      ]
    },
    {
      id: 'premium_plan',
      name: 'PREMIUM',
      price: 0, 
      description: 'Custom Pricing (Contact Sales)',
      features: [
        'Everything in Standard',
        'Advanced Analytics & Smart Reports',
        'Online Admission System',
        'Lead/Enquiry Management',
        'SMS & WhatsApp Integration',
      ]
    }
  ];

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan.name);
    setValue('planName', plan.name);
    setValue('planId', plan.id);
    if (plan.price > 0) {
      setValue('amountPaid', plan.price);
    } else {
      setValue('amountPaid', 0); 
    }
  };

 const onSubmit = async (data: SubscriptionFormValues) => {
  if (!selectedPlan) {
    alert('Please select a plan first');
    return;
  }

  if (selectedPlan === 'PREMIUM' && (!data.amountPaid || data.amountPaid <= 0)) {
    const customAmount = prompt('Enter custom amount for PREMIUM plan:');
    if (!customAmount || parseFloat(customAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    data.amountPaid = parseFloat(customAmount);
  }

  setIsLoading(true);
  try {
    if (!data.transactionId) {
      data.transactionId = `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
    }

    const response = await subscribe(data);

    if (response.status !== 200) {
      throw new Error(response.message || "Subscription failed");
    }

    const updatedUser = {
      role: user?.role || 'USER', 
      registrationCompleted: user?.registrationCompleted || false,
      subscribed: true,
    };

    // Redirect to appropriate dashboard
    navigate(getRedirectPath(updatedUser), { replace: true });

  } catch (error: any) {
    alert(error.message || "An error occurred");
  } finally {
    setIsLoading(false);
  }
};

  const planName = watch('planName');
  const amountPaid = watch('amountPaid');

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated or shouldn't be here
  if (!user || user.subscribed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center py-8 px-4">
      {/* Logo */}
      <img
        src={CampusFlowLogo}
        alt="CampusFlow"
        className="w-64 mb-8"
      />

      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Choose Your Plan
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Select a plan that fits your school's needs
        </p>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                selectedPlan === plan.name
                  ? 'border-green-500 bg-slate-800/50'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
              }`}
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-gray-300 mt-1">{plan.description}</p>
                </div>
                {selectedPlan === plan.name && (
                  <span className="text-green-500">✓ Selected</span>
                )}
              </div>
              
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              {plan.price > 0 && (
                <div className="text-2xl font-bold text-white mt-4">
                  ₹{plan.price.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Form */}
        {selectedPlan && (
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Payment Details
            </h2>
            
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      {...register('planName')}
                      value={planName}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 mb-2">
                      Plan ID
                    </label>
                    <input
                      {...register('planId')}
                      readOnly
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    {...register('amountPaid', {
                      required: 'Amount is required',
                      min: { value: 0, message: 'Amount must be positive' }
                    })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter amount"
                    readOnly={selectedPlan === 'STANDARD'}
                  />
                  {selectedPlan === 'STANDARD' && (
                    <p className="text-gray-400 text-sm mt-1">
                      Standard plan price is fixed at ₹30,000
                    </p>
                  )}
                  {selectedPlan === 'PREMIUM' && amountPaid === 0 && (
                    <p className="text-yellow-400 text-sm mt-1">
                      Please enter custom amount for PREMIUM plan
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="ONLINE">Online Payment</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">
                    Transaction ID (Optional)
                  </label>
                  <input
                    {...register('transactionId')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Enter transaction ID if available"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Leave blank to auto-generate
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? 'Processing...' : `Subscribe to ${selectedPlan}`}
                </button>
              </form>
            </FormProvider>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;