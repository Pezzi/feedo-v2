import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../services/supabase';
import { toast } from 'react-toastify';
import { Check, Crown, Award, Shield, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// 1. Estrutura de dados atualizada para incluir preços mensais e anuais
interface Plan {
  name: string;
  features: string[];
  icon: React.ElementType;
  isFeatured?: boolean;
  pricing: {
    monthly: { price: string; priceId: string };
    annually: { price: string; priceId: string };
  };
}

// Lembre-se de substituir TODOS os priceId pelos IDs reais do seu painel Stripe
const plans: Plan[] = [
  {
    name: 'Feedo Básic',
    icon: Shield,
    features: ['Até 100 feedbacks/mês', '1 QR Code', 'Dashboard Básico'],
    pricing: {
      monthly: { price: 'R$ 29/mês', priceId: 'price_1RPzJkBrqJeZRdGhmJ0hJ8J7' },
      annually: { price: 'R$ 199/ano', priceId: 'price_1RPzL2BrqJeZRdGhLYfAXY6j' },
    },
  },
  {
    name: 'Feedo Pro',
    icon: Award,
    isFeatured: true,
    features: ['Até 1000 feedbacks/mês', '10 QR Codes', 'Dashboard Avançado', 'Suporte Prioritário'],
    pricing: {
      monthly: { price: 'R$ 79/mês', priceId: 'price_1RPzMHBrqJeZRdGh07iCgklt' },
      annually: { price: 'R$ 758/ano', priceId: 'price_1RPzNLBrqJeZRdGhXS3G2PMg' },
    },
  },
  {
    name: 'Feedo Master',
    icon: Crown,
    features: ['Feedbacks ilimitados', 'QR Codes ilimitados', 'API de integração', 'Suporte Dedicado'],
    pricing: {
      monthly: { price: 'R$ 199/mês', priceId: 'price_1RPzOvBrqJeZRdGhwALwBSCD' },
      annually: { price: 'R$ 1.910/ano', priceId: 'price_1RPzORBrqJeZRdGhVG2Q1eZm' },
    },
  }
];

export const BillingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const handleCheckout = async (priceId: string) => {
    if (priceId === 'contact') {
      toast.info("Entre em contato para um plano personalizado!");
      return;
    }
      
    setLoadingPriceId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) throw new Error(error.message);

      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao iniciar o pagamento. Tente novamente.");
    } finally {
      setLoadingPriceId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Nossos Planos</h1>
        <p className="text-lg text-gray-400 mt-2">Escolha o plano que melhor se adapta ao seu negócio.</p>
      </div>

      {/* 2. Seletor de ciclo de faturamento */}
      <div className="flex justify-center items-center gap-4">
        <span className={`font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Mensal</span>
        <button
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annually' : 'monthly')}
          className="relative inline-flex h-6 w-11 items-center rounded-full"
          style={{ backgroundColor: '#333' }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              billingCycle === 'monthly' ? 'translate-x-1' : 'translate-x-6'
            }`}
          />
        </button>
        <span className={`font-medium ${billingCycle === 'annually' ? 'text-white' : 'text-gray-500'}`}>Anual</span>
        <span className="px-2 py-1 text-xs rounded-full bg-lemon/20 text-lemon font-semibold">20% OFF | Economize 2 meses</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          // 3. Seleciona o preço e o ID corretos com base no ciclo
          const currentPricing = plan.pricing[billingCycle];
          return (
            <div 
              key={plan.name} 
              className={`p-8 rounded-lg flex flex-col ${plan.isFeatured ? 'border-2 border-lemon' : 'border border-gray-700'}`}
              style={{ backgroundColor: '#232323' }}
            >
              <div className="flex items-center gap-3 mb-4">
                  <plan.icon className={`h-8 w-8 ${plan.isFeatured ? 'text-lemon' : 'text-gray-400'}`} />
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
              </div>
              <p className="text-4xl font-bold text-white mb-6">{currentPricing.price}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleCheckout(currentPricing.priceId)}
                disabled={loadingPriceId === currentPricing.priceId}
                className={`w-full py-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  plan.isFeatured 
                    ? 'bg-lemon text-gray-900 hover:bg-lemon-dark' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {loadingPriceId === currentPricing.priceId ? <Loader2 className="animate-spin" /> : null}
                {loadingPriceId === currentPricing.priceId ? 'Aguarde...' : plan.name === 'Enterprise' ? 'Entrar em Contato' : 'Assinar Agora'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};