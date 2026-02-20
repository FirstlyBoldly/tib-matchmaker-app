import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, CheckCircle, MapPin } from 'lucide-react';

const CheckInScreen = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setStep(1), 1500), // Connecting -> Connected
            setTimeout(() => setStep(2), 3000), // Checking In
            setTimeout(() => setStep(3), 4500), // Success
            setTimeout(() => onComplete(), 5500) // Transition
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="full-screen" style={{
            zIndex: 10,
            background: 'var(--color-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ textAlign: 'center' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    style={{ marginBottom: '2rem' }}
                >
                    {step === 0 && <Wifi size={64} className="pulse-animation" color="var(--color-secondary)" />}
                    {step === 1 && <Wifi size={64} color="var(--color-secondary)" />}
                    {step === 2 && <MapPin size={64} className="pulse-animation" color="var(--color-accent)" />}
                    {step >= 3 && <CheckCircle size={64} color="#10B981" />}
                </motion.div>

                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {step === 0 && 'Connecting to TiB 6G...'}
                    {step === 1 && 'Connected Securely'}
                    {step === 2 && 'Locating Position...'}
                    {step >= 3 && 'Checked In'}
                </h1>

                <p style={{ color: '#666' }}>
                    {step === 0 && 'Searching for private network'}
                    {step === 1 && 'Verifying credentials'}
                    {step === 2 && 'Triangulating with <1cm precision'}
                    {step >= 3 && 'Welcome to Tokyo Innovation Base'}
                </p>
            </div>
        </div>
    );
};

export default CheckInScreen;
