// components/shared/ShareModal.tsx
'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebook, FaXTwitter } from 'react-icons/fa6';
import { QRCodeSVG } from 'qrcode.react';

// --- SVG Icons for Social Media ---
// --- SVG Icons for Social Media ---

interface ShareModalProps {
    url: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareModal({ url, isOpen, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    // This creates the correct share URLs for each platform
    const shareMessage = encodeURIComponent("Take a look! 📌");
    const encodedUrl = encodeURIComponent(url);

    const socialLinks = {
        whatsapp: `https://api.whatsapp.com/send?text=${shareMessage}%20${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareMessage}`,
        // Instagram does not support direct URL sharing via web links, 
        // so we link to their homepage as a fallback.
        instagram: `https://www.instagram.com/`, 
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X /></button>
                <h3 className="text-xl font-bold text-slate-800 text-center mb-6">Share this Collection</h3>
                
                <div className="grid grid-cols-4 gap-4 text-center mb-6">
    <a href={socialLinks.whatsapp} data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-600 hover:text-green-500 transition-colors">
        <FaWhatsapp className="w-10 h-10 text-green-500" />
        <span className="text-xs mt-2">WhatsApp</span>
    </a>
    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-600 hover:text-pink-600 transition-colors">
        <FaInstagram className="w-10 h-10 text-pink-600" />
        <span className="text-xs mt-2">Instagram</span>
    </a>
    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-600 hover:text-blue-600 transition-colors">
        <FaFacebook className="w-10 h-10 text-blue-600" />
        <span className="text-xs mt-2">Facebook</span>
    </a>
    <a href={socialLinks.x} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-600 hover:text-black transition-colors">
        <FaXTwitter className="w-10 h-10 text-black" />
        <span className="text-xs mt-2">X</span>
    </a>
</div>

                <div className="flex rounded-lg shadow-sm border border-slate-300">
                    <input type="text" readOnly className="flex-1 block w-full px-3 py-2 rounded-l-lg bg-slate-100 text-sm" value={url} />
                    <button onClick={handleCopy} className={`inline-flex items-center px-4 py-2 rounded-r-lg text-sm font-medium ${copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-white'}`}>
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                <div className="my-6 text-center text-sm text-slate-500">Or</div>

                <div className="flex flex-col items-center">
                    <div className="p-2 bg-white border rounded-lg">
                        <QRCodeSVG value={url} size={128} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">Scan QR Code</p>
                </div>
            </div>
        </div>
    );
}