import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Navigation, Zap, Bell, Settings, Circle, Flag, QrCode } from 'lucide-react';
import { getRoomAtPosition } from '../data/mapData';

const Dashboard = ({ users, currentUser, onUserSelect, selectedUser, onBack, isPublic, onTogglePublic }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [notification, setNotification] = useState(null);

    // Auto-expand when a user is selected
    React.useEffect(() => {
        if (selectedUser) {
            setIsExpanded(true);
        }
    }, [selectedUser]);

    // Dummy Notification System
    React.useEffect(() => {
        if (!isPublic) return;

        const interval = setInterval(() => {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            setNotification(`${randomUser.name} is nearby! ${randomUser.matchReason}`);
            setTimeout(() => setNotification(null), 5000);
        }, 15000);

        return () => clearInterval(interval);
    }, [isPublic, users]);

    return (
        <div className="full-screen" style={{ zIndex: 5, pointerEvents: 'none' }}>

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))',
                pointerEvents: 'none',
                zIndex: 10
            }}>
                <div style={{ width: '80px' }}></div> {/* Spacer */}
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '900',
                    color: 'var(--color-primary)',
                    letterSpacing: '-1px'
                }}>
                    TiB
                </h1>
                <div style={{ pointerEvents: 'auto' }}>
                    <button
                        onClick={onTogglePublic}
                        style={{
                            background: isPublic ? 'black' : '#eee',
                            color: isPublic ? 'white' : '#666',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Circle size={10} fill={isPublic ? '#10B981' : '#ccc'} stroke="none" />
                        {isPublic ? 'Public' : 'Private'}
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 80, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            left: '20px',
                            right: '20px',
                            background: 'black',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '16px',
                            zIndex: 100,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <Zap size={20} color="var(--color-secondary)" />
                            <div>
                                <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Someone interesting nearby!</p>
                                <p style={{ fontSize: '12px', opacity: 0.8 }}>{notification}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Navbar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '70px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingBottom: '10px',
                pointerEvents: 'auto',
                borderTop: '1px solid #eee',
                zIndex: 20
            }}>
                <NavButton icon={<Circle size={20} />} label="Community" isActive />
                <NavButton icon={<Flag size={20} />} label="Event" />
                <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'black',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginBottom: '20px', // Popped up slightly
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                    <QrCode size={24} />
                </div>
                <NavButton icon={<Bell size={20} />} label="Notify" />
                <NavButton icon={<Settings size={20} />} label="Setting" />
            </div>

            {/* Recommendations (Updates floating above navbar) */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 400 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 50;
                    if (offset.y > swipeThreshold || velocity.y > 500) {
                        setIsExpanded(false);
                    } else if (offset.y < -swipeThreshold || velocity.y < -500) {
                        setIsExpanded(true);
                    }
                }}
                animate={{ y: isExpanded ? 0 : 'calc(100% - 60px)' }}
                initial={{ y: '100%' }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="" // Removed glass-panel
                style={{
                    position: 'absolute',
                    bottom: '80px', // Sit above navbar
                    left: '10px',
                    right: '10px',
                    padding: '20px',
                    borderRadius: '24px',
                    pointerEvents: 'auto',
                    maxHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#f8f7f6', // Off-white as requested
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
                }}
            >
                {/* Drag Handle */}
                <div onClick={() => setIsExpanded(!isExpanded)} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0', cursor: 'grab', marginTop: '-10px' }}>
                    <div style={{ width: '40px', height: '4px', background: '#ccc', borderRadius: '2px' }}></div>
                </div>

                {selectedUser ? (
                    // User Profile View (Merged from NavigationOverlay)
                    <div style={{ padding: '0 10px' }}>

                        {/* Back Button / Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <button onClick={() => {
                                setIsExpanded(true);
                                onBack();
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                                <Navigation size={20} style={{ transform: 'rotate(-90deg)' }} /> Back
                            </button>
                        </div>

                        {/* Profile Header */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '3px solid white',
                                background: 'black',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white'
                            }}>
                                <img src={selectedUser.imageUrl} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'black' }}>{selectedUser.name}</h2>
                            <p style={{ fontSize: '14px', color: '#333', marginBottom: '8px', fontWeight: '500' }}>{selectedUser.role} @ {selectedUser.company}</p>
                            <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '80%', fontStyle: 'italic', color: '#444' }}>"{selectedUser.bio}"</p>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(0,0,0,0.1)', margin: '0 0 24px' }}></div>

                        {/* AI Match Reason */}
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '24px',
                            marginBottom: '24px',
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <Zap size={18} fill="black" />
                                <h3 style={{ fontSize: '16px', fontWeight: '900' }}>AI Matchmaker</h3>
                            </div>
                            <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.6' }}>
                                <span style={{ fontWeight: 'bold', color: 'black' }}>Why this connection?</span><br />
                                {selectedUser.matchReason}
                            </p>
                        </div>

                        {/* Navigation Info */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ flex: 1, background: 'black', padding: '16px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                <p style={{ fontSize: '12px', color: '#ccc' }}>Distance</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{selectedUser.distance}</p>
                            </div>
                            <div style={{ flex: 1, background: 'black', padding: '16px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                                <p style={{ fontSize: '12px', color: '#ccc' }}>Location</p>
                                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Floor {selectedUser.floor}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#666' }}>
                                <Navigation size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                {selectedUser.floor === 1 ? 'Go straight ahead' : 'Head to the nearest escalator'}
                            </p>
                        </div>
                    </div>
                ) : (
                    // Default List View
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '900',
                                color: 'black',
                                borderBottom: '4px solid black',
                                paddingBottom: '2px',
                                lineHeight: '1'
                            }}>
                                AI Recommendations
                            </h2>
                            <span style={{ fontSize: '12px', color: 'white', background: 'black', padding: '4px 8px', borderRadius: '12px' }}>
                                Matches for you
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: isExpanded ? 'auto' : 'hidden' }}>
                            {users.map(user => {
                                const room = getRoomAtPosition(user.position, user.floor);
                                const locationText = `Floor ${user.floor}${room ? ` • ${room.name}` : ''}`;

                                return (
                                    <div key={user.id} onClick={() => onUserSelect(user)} style={{
                                        padding: '12px',
                                        background: '#ffffff', // Full white
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        border: '1px solid #f0f0f0', // Very subtle border
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                <img src={user.imageUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: 'black' }}>{user.name}</h4>
                                                <p style={{ fontSize: '12px', color: '#666' }}>{user.role}</p>
                                                <p style={{ fontSize: '10px', color: 'black', fontWeight: 'bold' }}>{locationText}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <div style={{ background: 'black', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold' }}>
                                                {user.distance}
                                            </div>
                                            <Navigation size={14} color="black" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </motion.div>

        </div>
    );
};

const NavButton = ({ icon, label, isActive }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: isActive ? 'black' : '#666', // Black for active, dark gray for inactive
        cursor: 'pointer'
    }}>
        {icon}
        <span style={{ fontSize: '10px', fontWeight: isActive ? 'bold' : 'normal' }}>{label}</span>
    </div>
);

export default Dashboard;
