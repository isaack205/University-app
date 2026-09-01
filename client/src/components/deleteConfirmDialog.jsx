import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon, LoaderIcon, AlertTriangleIcon } from "lucide-react";

export default function DeleteConfirmDialog({
  title = "Are you sure?",
  description = "This action cannot be undone.",
  onConfirm,
  loading = false,
  trigger,
}) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
            title="Delete"
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-2">
            <AlertTriangleIcon className="h-5 w-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                Deleting…
                <LoaderIcon className="h-4 w-4 animate-spin" />
              </span>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
