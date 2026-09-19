"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Species type definition
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function DeleteSpeciesDialog({ species, currentUserId }: { species: Species; currentUserId: string }) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState(false);

  // Keep track of deletion to disable buttons
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Delete from Supabase
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .delete()
      .eq("id", species.id)
      .eq("author", currentUserId);

    if (error) {
      setIsDeleting(false);
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    setOpen(false);
    setIsDeleting(false);
    router.refresh();
    return toast({
      title: "Species deleted.",
      description: `${species.scientific_name} was removed from the species list.`,
    });
  };

  // Warn the user about deletion through a dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="mt-2 w-full">
          Delete Species
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {species.scientific_name}?</DialogTitle>
          <DialogDescription>
            This permanently removes the species from the list. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isDeleting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Species"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
