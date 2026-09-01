import React, { useEffect, useState, useMemo } from "react";
import { feedbackService } from "@/services/feedbackApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    LoaderIcon,
    SearchIcon,
    MessageSquareIcon,
    AlertCircleIcon,
    LightbulbIcon,
    CheckCircle2Icon,
    ClockIcon,
    MoreHorizontalIcon,
    UserIcon,
    MailIcon,
    CalendarIcon,
    SendIcon
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function AdminFeedback() {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Status update states
    const [updating, setUpdating] = useState(false);
    const [adminNote, setAdminNote] = useState('');
    const [newStatus, setNewStatus] = useState('');

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            const res = await feedbackService.getAllFeedback();
            setFeedbacks(res || []);
            // Auto-select first item if exists and nothing is selected
            if (res?.length > 0 && !selectedFeedback) {
                setSelectedFeedback(res[0]);
                setAdminNote(res[0].adminNote || '');
                setNewStatus(res[0].status);
            }
        } catch (error) {
            toast.error("Failed to load feedback.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleSelectFeedback = (f) => {
        setSelectedFeedback(f);
        setAdminNote(f.adminNote || '');
        setNewStatus(f.status);
    };

    const handleUpdateFeedback = async () => {
        if (!selectedFeedback) return;
        setUpdating(true);
        try {
            const updated = await feedbackService.updateFeedbackStatus(selectedFeedback._id, {
                status: newStatus,
                adminNote
            });
            toast.success("Feedback updated successfully");
            
            // Update local state
            setFeedbacks(prev => prev.map(f => f._id === selectedFeedback._id ? updated.feedback : f));
            setSelectedFeedback(updated.feedback);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to update feedback';
            toast.error(msg);
        } finally {
            setUpdating(false);
        }
    };

    const filteredFeedback = useMemo(() => {
        return feedbacks.filter(f => {
            const matchesSearch = 
                f.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (f.user?.name && f.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (f.guestName && f.guestName.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = filterStatus === 'All' || f.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [feedbacks, searchQuery, filterStatus]);

    const getTypeIcon = (type) => {
        switch(type) {
            case 'issue': return <AlertCircleIcon className="w-4 h-4 text-rose-500" />;
            case 'suggestion': return <LightbulbIcon className="w-4 h-4 text-amber-500" />;
            default: return <MessageSquareIcon className="w-4 h-4 text-blue-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'open': return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-200">Open</span>;
            case 'reviewed': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200">Reviewed</span>;
            case 'resolved': return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-200">Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquareIcon className="w-6 h-6 text-indigo-600" />
                            Feedback Inbox
                        </h1>
                        <p className="text-sm text-slate-500">Manage bug reports, suggestions, and user messages</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Search messages..."
                                className="pl-9 bg-slate-50 border-slate-200"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[130px] bg-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: List */}
                <div className="w-full md:w-1/3 lg:w-[400px] border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <LoaderIcon className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                            <p>Loading inbox...</p>
                        </div>
                    ) : filteredFeedback.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <CheckCircle2Icon className="w-12 h-12 text-slate-200 mb-3" />
                            <h3 className="text-slate-600 font-medium">No feedback found</h3>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredFeedback.map(f => (
                                <button
                                    key={f._id}
                                    onClick={() => handleSelectFeedback(f)}
                                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                                        selectedFeedback?._id === f._id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2 font-medium text-slate-900 truncate">
                                            {f.user ? f.user.name : (f.guestName || 'Anonymous Guest')}
                                        </div>
                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {dayjs(f.createdAt).fromNow(true)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        {getTypeIcon(f.type)}
                                        <span className="text-xs font-semibold text-slate-600 capitalize">{f.type}</span>
                                        <div className="ml-auto">{getStatusBadge(f.status)}</div>
                                    </div>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                        {f.message}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Details */}
                <div className="hidden md:flex flex-1 flex-col bg-slate-50/50 overflow-y-auto">
                    {selectedFeedback ? (
                        <div className="p-8 max-w-4xl mx-auto w-full">
                            {/* Message Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                                            {selectedFeedback.user ? selectedFeedback.user.name.charAt(0).toUpperCase() : (selectedFeedback.guestName ? selectedFeedback.guestName.charAt(0).toUpperCase() : '?')}
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-lg text-slate-900">
                                                {selectedFeedback.user ? selectedFeedback.user.name : (selectedFeedback.guestName || 'Anonymous Guest')}
                                                {selectedFeedback.user && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">Registered User</span>}
                                            </h2>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                                                <span className="flex items-center gap-1.5">
                                                    <MailIcon className="w-4 h-4" />
                                                    {selectedFeedback.user ? selectedFeedback.user.email : (selectedFeedback.guestEmail || 'No email provided')}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {dayjs(selectedFeedback.createdAt).format('MMM D, YYYY h:mm A')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(selectedFeedback.status)}
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 capitalize bg-slate-100 px-2 py-1 rounded-md">
                                            {getTypeIcon(selectedFeedback.type)}
                                            {selectedFeedback.type}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {selectedFeedback.message}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Resolution Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-indigo-50/30 flex items-center gap-2">
                                    <CheckCircle2Icon className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-semibold text-slate-800">Admin Resolution & Notes</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
                                            <Select value={newStatus} onValueChange={setNewStatus}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {selectedFeedback.resolvedAt && (
                                                <p className="text-xs text-slate-500 mt-3 flex items-start gap-1">
                                                    <ClockIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    Resolved on {dayjs(selectedFeedback.resolvedAt).format('MMM D, YYYY')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Internal Admin Note</label>
                                            <Textarea 
                                                className="min-h-[100px] w-full text-sm placeholder:text-slate-300"
                                                placeholder="Add private notes about how this was handled..."
                                                value={adminNote}
                                                onChange={(e) => setAdminNote(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end">
                                        <Button 
                                            onClick={handleUpdateFeedback} 
                                            disabled={updating || (newStatus === selectedFeedback.status && adminNote === (selectedFeedback.adminNote || ''))}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        >
                                            {updating ? <LoaderIcon className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2Icon className="w-4 h-4 mr-2" />}
                                            Save Resolution
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageSquareIcon className="w-16 h-16 text-slate-200 mb-4" />
                            <h3 className="text-lg font-medium text-slate-600">No Feedback Selected</h3>
                            <p className="text-sm mt-1">Select an item from the list to view details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
