import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Send, PartyPopper, Loader2 } from 'lucide-react';
import { usePublicQRCode, useSubmitFeedback } from '../hooks/usePublicFeedback';
import { toast } from 'react-toastify';

// Componente para as estrelas de avaliação
const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex justify-center space-x-2 my-6">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className="transition-transform duration-200 hover:scale-125"
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className="h-10 w-10"
              fill={ratingValue <= (hover || rating) ? '#DDF247' : 'none'}
              stroke={ratingValue <= (hover || rating) ? '#DDF247' : '#404040'}
            />
          </button>
        );
      })}
    </div>
  );
};


export const PublicFeedbackPage: React.FC = () => {
  const { qrCodeId } = useParams<{ qrCodeId: string }>();
  const { qrCode, loading, error } = usePublicQRCode(qrCodeId);
  const { submitFeedback, submitting } = useSubmitFeedback();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warn("Por favor, selecione uma avaliação de 1 a 5 estrelas.");
      return;
    }
    if (!qrCode || !qrCodeId) return;

    try {
      await submitFeedback(qrCodeId, qrCode.user_id, { rating, comment });
      setIsSubmitted(true);
    } catch (err) {
      toast.error("Ocorreu um erro ao enviar seu feedback. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-lemon" />
        <span className="ml-3 text-lg">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-center text-white p-4">
        <div>
          <h1 className="text-2xl font-bold text-red-500 mb-4">QR Code Inválido</h1>
          <p className="text-gray-400">O QR Code que você escaneou não foi encontrado ou é inválido.</p>
          <Link to="/" className="mt-6 inline-block text-lemon hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#161616] text-center text-white p-4">
        <div>
          <PartyPopper className="h-20 w-20 text-lemon mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Obrigado!</h1>
          <p className="text-gray-300 text-lg">Seu feedback foi enviado com sucesso.</p>
          <p className="text-sm text-gray-500 mt-2">Sua opinião é muito importante.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161616] flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Deixe seu feedback</h1>
            <p className="text-lg text-gray-400 mt-2">para <span className="font-bold text-lemon">{qrCode?.business_name || qrCode?.name}</span></p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          className="p-8 rounded-lg space-y-6"
          style={{ backgroundColor: '#232323' }}
        >
          <div>
            <label className="block text-center text-lg font-medium text-gray-300 mb-2">Qual sua nota para o serviço?</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
              Deixe um comentário (opcional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Conte-nos mais sobre sua experiência..."
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-lemon focus:border-transparent resize-none"
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-lemon text-gray-900 rounded-lg font-bold hover:bg-lemon-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="animate-spin h-5 w-5"/> Enviando...</> : <><Send className="h-5 w-5"/> Enviar Feedback</>}
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-600 mt-6">
          Powered by <span className="font-bold text-gray-500 hover:text-lemon">Feedo</span>
        </p>
       </div>
    </div>
  );
};