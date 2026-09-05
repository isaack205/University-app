// Imports
import React, { useState, useEffect } from "react";
import { SendHorizonalIcon, LoaderIcon, Trash2Icon, NotebookPenIcon, CalendarIcon, BookOpenIcon, SearchIcon, PlusIcon, ClockIcon, MapPinIcon } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { catService } from "@/services/catApi";
import UpdateCat from "@/components/updateCAT";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";
import MarkdownEditor from "@/components/common/markdownEditor";

export default function ManageCat() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [type, setType] = useState('');
    const [submissionDate, setSubmissionDate] = useState('');
    const [submissionFormat, setSubmissionFormat] = useState('');
    const [sittingDate, setSittingDate] = useState('');
    const [sittingTime, setSittingTime] = useState('');
    const [venue, setVenue] = useState('');
    const [requiredItems, setRequiredItems] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [catNumber, setCatNumber] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [catLoading, setCATLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);
    const [CATS, setCATS] = useState([]);
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);

    const { user } = useAuth();

    const fetchUnitSchedules = async () => {
        try {
            const data = await unitScheduleService.getMyShedule();
            setUnits(data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            toast.error(errorMessage)
            return false;
        }
    }

    const fetchCATS = async () => {
        setCATLoading(true);
        try {
            const data = await catService.getCATsForCohort();
            setCATS(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            return false;
        } finally {
            setCATLoading(false);
        }
    }

    useEffect(() => {
        fetchUnitSchedules();
        fetchCATS();
    }, [user]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedUnit('');
        setType('');
        setSubmissionDate('');
        setSubmissionFormat('');
        setSittingDate('');
        setSittingTime('');
        setVenue('');
        setRequiredItems('');
        setCatNumber('');
        setIsPublished(false);
        setFormDataError({});
        setErrors(null);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError({});
        setErrors(null);

        let isValid = true;
        let errors = {};

        // common validations
        if (!title.trim()) {
            errors.title = 'Title is required.'
            isValid = false;
        }

        if (!selectedUnit.trim()) {
            errors.selectedUnit = 'Unit is required.'
            isValid = false;
        }

        const cohortId = user?.cohort?._id || user?.cohort;
        if (!cohortId) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        if (!type || !type.trim()) {
            errors.type = 'CAT type is required.'
            isValid = false;
        }

        if (!catNumber || !catNumber.trim()) {
            errors.catNumber = 'CAT number is required.'
            isValid = false;
        }

        // Auto calculate sittingDay from sittingDate
        let calculatedSittingDay = '';
        if (sittingDate) {
            calculatedSittingDay = new Date(sittingDate).toLocaleDateString('en-US', { weekday: 'long' });
        }

        // conditional validations
        if (type === 'takeaway') {
            if (!submissionDate) {
                errors.submissionDate = 'Submission date is required for takeaway.';
                isValid = false;
            }
            if (!submissionFormat.trim()) {
                errors.submissionFormat = 'Submission format is required for takeaway.';
                isValid = false;
            }
        } else if (type === 'sitting') {
            if (!sittingDate) {
                errors.sittingDate = 'Sitting date is required for sitting CAT.';
                isValid = false;
            }
            if (!sittingTime) {
                errors.sittingTime = 'Sitting time is required for sitting CAT.';
                isValid = false;
            }
            if (!venue.trim()) {
                errors.venue = 'Venue is required for sitting CAT.';
                isValid = false;
            }
            if (!requiredItems.trim()) {
                errors.requiredItems = 'Required items are needed for sitting CAT.';
                isValid = false;
            }
        }

        setFormDataError(errors);

        if (!isValid) {
            setLoading(false);
            return;
        }

        // convert dates to ISO only if provided
        const submissionIsoDate = submissionDate ? new Date(submissionDate).toISOString() : undefined;
        const sittingIsoDate = sittingDate ? new Date(sittingDate).toISOString() : undefined;

        // convert requiredItems string -> array by comma
        const requiredItemsArray = requiredItems
            ? requiredItems.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const payload = {
            title,
            description,
            unit: selectedUnit,
            cohort: cohortId,
            type,
            submissionDate: submissionIsoDate,
            submissionFormat,
            sittingDate: sittingIsoDate,
            sittingDay: calculatedSittingDay,
            sittingTime,
            venue,
            requiredItems: requiredItemsArray,
            isPublished,
            catNumber
        }

        try {
            await catService.createCAT(payload);
            await fetchCATS();
            setIsDialogOpen(false);
            resetForm();
            toast.success('CAT posted successfully! 📝')
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage)
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (cat) => {
        setDeletingId(cat._id);
        try {
            await catService.deleteCAT(cat._id);
            toast.success(`"${cat.title}" deleted successfully.`);
            fetchCATS();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to delete CAT.';
            toast.error(msg);
        } finally {
            setDeletingId(null);
        }
    };

    const handleTogglePublish = async (cat) => {
        setTogglingId(cat._id);
        try {
            const res = await catService.togglePublishCAT(cat._id);
            toast.success(res.message || `CAT is now ${!cat.isPublished ? 'Published' : 'Draft'}`);
            fetchCATS();
        } catch (error) {
            const msg = error.response?.data?.message || error.message || 'Failed to update publish state.';
            toast.error(msg);
        } finally {
            setTogglingId(null);
        }
    };

    const filteredCats = CATS.filter(cat => {
        const matchesSearch =
            cat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.unit?.unitCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.catNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cat.venue?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (activeTab === 'takeaway') return cat.type === 'takeaway';
        if (activeTab === 'sitting') return cat.type === 'sitting';
        if (activeTab === 'published') return cat.isPublished === true;
        if (activeTab === 'draft') return cat.isPublished === false;
        return true;
    });

    return(
        <div>
            {/* Top Action Bar & Filter Controls */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <PlusIcon className="h-4 w-4" />
                                Create CAT
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Register a CAT</DialogTitle>
                                <DialogDescription>
                                    Create a Continuous Assessment Test for <strong>{user?.cohort?.name || "your cohort"}</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            {errors && <p className="mt-1 font-bold text-destructive text-right text-sm">{errors}</p>}

                            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            value={title}
                                            type="text"
                                            onChange={(e) => setTitle(e.target.value)}
                                            className={`mt-1.5 ${formDataError.title ? 'border-destructive' : ''}`}
                                            placeholder="e.g. Operating Systems CAT 1"
                                            disabled={loading}
                                            required
                                        />
                                        {formDataError.title && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.title}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="selectedUnit">Unit Code</Label>
                                        <Select
                                            onValueChange={value => setSelectedUnit(value)}
                                            disabled={loading}
                                            value={selectedUnit}
                                            id="selectedUnit"
                                            required
                                        >
                                            <SelectTrigger className="w-full mt-1.5">
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map(unit => (
                                                    <SelectItem value={unit._id} key={unit._id}>
                                                        {unit.unitCode} – {unit.unitName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formDataError.selectedUnit && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.selectedUnit}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="catNumber">CAT Number</Label>
                                        <Select
                                            id="catNumber"
                                            value={catNumber}
                                            onValueChange={(value) => setCatNumber(value)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="w-full mt-1.5">
                                                <SelectValue placeholder="Select CAT Number" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="CAT 1">CAT 1</SelectItem>
                                                    <SelectItem value="CAT 2">CAT 2</SelectItem>
                                                    <SelectItem value="CAT 3">CAT 3</SelectItem>
                                                    <SelectItem value="CAT 4">CAT 4</SelectItem>
                                                    <SelectItem value="CAT 5">CAT 5</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {formDataError.catNumber && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.catNumber}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <Label htmlFor="type">CAT Type</Label>
                                        <Select
                                            id="type"
                                            value={type}
                                            onValueChange={(value) => setType(value)}
                                            disabled={loading}
                                        >
                                            <SelectTrigger className="w-full mt-1.5">
                                                <SelectValue placeholder="Select CAT type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="takeaway">Take-away CAT</SelectItem>
                                                    <SelectItem value="sitting">Sitting CAT</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {formDataError.type && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.type}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <MarkdownEditor
                                            id="cat-description"
                                            label="Description (Optional)"
                                            value={description}
                                            onChange={setDescription}
                                            placeholder="General instructions, topics covered, or guidelines..."
                                            disabled={loading}
                                            rows={4}
                                        />
                                    </div>

                                    {/* Conditional fields */}
                                    {type === 'takeaway' && (
                                        <>
                                            <div>
                                                <Label htmlFor="submissionDate">Submission Date & Time</Label>
                                                <Input
                                                    id="submissionDate"
                                                    name="submissionDate"
                                                    value={submissionDate}
                                                    type="datetime-local"
                                                    onChange={(e) => setSubmissionDate(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.submissionDate ? 'border-destructive' : ''}`}
                                                    disabled={loading}
                                                />
                                                {formDataError.submissionDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.submissionDate}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="submissionFormat">Submission Format</Label>
                                                <Input
                                                    id="submissionFormat"
                                                    name="submissionFormat"
                                                    value={submissionFormat}
                                                    type="text"
                                                    onChange={(e) => setSubmissionFormat(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.submissionFormat ? 'border-destructive' : ''}`}
                                                    placeholder="e.g. Email / Printed PDF / In-person"
                                                    disabled={loading}
                                                />
                                                {formDataError.submissionFormat && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.submissionFormat}</p>}
                                            </div>
                                        </>
                                    )}

                                    {type === 'sitting' && (
                                        <>
                                            <div>
                                                <Label htmlFor="sittingDate">Sitting Date</Label>
                                                <Input
                                                    id="sittingDate"
                                                    name="sittingDate"
                                                    value={sittingDate}
                                                    type="date"
                                                    onChange={(e) => setSittingDate(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.sittingDate ? 'border-destructive' : ''}`}
                                                    disabled={loading}
                                                />
                                                {sittingDate && (
                                                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                                        📅 Day: {new Date(sittingDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                                    </p>
                                                )}
                                                {formDataError.sittingDate && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingDate}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="sittingTime">Start Time</Label>
                                                <Input
                                                    id="sittingTime"
                                                    name="sittingTime"
                                                    value={sittingTime}
                                                    type="time"
                                                    onChange={(e) => setSittingTime(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.sittingTime ? 'border-destructive' : ''}`}
                                                    disabled={loading}
                                                />
                                                {formDataError.sittingTime && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.sittingTime}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="venue">Venue</Label>
                                                <Input
                                                    id="venue"
                                                    name="venue"
                                                    value={venue}
                                                    type="text"
                                                    onChange={(e) => setVenue(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.venue ? 'border-destructive' : ''}`}
                                                    placeholder="e.g. Hall A / Lab 3"
                                                    disabled={loading}
                                                />
                                                {formDataError.venue && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.venue}</p>}
                                            </div>

                                            <div className="sm:col-span-2">
                                                <Label htmlFor="requiredItems">Required Items (comma separated)</Label>
                                                <Input
                                                    id="requiredItems"
                                                    name="requiredItems"
                                                    value={requiredItems}
                                                    type="text"
                                                    onChange={(e) => setRequiredItems(e.target.value)}
                                                    className={`mt-1.5 ${formDataError.requiredItems ? 'border-destructive' : ''}`}
                                                    placeholder="Calculator, Fullscaps, Pencil..."
                                                    disabled={loading}
                                                />
                                                {formDataError.requiredItems && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.requiredItems}</p>}
                                            </div>
                                        </>
                                    )}

                                    <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                                        <Checkbox
                                            id="isPublished"
                                            checked={isPublished}
                                            onCheckedChange={(checked) => setIsPublished(!!checked)}
                                            disabled={loading}
                                        />
                                        <Label htmlFor="isPublished" className="cursor-pointer font-medium">Publish immediately to students</Label>
                                    </div>
                                </div>

                                <DialogFooter className="pt-3 border-t">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
                                    </DialogClose>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                        { loading ? (
                                            <>
                                                Creating
                                                <LoaderIcon className="animate-spin h-4 w-4 ml-1"/>
                                            </>
                                            ) : (
                                            <>
                                                Post CAT
                                                <SendHorizonalIcon className="h-4 w-4 ml-1" />
                                            </>
                                            )
                                        }
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Live Search Input */}
                    <div className="relative flex-1 sm:max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search CATs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {[
                        { id: 'all', label: 'All CATs' },
                        { id: 'takeaway', label: 'Takeaway' },
                        { id: 'sitting', label: 'Sitting' },
                        { id: 'published', label: 'Published' },
                        { id: 'draft', label: 'Drafts' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1 rounded-full font-medium transition-all ${
                                activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cards List */}
            <div className="mt-5 space-y-3">
                {catLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading CATs…</span>
                    </div>
                ) : filteredCats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <NotebookPenIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">
                            {searchQuery || activeTab !== 'all' ? 'No CATs match your filter' : 'No CATs yet. Create one above.'}
                        </p>
                    </div>
                ) : (
                    filteredCats.map(cat => (
                        <div
                            key={cat._id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Left: Info */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-foreground truncate">{cat.title}</p>
                                    <span className="text-xs font-medium text-muted-foreground">{cat.catNumber}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 font-medium">
                                        <BookOpenIcon className="h-3 w-3" />
                                        {cat.unit?.unitCode}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 font-medium capitalize">
                                        {cat.type}
                                    </span>
                                    {cat.type === 'takeaway' && cat.submissionDate && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 font-medium">
                                            <CalendarIcon className="h-3 w-3" />
                                            Submit: {new Date(cat.submissionDate).toLocaleString()}
                                        </span>
                                    )}
                                    {cat.type === 'sitting' && cat.sittingDate && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 font-medium">
                                            <CalendarIcon className="h-3 w-3" />
                                            {cat.sittingDay || new Date(cat.sittingDate).toLocaleDateString('en-US', { weekday: 'short' })} · {new Date(cat.sittingDate).toLocaleDateString()} {cat.sittingTime ? `at ${cat.sittingTime}` : ''}
                                        </span>
                                    )}

                                    {/* 1-Click Interactive Publish Badge */}
                                    <button
                                        onClick={() => handleTogglePublish(cat)}
                                        disabled={togglingId === cat._id}
                                        title="Click to toggle publish status"
                                        className="transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                    >
                                        <Badge className={`gap-1 ${cat.isPublished
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300 hover:bg-green-200'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'}`}
                                        >
                                            {togglingId === cat._id ? (
                                                <LoaderIcon className="h-3 w-3 animate-spin" />
                                            ) : (
                                                cat.isPublished ? 'Published ✓' : 'Draft ✏️'
                                            )}
                                        </Badge>
                                    </button>
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <UpdateCat cat={cat} refreshCats={fetchCATS}/>
                                <DeleteConfirmDialog
                                    title="Delete CAT"
                                    description={`Are you sure you want to delete "${cat.title}"? This action cannot be undone.`}
                                    onConfirm={() => handleDelete(cat)}
                                    loading={deletingId === cat._id}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    )
};