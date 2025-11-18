// Imports
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import { catService } from "@/services/catApi";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderIcon, InfoIcon, BookOpen, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function CATPage() {
  const [CATS, setCATS] = useState([]);
  const [selectedCAT, setSelectedCAT] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCAT, setLoadingCAT] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  // Fetch CATs
  const fetchCATS = async () => {
    setLoading(true);
    try {
      const fetchedData = await catService.getCATsForCohort();
      setCATS(fetchedData);
    } catch (error) {
      const errorMessage = "Error fetching CATs'.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCATS();
  }, []);

  // Handle View CAT Details
  const handleClick = async (id) => {
    setLoadingCAT(true);
    setOpen(true);
    setSelectedCAT(null);

    try {
      const singleCATDetails = await catService.getCATById(id);
      setSelectedCAT(singleCATDetails);
    } catch (error) {
      const message = "Failed to fetch CAT details.";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingCAT(false);
    }
  };

  // Format Sitting Time
  function timeToTodayDateObject(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(":" ).map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  }

  // Separate Sitting and Take-away CATs
  const sittingCATS = CATS.filter((c) => c.type?.toLowerCase() === "sitting");
  const takeawayCATS = CATS.filter((c) => c.type?.toLowerCase() === "takeaway");

  return (
    <div className="p-4">
      <h3 className="text-3xl font-bold text-green-600 underline mb-6">My CATs'</h3>

      {error && <p className="text-end text-red-500 text-xl">{error}</p>}

      {/* TABS */}
      <Tabs defaultValue="sitting" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-1/2 mx-auto mb-6 p-1 rounded-xl bg-gray-200 dark:bg-slate-700">
          <TabsTrigger value="sitting" className="flex gap-2 items-center text-lg">
            <ClipboardList className="h-5 w-5" /> Sitting CATs
          </TabsTrigger>

          <TabsTrigger value="takeaway" className="flex gap-2 items-center text-lg">
            <BookOpen className="h-5 w-5" /> Take-away CATs
          </TabsTrigger>
        </TabsList>

        {/* SITTING CATs TAB */}
        <TabsContent value="sitting">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border rounded-xl p-4 shadow-xl bg-gradient-to-b from-green-500 to-gray-200 dark:from-slate-800 dark:to-slate-900"
          >
            <h4 className="text-xl font-bold text-blue-700 underline mb-3">Sitting CATs'</h4>

            <Table className="mt-2">
              <TableCaption>Sitting CATs for {user?.cohort?.name}</TableCaption>
              <TableHeader>
                <TableRow className="font-bold text-xl">
                  <TableHead>Title</TableHead>
                  <TableHead>UnitCode</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sitting Date</TableHead>
                  <TableHead>Venue</TableHead>
                  {user.role === 'classRep' && 
                    <TableHead>Published</TableHead>
                  }
                </TableRow>
              </TableHeader>

              {loading ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <LoaderIcon className="animate-spin h-6 w-6 text-white" />
                        <p className="text-white font-bold text-xl">Loading CATs'</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : sittingCATS.length > 0 ? (
                <TableBody>
                  {sittingCATS.map((CAT) => (
                    <TableRow
                      key={CAT._id}
                      onClick={() => handleClick(CAT._id)}
                      className={`cursor-pointer transition 
                        ${CAT.isPublished ? 'hover:bg-green-100' : 'bg-red-200 dark:bg-red-500 hover:bg-red-300'}`
                      }
                      title={CAT.isPublished ? '' : 'This CAT is not published'}
                    >
                      <TableCell>{CAT.title || "N/A"}({CAT.catNumber || 'N/A'})</TableCell>
                      <TableCell>{CAT.unit?.unitCode || "N/A"}</TableCell>
                      <TableCell>{CAT.type ? CAT.type.toUpperCase() : "N/A"}</TableCell>
                    <TableCell>
                        {CAT.sittingDate
                          ? new Date(CAT.sittingDate).toDateString()
                          : "N/A"} - {CAT.sittingTime || 'N/A'}
                    </TableCell>
                      <TableCell>{CAT.venue || "N/A"}</TableCell>
                      {user.role === 'classRep' && 
                        <TableCell>{CAT.isPublished ? 'YES' : 'NO'}</TableCell>
                      }       
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-600 italic">
                      No Sitting CATs' 😊
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </motion.div>
        </TabsContent>

        {/* TAKEAWAY TAB */}
        <TabsContent value="takeaway">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border rounded-xl p-4 shadow-xl bg-gradient-to-b from-gray-300 to-gray-100 dark:from-slate-800 dark:to-slate-900"
          >
            <h4 className="text-xl font-bold text-blue-700 underline mb-3">Take-away CATs'</h4>

            <Table className="mt-2">
              <TableCaption>Take-away CATs for {user?.cohort?.name}</TableCaption>
              <TableHeader>
                <TableRow className="font-bold text-xl">
                  <TableHead>Title</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Submission Format</TableHead>
                  {user.role === 'classRep' && 
                    <TableHead>Published</TableHead>
                  }
                </TableRow>
              </TableHeader>

              {takeawayCATS.length > 0 ? (
                <TableBody>
                  {takeawayCATS.map((CAT) => (
                    <TableRow
                      key={CAT._id}
                      onClick={() => handleClick(CAT._id)}
                      className={`cursor-pointer transition 
                        ${CAT.isPublished ? 'hover:bg-gray-200' : 'bg-red-200 dark:bg-red-500 hover:bg-red-300'}`
                      }
                      title={CAT.isPublished ? '' : 'This CAT is not published'}
                    >
                      <TableCell>{CAT.title || "N/A"}({CAT.catNumber || 'N/A'})</TableCell>
                      <TableCell>{CAT.unit?.unitCode || "N/A"}</TableCell>
                      <TableCell>{CAT.type ? CAT.type.toUpperCase() : "N/A"}</TableCell>
                      <TableCell>{CAT.submissionDate ? new Date(CAT.submissionDate).toDateString() : "N/A"}</TableCell>
                      <TableCell>{CAT.submissionFormat || "N/A"}</TableCell>
                      {user.role === 'classRep' && 
                        <TableCell>{CAT.isPublished ? 'YES' : 'NO'}</TableCell>
                      }
                    </TableRow>
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-600 italic">
                      No Take-away CATs' 📘
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* CATs' DETAILS DIALOG */}
       <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-gray-300 dark:bg-slate-800" >
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <InfoIcon className="text-blue-500" />
              CATs' Details
            </DialogTitle>
            <DialogDescription className="text-red-500">
                * Viewing individual CAT details.
            </DialogDescription>
          </DialogHeader>
          <hr className="border-green-500 border-2 dark:border-slate-500 rounded-xl" />

          {loadingCAT ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <LoaderIcon className="animate-spin h-6 w-6 text-green-500" />
              <p className="text-green-500 font-bold text-md lg:text-xl">
                Loading CATs' details
              </p>
            </div>
          ) : !selectedCAT ? (
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-red-500 font-bold text-xl">No Details</p>
            </div>
          ) : (
            <div>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Title:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedCAT.title || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Description:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedCAT.description || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Cat Number:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedCAT.catNumber || "N/A"}
                </p>
              </span>
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Unit Code:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedCAT.unit?.unitCode.toUpperCase() || "N/A"}
                </p>
              </span>
             <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Type:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  {selectedCAT.type || "N/A"}
                </p>
              </span> 
              {selectedCAT.type === 'sitting' && 
                <div>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Sitting Date:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {new Date(selectedCAT.sittingDate).toLocaleDateString() ||
                            "N/A"}
                        </p>
                    </span>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Sitting Day:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {selectedCAT.sittingDay || "N/A"}
                        </p>
                    </span>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Sitting Time:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {selectedCAT.sittingTime || "N/A"}
                        </p>
                    </span>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Venue:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {selectedCAT.venue || "N/A"}
                        </p>
                    </span>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Required Items:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {(selectedCAT.requiredItems).join(", ") || "N/A"}
                        </p>
                    </span>
                </div>
              }
              {selectedCAT.type === "takeaway" && 
                <div>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Submission Date:</p>
                        <p className="text-red-500 font-bold pl-5">
                        {new Date(selectedCAT.submissionDate).toLocaleString() ||
                            "N/A"}
                        </p>
                    </span>
                    <span className="flex flex-col justify-center ">
                        <p className="font-bold text-lg">Submission Format:</p>
                        <p className="text-yellow-600 font-bold pl-5">
                        {selectedCAT.submissionFormat || "N/A"}
                        </p>
                    </span>
                    
                </div>
              }
              <span className="flex flex-col justify-center ">
                <p className="font-bold text-lg">Posted By:</p>
                <p className="text-yellow-600 font-bold pl-5">
                  Mr/Mrs. {selectedCAT.createdBy.name || "N/A"}
                </p>
              </span>
              <span className="flex items-center justify-end text-[12px] gap-2">
                    <p className="text-gray-600">Updated:</p>
                    <p className="text-gray-500 font-bold">
                    {new Date(selectedCAT.updatedAt).toLocaleString() ||
                        "N/A"}
                    </p>
                </span>
            </div>
          )}
        </DialogContent>
      </Dialog>

       {/* FOOTER NOTE */}
       <div className="flex items-center gap-3 mt-10 justify-center">
         <InfoIcon className="text-blue-500" />
         <p className="text-blue-600">
           To view CAT's full details, click an individual row!
         </p>
       </div>
    </div>
  );
}
