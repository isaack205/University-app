// Imports
import React, { useEffect, useState} from "react";
import { useAuth } from "@/contexts/authContext";
import { toast } from "sonner";
import { useNavigate, Link } from 'react-router-dom'
import { BackgroundGradient } from "@/components/ui/background-gradient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IdCardIcon, EyeIcon, EyeOffIcon, SendHorizonalIcon, KeyRoundIcon, MailIcon, PhoneIcon, UserIcon, LoaderIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { courseService } from "@/services/courseApi";
import { cohortService } from "@/services/cohortApi";
import registerPhoto from '../assets/university.png';
import registerPhoto2 from "../assets/university 2.png"
import logo from "../assets/image.png"

export default function RegisterPage() {

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCourseError, setSelectedCourseError] = useState(null);
    const [cohorts, setCohorts] = useState([]);
    const [selectedCohort, setSelectedCohort] = useState('');
    const [selectedCohortError, setSelectedCohortError] = useState(null);
    const [password, setPassword] = useState('');
    const [passwordError, setPasswordError] = useState(null);
    const [hasTypedPassword, setHasTypedPassword] = useState(false);
    const [formData, setFormData] = useState({ 
        name:'',
        studentId: '',
        email: '',
        phoneNumber: '',
        confirmPassword: '',
    })
    const [rules, setRules] = useState({
        length: false,
        uppercase: false,
        lowercase:false,
        number: false,
        special: false
    });

    const [formDataError, setFormDataError] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const {register, error, clearError} = useAuth();

    useEffect(() => {
        if (clearError) clearError();
        
        const fetchCourses = async () => {
            try {
                const courseData = await courseService.getAllCourses();
                setCourses(courseData);
            } catch (error) {
                console.error('Failed to load courses:', error)
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchCohorts = async () => {
            if (!selectedCourse) return;
            try {
                const cohortData = await cohortService.getCohortsByCourse(selectedCourse);
                setCohorts(cohortData)
            } catch (error) {
                console.error('Error loading cohorts:', error)
            }
        };

        fetchCohorts();
    }, [selectedCourse])

    const handleChange = (e) => {
        const { name, value } = e.target;

        const normalizedValue = name === 'studentId' ? value.toUpperCase() : value;

        setFormData(prev => ({ ...prev, [name]: normalizedValue }));

        // Clear error for the specific field as user types
        if (formDataError[name]) {
            setFormDataError(prevErrors => ({
                ...prevErrors,
                [name]: ''
            }));
        }
    }

    const checkPasswordRules = (password) => {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);

        if (!hasTypedPassword && value.length > 0) {
            setHasTypedPassword(true);
        }

        if (value.length === 0) {
            setHasTypedPassword(false);
        }

        setRules(checkPasswordRules(value));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormDataError(null);
        setSelectedCohortError(null);
        setSelectedCourseError(null);
        setPasswordError(null)
        
        let errors = {};
        let isValid = true;
        
        // Validation logic
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.studentId.trim()) {
            errors.studentId = 'StudentId is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Invalid email format.';
            isValid = false;
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number cannot be empty.'
            isValid = false;
        } else {
            const phoneRegex = /^\+254(7\d{8}|1\d{8})$/;
            if (!phoneRegex.test(formData.phoneNumber.trim())) {
                errors.phoneNumber = 'Phone number must be in +2547XXXXXXXX or +2541XXXXXXXX format.'
                isValid = false;
            }
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            isValid = false;
        }

        if (!formData.confirmPassword.trim()) {
            errors.confirmPassword = 'Please fill in confirm password'
            isValid = false;
        }

        if (password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
            isValid = false;
        }

        if (!selectedCourse.trim()) {
            setSelectedCourseError('Course name is required');
            isValid = false;
        }

        if (!selectedCohort.trim()) {
            setSelectedCohortError('Cohort name is required');
            isValid = false;
        }

        setFormDataError(errors); // Update the state with all validation errors

        if (!isValid) {
            setLoading(false);
            toast.error('Please correct the errors in the form.');
            return;
        }

        const payload = {
            ...formData,
            password,
            course: selectedCourse,
            cohort: selectedCohort
        };

        try {
            await register(payload);
        } catch (error) {
            const message = error.message || 'An unexpected error occured';
            toast.error(message);
        } finally {
            setLoading(false)
        }
    }
    return(
        <div className="min-h-screen flex flex-col md:flex-row lg:flex-row items-center justify-start flex-start bg-gradient-to-b from-blue-300 via-white to-purple-400">
            <div className="md:w-[50%] lg:w-[50%]">
                <img src={registerPhoto} alt="" className="hidden md:block h-30 w-full md:h-screen lg:h-screen"/>
            </div>
            <div className="block md:hidden w-full h-40 overflow-hidden">
                <img src={registerPhoto2} alt="" className="w-full h-full object-cover"/>
            </div>
            
            <div className="w-full md:w-[50%] lg:w-[50%] flex justify-center p-2  md:m-5">
                <Card className="w-full shadow-2xl border-none bg-no">
                    <CardHeader className="text-center flex flex-col md:flex-col items-center justify-center">
                        <CardTitle className="flex justify-center">
                            <img src={logo} className="h-15 md:h-20 w-auto rounded-[50px]"/>
                        </CardTitle>
                        <CardDescription className="text-black md:text-2xl font-bold">Register to CampusHub App !</CardDescription>
                    </CardHeader>
                    <CardContent className="ml-2 mr-2 p-2 rounded-md">
                        <form onSubmit={handleSubmit}>
                            <div className="">
                                <div className="relative">
                                    <UserIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        className={`pl-10 text-black border ${formDataError.name ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                        onChange={handleChange}
                                        placeholder="Name"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {formDataError.name && <p className="mt-1 font-bold text-red-600">{formDataError.name}</p>}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <IdCardIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="studentId"
                                        type="text"
                                        value={formData.studentId}
                                        className={`pl-10 text-black border ${formDataError.studentId ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                        onChange={handleChange}
                                        placeholder="Student Reg N.o"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {formDataError.studentId && <p className="mt-1 font-bold text-red-600">{formDataError.studentId}</p>}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <MailIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        className={`pl-10 text-black border ${formDataError.email ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                        onChange={handleChange}
                                        placeholder="example@gmail.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {formDataError.email && <p className="mt-1 font-bold text-red-600">{formDataError.email}</p>}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <PhoneIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="phoneNumber"
                                        type="text"
                                        value={formData.phoneNumber}
                                        className={`pl-10 text-black border ${formDataError.phoneNumber ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl '}`}
                                        onChange={handleChange}
                                        placeholder="+254712345678"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                {formDataError.phoneNumber && <p className="mt-1 font-bold text-red-600">{formDataError.phoneNumber}</p>}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        className={`pl-10 border text-black ${passwordError ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter your password"
                                        required
                                        disabled={loading}
                                    />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                        {
                                            showPassword ? (<EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />) : (<EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />)
                                        }
                                    </button>
                                </div>
                                {hasTypedPassword && (
                                    <ul className="mt-2 text-sm">
                                        <li className={rules.length ? 'text-green-600' : 'text-red-600'}>
                                            {rules.length ? '✅' : '❌'} At least 8 characters
                                        </li>
                                        <li className={rules.uppercase ? 'text-green-600' : 'text-red-600'}>
                                            {rules.uppercase ? '✅' : '❌'} One uppercase letter
                                        </li>
                                        <li className={rules.lowercase ? 'text-green-600' : 'text-red-600'}>
                                            {rules.lowercase ? '✅' : '❌'} One lowercase letter
                                        </li>
                                        <li className={rules.number ? 'text-green-600' : 'text-red-600'}>
                                            {rules.number ? '✅' : '❌'} One number
                                        </li>
                                        <li className={rules.special ? 'text-green-600' : 'text-red-600'}>
                                            {rules.special ? '✅' : '❌'} One special character
                                        </li>
                                    </ul>
                                )}
                            </div>
                            <div className="mt-5">
                                <div className="relative">
                                    <KeyRoundIcon className="absolute top-1/2 -translate-y-1/2 ml-2"/>
                                    <Input 
                                        name="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        className={`pl-10 border text-black ${formDataError.confirmPassword ? 'border-red-700 shadow-md shadow-red-400' : 'border-black shadow-xl'}`}
                                        onChange={handleChange}
                                        placeholder="Re-enter Password"
                                        required
                                        disabled={loading}
                                    />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                                        {
                                            showPassword ? (<EyeOffIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />) : (<EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-700" />)
                                        }
                                    </button>
                                </div>
                                {formDataError.confirmPassword && <p className="mt-1 font-bold text-red-600">{formDataError.confirmPassword}</p>}
                            </div>
                            <div className="mt-5">
                                <Select
                                    value={selectedCourse}
                                    onValueChange={(value) => setSelectedCourse(value)}
                                    required
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select course undertaking:"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map(course => (
                                            <SelectItem key={course._id} value={course._id} >
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCourseError && <p className="mt-1 font-bold text-red-600">{selectedCourseError}</p>}
                            </div>
                            <div className=" mt-5">
                                <Select
                                value={selectedCohort}
                                onValueChange={(value) => setSelectedCohort(value)}
                                required
                                disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select cohort you are in:"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cohorts.map(cohort => (
                                            <SelectItem key={cohort._id} value={cohort._id} >
                                                {cohort.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedCohortError && <p className="mt-1 font-bold text-red-600">{selectedCohortError}</p>}
                            </div>
                            {error && <p className="text-red-500 mt-1 font-bold">{error}</p> }
                            <div>
                                <Button className="mt-3 md:mt-8 cursor-pointer w-full bg-green-500 hover:bg-green-600 text-lg font-bold border text-black border-black" disabled={loading} type="submit">
                                    {loading ? (
                                            <div className="flex items-center gap-3">
                                                <p>Signing Up</p>
                                                <LoaderIcon className="animate-spin"/>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <p>Sign Up</p>
                                                <SendHorizonalIcon />
                                            </div>
                                        )
                                    }
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-center items-center">
                        <p className="font-bold">
                            I already have an account ? {" "}
                            <Link to='/login' className="text-blue-700 hover:text-blue-900 hover:underline font-bold">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}