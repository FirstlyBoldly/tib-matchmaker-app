import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Linkedin, FileText, UserPlus, ArrowRight, Check } from 'lucide-react';

const ProfileReader = ({ onComplete }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const options = [
        { id: 'linkedin', icon: <Linkedin size={24} />, title: 'Link LinkedIn', description: 'Import professional details' },
        { id: 'resume', icon: <FileText size={24} />, title: 'Upload Resume', description: 'AI-powered profile extraction' },
        { id: 'manual', icon: <UserPlus size={24} />, title: 'Manual Entry', description: 'Enter details yourself' },
    ];

    const handleSelect = (optionId) => {
        setSelectedOption(optionId);
        setIsProcessing(true);
        
        // Simulate processing
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => onComplete(), 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
    };

    return (
        <div className="full-screen" style={{
            zIndex: 20,
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 24px',
            color: 'black'
        }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '12px' }}>
                    Build Your Profile
                </h1>
                <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.5' }}>
                    How would you like to set up your profile for the TIB community?
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {options.map((option) => (
                    <motion.div
                        key={option.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !isProcessing && handleSelect(option.id)}
                        style={{
                            padding: '24px',
                            borderRadius: '24px',
                            background: selectedOption === option.id ? 'black' : '#f8f7f6',
                            color: selectedOption === option.id ? 'white' : 'black',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: isProcessing ? 'default' : 'pointer',
                            border: '1px solid #eeeeee',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: selectedOption === option.id ? 'rgba(255,255,255,0.1)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {option.icon}
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 'bold', fontSize: '18px' }}>{option.title}</h3>
                                <p style={{ fontSize: '14px', opacity: 0.7 }}>{option.description}</p>
                            </div>
                        </div>
                        {selectedOption === option.id ? (
                          <Check size={20} />
                        ) : (
                          <ArrowRight size={20} style={{ opacity: 0.3 }} />
                        )}
                        
                        {isProcessing && selectedOption === option.id && (
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    height: '4px',
                                    background: 'var(--color-secondary)',
                                    zIndex: 2
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: 'auto', textAlign: 'center' }}
                    >
                        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            {progress < 100 ? 'Constructing profile...' : 'Profile Ready!'}
                        </p>
                        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                style={{ height: '100%', background: 'black' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ marginTop: 'auto', padding: '20px 0', opacity: 0.5, fontSize: '12px', textAlign: 'center' }}>
                Your data is stored locally and used only for matchmaking.
            </div>
        </div>
    );
};

export default ProfileReader;
