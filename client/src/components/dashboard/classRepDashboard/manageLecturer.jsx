// Imports
import React, {useState, useEffect} from "react";
import { SendHorizonalIcon, LoaderIcon, Trash2Icon, UsersIcon, PhoneIcon, MailIcon } from "lucide-react";
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
} from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import UpdateLecturer from "@/components/updateLecturer";
import { lecturerService } from "@/services/lecturerApi";
import DeleteConfirmDialog from "@/components/deleteConfirmDialog";

export default function ManageLecturers() {

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [cohort, setCohort] = useState('');
    const [loading, setLoading] = useState(false);
    const [lecturerLoading, setLecturerLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [lecturers, setLecturers] = useState({ currentSemester: [], pastSemester: []})
    const [formDataError, setFormDataError] = useState({});
    const [errors, setErrors] = useState(null);

    const { user } = useAuth();

    const fetchLecturers = async () => {

        setLecturerLoading(true);

        try {
            const data = await lecturerService.getLecturersByCohort(user?.cohort?._id);
            setLecturers(data);
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured.'
            setErrors(errorMessage);
            return false;
        } finally {
            setLecturerLoading(false);
        }

    }

    useEffect(() => {

        fetchLecturers();
    }, []);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhoneNumber('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError(null);
        setErrors(null);

        let isValid = true;
        let errors = {};

        if (!name.trim()) {
            errors.name = 'Name is required.'
            isValid = false;
        }

        // if (!phoneNumber.trim()) {
        //     errors.phoneNumber = 'PhoneNumber is required.'
        //     isValid = false;
        // } else {
        //     const phoneRegex = /^\+254(7\d{8}|1\d{8})$/;
        //     if (!phoneRegex.test(phoneNumber.trim())) {
        //         errors.phoneNumber = 'Phone number must be in +2547XXXXXXXX or +2541XXXXXXXX format.'
        //         isValid = false;
        //     }
        // }

        // if (!email.trim()) {
        //     errors.email = 'Email is required.'
        //     isValid = false;
        // } else if (!/\S+@\S+\.\S+/.test(email)) {
        //     errors.email = 'Invalid email format.';
        //     isValid = false;
        // }

        if (!cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        setFormDataError(errors);
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            name, email, phoneNumber, cohort
        }

        try {
            await lecturerService.createLecturer(payload);
            fetchLecturers();
            resetForm();
            toast.success('Lecturer posted successfully!')
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage)
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (lecturer) => {
        setDeletingId(lecturer._id);
        try {
            await lecturerService.deleteLecturer(lecturer._id);
            toast.success(`"${lecturer.name}" deleted successfully.`);
            fetchLecturers();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete lecturer.';
            toast.error(errorMessage);
        } finally {
            setDeletingId(null);
        }
    };

    return(
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">Create Lecturer</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Register a Lecturer</DialogTitle>
                        <DialogDescription>
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-destructive text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={name}
                                    type="text"
                                    onChange={(e) => setName(e.target.value)}
                                    className={`mt-1.5 ${formDataError.name ? 'border-destructive' : ''}`}
                                    placeholder="Dr. John Doe"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.name && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={phoneNumber}
                                    type="text"
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className={`mt-1.5 ${formDataError.phoneNumber ? 'border-destructive' : ''}`}
                                    placeholder="+254123456789"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.phoneNumber && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.phoneNumber}</p>}
                            </div>

                            <div>
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={email}
                                    type="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`mt-1.5 ${formDataError.email ? 'border-destructive' : ''}`}
                                    placeholder="johndoe@example.com"
                                    disabled={loading}
                                    required
                                />
                                {formDataError.email && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.email}</p>}
                            </div>

                            <div>
                                <Label htmlFor="cohort">Cohort</Label>
                                <Select
                                    onValueChange={value => setCohort(value)}
                                    disabled={loading}
                                    value={cohort}
                                    id="cohort"
                                    required
                                >
                                    <SelectTrigger className="w-full mt-1.5">
                                        <SelectValue placeholder="Select your cohort:" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                            {user?.cohort.name}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {formDataError.cohort && <p className="mt-1 text-sm font-medium text-destructive">{formDataError.cohort}</p>}
                            </div>
                        </div>

                        <DialogFooter className="mt-5">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} type="submit">
                                { loading ? (
                                    <>
                                        Creating
                                        <LoaderIcon className="animate-spin"/>
                                    </>
                                    ) : (
                                    <>
                                        Create Lecturer
                                        <SendHorizonalIcon />
                                    </>
                                    )
                                }
                            </Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>

            {/* Cards List */}
            <div className="mt-6 space-y-3">
                {lecturerLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <LoaderIcon className="animate-spin h-5 w-5" />
                        <span className="font-medium">Loading lecturers…</span>
                    </div>
                ) : lecturers.currentSemester?.length === 0 && lecturers.pastSemester?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground gap-2">
                        <UsersIcon className="h-10 w-10 opacity-30" />
                        <p className="text-sm italic">No lecturers yet. Create one above.</p>
                    </div>
                ) : (
                    <>
                        {lecturers.currentSemester?.map(lecturer => (
                            <div
                                key={lecturer._id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-foreground truncate">{lecturer.name}</p>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Current</Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {lecturer.phoneNumber && (
                                            <span className="inline-flex items-center gap-1">
                                                <PhoneIcon className="h-3 w-3" />
                                                {lecturer.phoneNumber}
                                            </span>
                                        )}
                                        {lecturer.email && (
                                            <span className="inline-flex items-center gap-1">
                                                <MailIcon className="h-3 w-3" />
                                                {lecturer.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <UpdateLecturer lecturer={lecturer} refreshLecturers={fetchLecturers}/>
                                    <DeleteConfirmDialog
                                        title="Delete Lecturer"
                                        description={`Are you sure you want to delete "${lecturer.name}"? This action cannot be undone.`}
                                        onConfirm={() => handleDelete(lecturer)}
                                        loading={deletingId === lecturer._id}
                                    />
                                </div>
                            </div>
                        ))}
                        {lecturers.pastSemester?.map(lecturer => (
                            <div
                                key={lecturer._id}
                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 opacity-80"
                            >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-foreground truncate">{lecturer.name}</p>
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Past</Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                        {lecturer.phoneNumber && (
                                            <span className="inline-flex items-center gap-1">
                                                <PhoneIcon className="h-3 w-3" />
                                                {lecturer.phoneNumber}
                                            </span>
                                        )}
                                        {lecturer.email && (
                                            <span className="inline-flex items-center gap-1">
                                                <MailIcon className="h-3 w-3" />
                                                {lecturer.email}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <UpdateLecturer lecturer={lecturer} refreshLecturers={fetchLecturers}/>
                                    <DeleteConfirmDialog
                                        title="Delete Lecturer"
                                        description={`Are you sure you want to delete "${lecturer.name}"? This action cannot be undone.`}
                                        onConfirm={() => handleDelete(lecturer)}
                                        loading={deletingId === lecturer._id}
                                    />
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

        </div>
    )
}