import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const CheckIn = () => {
  const [checkInMethod, setCheckInMethod] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleQRCheckIn = () => {
    setCheckInMethod('qr');
    setTimeout(() => {
      setIsCheckedIn(true);
      toast({
        title: "Check-in realizado!",
        description: "Presença confirmada via QR Code"
      });
    }, 2000);
  };

  const handleGeoCheckIn = () => {
    setCheckInMethod('geo');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setIsCheckedIn(true);
            toast({
              title: "Check-in realizado!",
              description: "Presença confirmada via localização"
            });
          }, 1500);
        },
        (error) => {
          toast({
            title: "Erro de localização",
            description: "Não foi possível acessar sua localização",
            variant: "destructive"
          });
          setCheckInMethod('');
        }
      );
    } else {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive"
      });
    }
  };

  if (isCheckedIn) {
    return (
      <div className="min-h-screen pb-28 p-6 dojo-gradient flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Check-in Realizado!</h1>
          <p className="text-gray-300 mb-6">Sua presença foi confirmada na aula</p>
          
          <div className="dojo-card p-4 mb-6">
            <h3 className="font-semibold mb-2">BJJ Fundamentals</h3>
            <p className="text-sm text-gray-300">19:00 - 20:00 • Prof. Carlos</p>
            <p className="text-sm text-gray-400">Tatame 1</p>
          </div>
          
          <Button
            onClick={() => {
              setIsCheckedIn(false);
              setCheckInMethod('');
            }}
            className="dojo-button"
          >
            Fazer Novo Check-in
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 p-6 dojo-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Check-in na Aula</h1>
          <p className="text-gray-300">Confirme sua presença</p>
        </div>

        {/* Aula atual */}
        <div className="dojo-card p-4 text-center">
          <h3 className="font-semibold text-lg mb-2">BJJ Fundamentals</h3>
          <p className="text-gray-300">19:00 - 20:00</p>
          <p className="text-gray-400">Prof. Carlos • Tatame 1</p>
        </div>

        {/* Check-in methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Escolha o método de check-in</h3>
          
          {/* QR Code Check-in */}
          <motion.div
            className="dojo-card p-6"
            whileHover={{ scale: 1.02 }}
          >
            {checkInMethod === 'qr' ? (
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-40 h-40 bg-black rounded grid grid-cols-8 gap-1 p-2">
                    {Array.from({ length: 64 }, (_, i) => (
                      <div
                        key={i}
                        className={`w-full h-full ${
                          Math.random() > 0.5 ? 'bg-white' : 'bg-black'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300">Escaneando QR Code...</p>
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mt-2" />
              </div>
            ) : (
              <div className="text-center">
                <QrCode className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">QR Code</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Escaneie o QR Code disponível na recepção ou no tatame
                </p>
                <Button
                  onClick={handleQRCheckIn}
                  className="dojo-button w-full"
                >
                  Escanear QR Code
                </Button>
              </div>
            )}
          </motion.div>

          {/* Geolocation Check-in */}
          <motion.div
            className="dojo-card p-6"
            whileHover={{ scale: 1.02 }}
          >
            {checkInMethod === 'geo' ? (
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <p className="text-sm text-gray-300">Verificando localização...</p>
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-2" />
              </div>
            ) : (
              <div className="text-center">
                <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h4 className="font-semibold mb-2">Geolocalização</h4>
                <p className="text-sm text-gray-300 mb-4">
                  Confirme automaticamente se você está na academia
                </p>
                <Button
                  onClick={handleGeoCheckIn}
                  className="dojo-button-secondary w-full"
                >
                  Usar Localização
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* Info */}
        <div className="dojo-card p-4">
          <h4 className="font-semibold mb-2">💡 Dica</h4>
          <p className="text-sm text-gray-300">
            Se você esquecer de fazer o check-in, o professor pode marcar sua presença 
            manualmente no checklist da aula.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckIn;