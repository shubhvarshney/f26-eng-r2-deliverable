"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define zod schemas for form validation

const kingdoms = z.enum(["Animalia", "Plantae", "Fungi", "Protista", "Archaea", "Bacteria"]);

const speciesSchema = z.object({
  scientific_name: z.string().trim().min(1),
  common_name: z.string().nullable().transform((value) => (!value || value.trim() === "" ? null : value.trim())),
  kingdom: kingdoms,
  total_population: z.number().int().positive().min(1).nullable(),
  image: z.string().url().nullable().transform((value) => (!value || value.trim() === "" ? null : value.trim())),
  description: z.string().nullable().transform((value) => (!value || value.trim() === "" ? null : value.trim())),
});

type FormData = z.infer<typeof speciesSchema>;
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function EditSpeciesDialog({ species }: { species: Species }) {
  const router = useRouter();

  // Control open/closed state of the dialog
  const [open, setOpen] = useState(false);

  //  Initiating form with previous values
  const form = useForm<FormData>({
    resolver: zodResolver(speciesSchema),
    defaultValues: {
      scientific_name: species.scientific_name,
      common_name: species.common_name,
      kingdom: species.kingdom,
      total_population: species.total_population,
      image: species.image,
      description: species.description,
    },
    mode: "onChange",
  });

  const onSubmit = async (input: FormData) => {
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase
      .from("species")
      .update(input)
      .eq("id", species.id);

    if (error) {
      return toast({
        title: "Something went wrong.",
        description: error.message,
        variant: "destructive",
      });
    }

    form.reset(input);
    setOpen(false);
    router.refresh();

    return toast({
      title: "Species updated!",
      description: `Successfully updated ${input.scientific_name}.`,
    });
  };

  // Dialog for updating the entry, very similar to adding
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="mt-2 w-full">
          Edit Species
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Species</DialogTitle>
          <DialogDescription>Update the information for this species.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(event: BaseSyntheticEvent) => void form.handleSubmit(onSubmit)(event)}>
            <div className="grid w-full items-center gap-4">
              <FormField
                control={form.control}
                name="scientific_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scientific Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="common_name"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Common Name</FormLabel>
                      <FormControl><Input value={value ?? ""} {...rest} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="kingdom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kingdom</FormLabel>
                    <Select onValueChange={(value) => field.onChange(kingdoms.parse(value))} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {kingdoms.options.map((kingdom) => <SelectItem key={kingdom} value={kingdom}>{kingdom}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="total_population"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Total population</FormLabel>
                      <FormControl>
                        <Input type="number" value={value ?? ""} {...rest} onChange={(event) => field.onChange(+event.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl><Input value={value ?? ""} {...rest} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const { value, ...rest } = field;
                  return (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea value={value ?? ""} {...rest} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <div className="flex">
                <Button type="submit" className="mr-2 flex-auto">Save Changes</Button>
                <DialogClose asChild>
                  <Button type="button" variant="secondary" className="ml-2 flex-auto">Cancel</Button>
                </DialogClose>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
