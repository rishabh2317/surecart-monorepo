// components/creator/TransactionsDrawer.tsx
'use client';

import { X, ArrowDown, ArrowUp } from 'lucide-react';

const TransactionRow = ({ transaction }: { transaction: any }) => {
    const isCredit = transaction.amount > 0;
    const Icon = isCredit ? ArrowUp : ArrowDown;
    const color = isCredit ? 'text-green-500' : 'text-red-500';

    return (
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full bg-slate-100 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-semibold text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-lg ${color}`}>
                    {isCredit ? '+' : ''}
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: transaction.currency }).format(transaction.amount)}
                </p>
                <p className={`text-xs font-semibold uppercase ${transaction.status === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>
                    {transaction.status}
                </p>
            </div>
        </div>
    );
};

interface TransactionsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: any[];
}

export default function TransactionsDrawer({ isOpen, onClose, transactions }: TransactionsDrawerProps) {
    return (
        <>
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>
            
            {/* Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                        <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
                        <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><X /></button>
                    </header>
                    <div className="overflow-y-auto flex-grow">
                        {transactions.map((tx: any) => <TransactionRow key={tx.id} transaction={tx} />)}
                        {transactions.length === 0 && <p className="p-4 text-slate-500">No transactions yet.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}