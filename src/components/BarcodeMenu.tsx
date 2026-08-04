import React, { useState, useEffect, useRef } from 'react';
import { Search, Printer, Camera, Usb, PackageCheck, Tags, ShoppingCart, Box, Maximize } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../utils/apiClient';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function BarcodeMenu() {
    const [viewMode, setViewMode] = useState('PRINT'); // 'PRINT' or 'SCAN'
    const [search, setSearch] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

    // Scanner states
    const [scannedCode, setScannedCode] = useState('');
    const [scanResult, setScanResult] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['scan_products', search],
        queryFn: async () => (await apiClient.get(`/products?search=${search}`)).data,
        enabled: viewMode === 'PRINT' && search.length > 2
    });

    const addForPrint = (prod: any) => {
        if (!selectedProducts.find(p => p.id === prod.id)) {
            setSelectedProducts([...selectedProducts, { ...prod, printCount: 1 }]);
        }
        setSearch('');
    };

    const handlePrint = () => {
        window.print();
    };

    // Camera Scan Logic
    useEffect(() => {
        if (viewMode === 'SCAN') {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scannerRef.current = scanner;
            scanner.render((text) => {
                setScannedCode(text);
                fetchScannedProduct(text);
                scanner.clear();
            }, (err) => { /* ignore */ });
            setIsScanning(true);
            return () => {
                scanner.clear();
            };
        }
    }, [viewMode]);

    // USB Scanner Generic Listener via input field hook
    const handleSimulatedUSBSwipe = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && scannedCode) {
            await fetchScannedProduct(scannedCode);
        }
    };

    const fetchScannedProduct = async (code: string) => {
        try {
            const res = await apiClient.get(`/products/scan?code=${code}`);
            setScanResult(res.data);
        } catch (err: any) {
            alert('Product not found for code: ' + code);
        }
    };

    const routeTo = (moduleTab: string) => {
        if (!scanResult) return;
        window.location.search = `?tab=${moduleTab}&scan=${scanResult.barcode}`;
    };

    return (
        <div className="flex flex-col h-full gap-4 relative print-container">
            {/* Header (Hide when printing) */}
            <div className="flex justify-between items-center no-print">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--secondary)' }}>Barcode & QR</h1>
                    <p className="text-muted mt-1">Generate labels, print in bulk, and optical scan connectivity.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('PRINT')}
                        className={`btn ${viewMode === 'PRINT' ? 'btn-primary' : ''}`}
                        style={{ background: viewMode !== 'PRINT' ? 'white' : '' }}>
                        <Printer size={16} /> Print Labels
                    </button>
                    <button
                        onClick={() => setViewMode('SCAN')}
                        className={`btn ${viewMode === 'SCAN' ? 'btn-primary' : ''}`}
                        style={{ background: viewMode !== 'SCAN' ? 'white' : '' }}>
                        <Camera size={16} /> Camera / USB Scanner
                    </button>
                </div>
            </div>

            {viewMode === 'PRINT' ? (
                <div className="flex flex-1 gap-4 overflow-hidden">
                    {/* Left Panel: Search & Controls */}
                    <div className="w-1/3 flex flex-col gap-4 no-print border-r pr-4">
                        <div className="card p-4 pb-0 relative">
                            <h3 className="font-bold text-sm text-muted uppercase mb-3 flex items-center gap-2"><Tags size={16} /> Select Items</h3>
                            <div className="search-bar mb-4" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', margin: 0 }}>
                                <Search size={16} className="text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search Product to Print..."
                                    className="search-input text-sm w-full"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>

                            {search.length > 2 && (
                                <div className="absolute top-20 left-0 w-full bg-white shadow-xl rounded-lg border z-20 max-h-64 overflow-y-auto">
                                    {isLoading ? <div className="p-3 text-center text-sm">Searching...</div> : products?.data?.map((p: any) => (
                                        <div key={p.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => addForPrint(p)}>
                                            <div className="font-bold text-sm">{p.name}</div>
                                            <div className="text-xs text-muted">SKU: {p.sku} • {p.barcode}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto card p-0">
                            {selectedProducts.map((p, idx) => (
                                <div key={p.id} className="p-4 border-b bg-gray-50">
                                    <div className="font-bold text-sm mb-1">{p.name}</div>
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span>SKU: {p.sku}</span>
                                        <button onClick={() => setSelectedProducts(selectedProducts.filter(x => x.id !== p.id))} className="text-danger text-xs hover:underline">Remove</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold uppercase text-muted">Copies:</span>
                                        <input type="number" min="1" className="p-1 border rounded w-16 text-sm" value={p.printCount} onChange={e => {
                                            const nu = [...selectedProducts]; nu[idx].printCount = Number(e.target.value); setSelectedProducts(nu);
                                        }} />
                                    </div>
                                </div>
                            ))}
                            {selectedProducts.length === 0 && <div className="p-8 text-center text-muted text-sm">No products selected for print.</div>}
                        </div>

                        {selectedProducts.length > 0 && (
                            <button onClick={handlePrint} className="btn btn-primary shadow-lg py-4 w-full flex items-center justify-center gap-2 font-bold text-lg">
                                <Printer size={20} /> Bulk Print Labels
                            </button>
                        )}
                    </div>

                    {/* Right Panel: Print Preview Array */}
                    <div className="flex-1 overflow-y-auto bg-gray-100 p-8 rounded-xl print-area">
                        <style>{`
                            @media print {
                                body * { visibility: hidden; }
                                .print-area, .print-area * { visibility: visible; }
                                .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; padding: 0 !important; }
                                .no-print { display: none !important; }
                                .label-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; padding: 10mm; }
                                .print-label { page-break-inside: avoid; border: 1px solid #ddd; padding: 8px; border-radius: 8px; }
                            }
                        `}</style>
                        <h2 className="text-xl font-bold mb-6 no-print text-gray-400 border-b pb-2">Print Preview</h2>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 label-grid">
                            {selectedProducts.flatMap(p =>
                                Array(p.printCount).fill(null).map((_, i) => (
                                    <div key={`${p.id}-${i}`} className="print-label bg-white border border-gray-200 shadow-sm p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                        <div className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1">AURA JEWELS</div>
                                        <div className="text-[10px] text-gray-500 mb-3 truncate w-full">{p.name}</div>

                                        <Barcode value={p.barcode} height={40} width={1.5} displayValue={true} fontSize={12} margin={0} />

                                        <div className="flex justify-between w-full mt-3 px-2">
                                            <div className="text-[10px] text-gray-500 text-left">
                                                <div>GW: {p.grossWeight}g</div>
                                                <div>NW: {p.netWeight}g</div>
                                            </div>
                                            <div className="text-[10px] font-bold text-right">
                                                <div className="text-black">₹{p.price.toLocaleString('en-IN')}</div>
                                                <div className="text-gray-400">SKU: {p.sku}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex h-full gap-6 items-start">
                    <div className="w-1/2 flex flex-col gap-4">
                        <div className="card p-6 border-2 border-primary/20 shadow-xl overflow-hidden bg-white">
                            <h2 className="font-bold mb-4 flex items-center gap-2"><Camera className="text-primary" /> Optical Camera Array</h2>
                            <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border-4 border-gray-100 min-h-[300px]"></div>
                        </div>

                        <div className="card p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm border border-gray-200">
                            <h2 className="font-bold mb-4 flex items-center gap-2"><Usb className="text-gray-600" /> USB Scanner Input</h2>
                            <p className="text-sm text-gray-500 mb-4">Focus the input below before triggering your USB / Bluetooth handheld scanner.</p>
                            <input
                                autoFocus
                                type="text"
                                className="search-input w-full p-4 text-xl tracking-widest font-mono text-center border-2 border-dashed border-gray-300 focus:border-primary transition-colors focus:ring-0"
                                placeholder="|||||||||||||||||||||||| SCAN HERE"
                                value={scannedCode}
                                onChange={e => setScannedCode(e.target.value)}
                                onKeyDown={handleSimulatedUSBSwipe}
                            />
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col h-full gap-4">
                        <div className="card p-6 flex-1 flex flex-col items-center justify-center relative shadow-sm border border-gray-100 bg-white group hover:border-primary transition-colors">
                            <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-primary transition-colors">Live Payload Result</div>

                            {!scanResult ? (
                                <div className="text-center opacity-40">
                                    <Maximize size={64} className="mx-auto mb-4 animate-pulse stroke-1" />
                                    <p className="text-lg">Awaiting Scanner Input...</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center animate-in zoom-in duration-300 w-full">
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <PackageCheck size={48} className="text-green-600" />
                                    </div>
                                    <h2 className="text-3xl font-black mb-2 text-gray-800">{scanResult.name}</h2>
                                    <p className="text-gray-500 mb-6 font-mono text-lg">{scanResult.barcode} • SKU: {scanResult.sku}</p>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-8 max-w-md">
                                        <div className="bg-gray-50 p-3 rounded-lg border">
                                            <div className="text-xs text-muted uppercase">Gross Weight</div>
                                            <div className="font-bold text-lg">{scanResult.grossWeight}g</div>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border">
                                            <div className="text-xs text-muted uppercase">Global Stock</div>
                                            <div className={`font-bold text-lg ${scanResult.stock > 0 ? 'text-success' : 'text-danger'}`}>{scanResult.stock} Units</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full max-w-md">
                                        <button onClick={() => routeTo('pos')} className="btn btn-primary flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1 shadow-lg hover:-translate-y-1 transition-transform">
                                            <ShoppingCart size={20} /> Push to Sales POS
                                        </button>
                                        <button onClick={() => routeTo('inventory')} className="btn flex-1 py-4 text-sm font-bold flex flex-col items-center gap-1 shadow-sm hover:!bg-gray-100 border transition-all" style={{ background: 'white', color: 'var(--secondary)' }}>
                                            <Box size={20} /> Push to Inventory
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
