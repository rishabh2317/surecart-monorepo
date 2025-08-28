// frontend/components/creator/CampaignModal.tsx
'use client';

import Link from 'next/link';
import { X } from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    description?: string;
    coverImageUrl: string;
}

interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: Campaign | null;
}

export default function CampaignModal({ isOpen, onClose, campaign }: CampaignModalProps) {
    if (!isOpen || !campaign) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
                    <X />
                </button>
                <div className="aspect-video w-full">
                    <img src={campaign.coverImageUrl} alt={campaign.name} className="w-full h-full object-cover rounded-t-2xl" />
                </div>
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-slate-800">{campaign.name}</h3>
                    <p className="mt-2 text-slate-600">{campaign.description || 'Discover and share products from this exciting campaign.'}</p>
                    <Link
                        href={`/collections/new?campaignId=${campaign.id}&campaignName=${encodeURIComponent(campaign.name)}`}
                        onClick={onClose}
                        className="mt-6 inline-flex items-center justify-center w-full px-6 py-3 font-semibold text-white bg-teal-500 rounded-lg shadow-md hover:bg-teal-600"
                    >
                        Create Now
                    </Link>
                </div>
            </div>
        </div>
    );
}