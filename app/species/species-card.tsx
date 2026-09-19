"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import DeleteSpeciesDialog from "./delete-species-dialog";
import EditSpeciesDialog from "./edit-species-dialog";
type Species = Database["public"]["Tables"]["species"]["Row"];
type Author = Database["public"]["Tables"]["profiles"]["Row"];
type SpeciesWithAuthor = Species & { profiles: Author | null };

export default function SpeciesCard({ species, currentUserId }: { species: SpeciesWithAuthor; currentUserId: string }) {
  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{species.scientific_name}</DialogTitle>
            <DialogDescription>{species.common_name ?? "Common name not available"}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 text-sm">
            <div>
              <p className="font-semibold">Total population</p>
              <p>{species.total_population?.toLocaleString() ?? "Not available"}</p>
            </div>
            <div>
              <p className="font-semibold">Kingdom</p>
              <p>{species.kingdom}</p>
            </div>
            <div>
              <p className="font-semibold">Description</p>
              <p>{species.description ?? "No description available"}</p>
            </div>
            <div>
              <p className="font-semibold">Added by</p>
              <p>{species.profiles?.display_name ?? "Author unavailable"}</p>
              {species.profiles?.email && <p className="text-muted-foreground">{species.profiles.email}</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {species.author === currentUserId && (
        <>
          <EditSpeciesDialog species={species} />
          <DeleteSpeciesDialog species={species} currentUserId={currentUserId} />
        </>
      )}
    </div>
  );
}
