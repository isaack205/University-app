import React from 'react';
import { useUpdate } from '@/contexts/updateContext';
import { Button } from '@/components/ui/button';
import { LoaderIcon, AlertCircleIcon, DownloadCloudIcon, XIcon, FileTextIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function UpdateBanner() {
    const { bannerVisible, isCritical, isUpdating, releaseNotes, handleDismiss, handleUpdate } = useUpdate();

    // The loader overlay MUST take precedence over everything else
    if (isUpdating) {
        return (
            <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center border border-indigo-100 flex flex-col items-center">
                    <LoaderIcon className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Updating CampusHub...</h2>
                    <p className="text-slate-500">Please wait a moment while we apply the latest features and improvements.</p>
                </div>
            </div>
        );
    }

    if (!bannerVisible) return null;

    if (isCritical) {
        return (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-red-100 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Critical Update Required</h2>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                        A mandatory system update has been downloaded. You must apply this update to continue using the application securely.
                    </p>
                    
                    {releaseNotes && (
                        <div className="text-left mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100 max-h-48 overflow-y-auto scrollbar-thin">
                            <div className="flex items-center gap-2 mb-2 text-slate-800 font-bold">
                                <FileTextIcon className="w-4 h-4 text-indigo-500" />
                                What's New in {releaseNotes.version}
                            </div>
                            <div className="text-sm text-slate-600 prose prose-sm prose-indigo dark:prose-invert">
                                <ReactMarkdown>{releaseNotes.body}</ReactMarkdown>
                            </div>
                            {releaseNotes.url && (
                                <a href={releaseNotes.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-3 inline-block font-medium">
                                    View on GitHub →
                                </a>
                            )}
                        </div>
                    )}

                    <Button 
                        onClick={handleUpdate} 
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-6 text-lg"
                    >
                        <DownloadCloudIcon className="w-5 h-5 mr-2" />
                        Apply Critical Update Now
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[100] w-full max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="bg-white rounded-xl shadow-2xl border border-indigo-100 p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <DownloadCloudIcon className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Update Available ✨</h3>
                            <p className="text-sm text-slate-500">A new version of CampusHub is ready.</p>
                        </div>
                    </div>
                    <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {releaseNotes && (
                    <div className="bg-indigo-50/50 rounded-lg p-3 max-h-32 overflow-y-auto scrollbar-thin border border-indigo-100/50">
                        <div className="flex items-center gap-2 mb-1.5 text-indigo-900 font-semibold text-sm">
                            <FileTextIcon className="w-3.5 h-3.5 text-indigo-500" />
                            What's New in {releaseNotes.version}
                        </div>
                        <div className="text-xs text-slate-600 prose prose-sm prose-indigo max-w-none">
                            <ReactMarkdown>{releaseNotes.body}</ReactMarkdown>
                        </div>
                        {releaseNotes.url && (
                            <a href={releaseNotes.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:underline mt-2 inline-block font-semibold uppercase tracking-wider">
                                View full changelog →
                            </a>
                        )}
                    </div>
                )}

                <div className="flex gap-2 mt-2">
                    <Button onClick={handleUpdate} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                        Update Now
                    </Button>
                    <Button onClick={handleDismiss} variant="outline" className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50">
                        Later
                    </Button>
                </div>
            </div>
        </div>
    );
}
