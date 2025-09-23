// Imports
import React, {useState, useEffect} from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table2";
import { SendHorizonalIcon, LoaderIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/authContext";
import { unitScheduleService } from "@/services/unitSchedulerApi";
import { toast } from "sonner";
import { assignmentService } from "@/services/assignementApi";

export default function ManageAssignment() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [units, setUnits] = useState([]);
    const [cohort, setCohort] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false)
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

    useEffect(() => {

        fetchUnitSchedules();
    }, []);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedUnit('');
        setDueDate('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setFormDataError(null);
        setErrors(null);

        let isValid = true;
        let errors = {};

        if (!title.trim()) {
            errors.title = 'Title is required.'
            isValid = false;
        }

        if (!selectedUnit.trim()) {
            errors.selectedUnit = 'Unit is required.'
            isValid = false;
        }

        if (!cohort.trim()) {
            errors.cohort = 'Cohort is required.'
            isValid = false;
        }

        if (!dueDate.trim()) {
            errors.dueDate = 'DueDate is required.'
            isValid = false;
        }

        setFormDataError(errors);
        
        if (!isValid) {
            setLoading(false);
            return;
        }

        const payload = {
            title, description, unit: selectedUnit, cohort, dueDate
        }

        try {
            await assignmentService.createAssignment(payload);
            resetForm();
            toast.success('Assignment posted successfully!')
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occured!'
            toast.error(errorMessage)
            setErrors(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }

    return(
        <div>
            <Dialog>
                <DialogTrigger>Create assignment</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Register an assignment</DialogTitle>
                        <DialogDescription>
                            * All fields are required.
                        </DialogDescription>
                    </DialogHeader>

                    {errors && <p className="mt-1 font-bold text-red-600 text-right">{errors}</p>}

                    <form onSubmit={handleSubmit}>
                        <span>
                            <Label htmlFor="title">Title</Label>
                            <Input 
                                id="title"
                                name="title"
                                value={title}
                                type="text"
                                onChange={(e) => setTitle(e.target.value)}
                                className={`border ${formDataError.title ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="Assignment title"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.title && <p className="mt-1 font-bold text-red-600">{formDataError.title}</p>}

                        <span>
                            <Label htmlFor="description">Description</Label>
                            <Input 
                                id="description"
                                name="description"
                                value={description}
                                type="text"
                                onChange={(e) => setDescription(e.target.value)}
                                className='border border-green-500'
                                placeholder="Description (Optional)"
                                disabled={loading}
                            />
                        </span>

                        <div>
                            <Label htmlFor="selectedUnit">Unit Code</Label>
                            <Select
                                onValueChange={value => setSelectedUnit(value)}
                                disabled={loading}
                                value={selectedUnit}
                                id="selectedUnit"
                                required
                            >
                                <SelectTrigger className="w-[180px] w-full ">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map(unit => (
                                        <SelectItem value={unit._id} key={unit._id}>
                                            {unit.unitCode}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {formDataError.selectedUnit && <p className="mt-1 font-bold text-red-600">{formDataError.selectedUnit}</p>}

                        <div>
                            <Label htmlFor="cohort">Cohort</Label>
                            <Select
                                onValueChange={value => setCohort(value)}
                                disabled={loading}
                                value={cohort}
                                id="cohort"
                                required
                            >
                                <SelectTrigger className="w-[180px] w-full ">
                                    <SelectValue placeholder="Select your cohort:" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={user.cohort._id} key={user.cohort._id}>
                                        {user?.cohort.name}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {formDataError.cohort && <p className="mt-1 font-bold text-red-600">{formDataError.cohort}</p>}

                        <span>
                            <Label htmlFor="duedate">Due Date</Label>
                            <Input 
                                id="duedate"
                                name="dueDate"
                                value={dueDate}
                                type="datetime-local"
                                onChange={(e) => setDueDate(e.target.value)}
                                className={`border ${formDataError.dueDate ? 'border-2 border-red-500 shadow shadow-red-500' : 'border-green-500'}`}
                                placeholder="Enter date"
                                disabled={loading}
                                required
                            />
                        </span>
                        {formDataError.dueDate && <p className="mt-1 font-bold text-red-600">{formDataError.dueDate}</p>}

                        <Button className="bg-white text-black font-bold shadow-md hover:shadow-green-500 hover:shadow-xl hover:bg-white border md:text-lg lg:text-xl hover:-translate-y-1 transform easeinout duration-500 mt-5 w-full" disabled={loading} type="submit">
                            { loading ? (
                                <div className="flex gap-3 items-center">
                                    Creating
                                    <LoaderIcon className="animate-spin"/>
                                </div> 
                                ) : (
                                <div className="flex gap-3 items-center">
                                    Post assignment
                                    <SendHorizonalIcon />
                                </div> 
                                ) 
                            }
                        </Button>
                    </form>

                </DialogContent>
            </Dialog>

            {/* <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>Credit Card</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                </TableBody>
            </Table> */}
        </div>
    )
};