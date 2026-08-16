import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Upload, LogOut, Sprout, AlertCircle, Leaf } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [ragQuestion, setRagQuestion] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await client.get('/auth/me');
                setUser(response.data);
            } catch (err) {
                console.error('Auth failed', err);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setLoadingUser(false);
            }
        };

        fetchUser();
    }, [navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null); // Clear previous result
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        
        setAnalyzing(true);
        setError('');
        
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await client.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (err) {
            console.error('Upload failed', err);
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loadingUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <Sprout className="text-emerald-500 mb-4 animate-bounce" size={48} />
                    <p className="text-slate-500 font-medium">Loading AgriMind...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Sprout className="text-emerald-600" size={28} />
                            <span className="text-xl font-bold text-slate-800">AgriMind AI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-slate-600 hidden sm:block">
                                Hello, {user?.name || 'Farmer'}
                            </span>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Crop Analysis</h2>
                        <p className="text-slate-500 mb-8">Upload an image of your crop to detect diseases and get treatment recommendations.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Upload Section */}
                            <div className="flex flex-col">
                                <div 
                                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${previewUrl ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-slate-50/80'} h-64`}
                                >
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    
                                    {previewUrl ? (
                                        <div className="absolute inset-2 rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                                            <img src={previewUrl} alt="Crop preview" className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4 text-emerald-500">
                                                <Upload size={32} />
                                            </div>
                                            <p className="font-semibold text-slate-700 mb-1">Click to upload an image</p>
                                            <p className="text-sm text-slate-400">JPG, PNG up to 10MB</p>
                                        </>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={handleAnalyze}
                                    disabled={!file || analyzing}
                                    className={`mt-4 w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                                        !file 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                                    }`}
                                >
                                    {analyzing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing Image...
                                        </>
                                    ) : (
                                        <>
                                            <Leaf size={20} />
                                            Analyze Crop
                                        </>
                                    )}
                                </button>
                                
                                {error && (
                                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-2 border border-red-100">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>

                            {/* Results Section */}
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full">
                                <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
                                    Analysis Results
                                </h3>
                                
                                {!result ? (
                                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-center">
                                        <div className="w-16 h-16 border-4 border-slate-200 border-dashed rounded-full flex items-center justify-center mb-4">
                                            <Leaf className="text-slate-300" size={24} />
                                        </div>
                                        <p>Upload and analyze an image<br/>to see results here</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Detected Crop</p>
                                                <p className="font-semibold text-slate-800 capitalize">{result.crop}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                <Sprout size={20} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Disease Status</p>
                                                <p className="font-semibold text-amber-600 capitalize">{result.disease}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                                <AlertCircle size={20} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Confidence</p>
                                                <span className="font-bold text-slate-700">{Math.round(result.confidence * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                                    style={{ width: `${result.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Placeholder warning */}
                                        {result.status === 'model_not_connected' && (
                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex gap-3 shadow-inner">
                                                <div className="mt-0.5">
                                                    <AlertCircle size={16} className="text-blue-500" />
                                                </div>
                                                <p>
                                                    <span className="font-semibold block mb-1">Development Mode Active</span>
                                                    This is a placeholder response. The Python AI model is currently not connected to the endpoint.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RAG Chat Section */}
                        <div className="mt-8 border-t border-slate-200 pt-8">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Sprout className="text-emerald-500" size={24} />
                                Ask AgriMind AI Expert
                            </h3>
                            <p className="text-slate-500 mb-4">Have questions about your crops? Ask our AI expert powered by agricultural knowledge.</p>
                            
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        placeholder="E.g., How do I treat Leaf Blight?"
                                        value={ragQuestion}
                                        onChange={(e) => setRagQuestion(e.target.value)}
                                        id="rag-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') document.getElementById('ask-btn').click();
                                        }}
                                    />
                                    <button 
                                        id="ask-btn"
                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-2"
                                        onClick={async () => {
                                            if (!ragQuestion) return;
                                            const answerDiv = document.getElementById('rag-answer');
                                            answerDiv.innerHTML = '<span class="animate-pulse">Thinking...</span>';
                                            answerDiv.classList.remove('hidden');
                                            
                                            try {
                                                // We must get the token for the auth header
                                                const token = localStorage.getItem('token');
                                                const response = await fetch('http://localhost:5000/api/rag/ask', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({ question: ragQuestion })
                                                });
                                                const data = await response.json();
                                                if (!response.ok) throw new Error(data.message || 'Failed to get answer');
                                                answerDiv.innerText = data.answer;
                                            } catch (err) {
                                                answerDiv.innerHTML = `<span class="text-red-500">Error: ${err.message}</span>`;
                                            }
                                        }}
                                    >
                                        Ask
                                    </button>
                                </div>
                                
                                <div id="rag-answer" className="hidden mt-6 p-4 bg-white border border-slate-200 rounded-lg text-slate-700 whitespace-pre-wrap shadow-sm">
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
