
"use client"

import type { Subscriber } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "../ui/button";
import { format } from 'date-fns';

const escapeCSV = (str: string | undefined) => {
    if (str === undefined || str === null) return '""';
    return `"${str.replace(/"/g, '""')}"`;
};

const downloadCSV = (subscribers: Subscriber[]) => {
    if (!subscribers || subscribers.length === 0) {
        alert("No subscribers to export.");
        return;
    }

    const headers = ['ID', 'Email', 'Username', 'Subscription Date'];
    
    const rows = subscribers.map(s => [
        s.id,
        escapeCSV(s.email),
        escapeCSV(s.username),
        s.subscribedAt ? escapeCSV(format(s.subscribedAt.toDate(), 'yyyy-MM-dd HH:mm:ss')) : 'N/A'
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export const subscriberColumns: ColumnDef<Subscriber>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "subscribedAt",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subscribed Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const date = row.original.subscribedAt?.toDate();
        return date ? format(date, 'PPP p') : 'N/A';
    }
  },
]

export { downloadCSV as downloadSubscribersCSV };
