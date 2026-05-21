
"use client"

import type { Restaurant, Feedback } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Download, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

const getSentimentBadgeVariant = (score: number) => {
    if (score > 0.3) return "default";
    if (score < -0.3) return "destructive";
    return "secondary";
}

const getSentimentBadgeLabel = (score: number) => {
    if (score > 0.3) return "Positive";
    if (score < -0.3) return "Negative";
    return "Neutral";
}

const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

const downloadCSV = (feedback: Feedback[], restaurantName: string) => {
    if (!feedback || feedback.length === 0) {
        alert("No feedback to export for this restaurant.");
        return;
    }

    const headers = [
        'ID', 'Type', 'Author', 'Text', 'Fawuds', 'Sentiment Score', 
        'Improvement Areas', 'Final Comment', 
        'AI Quality Score', 'AI Summary', 'AI Source Relevance'
    ];
    
    const rows = feedback.map(f => [
        f.id,
        f.type,
        escapeCSV(f.author),
        escapeCSV(f.text),
        f.fawuds,
        f.sentimentScore?.toFixed(4) ?? 'N/A',
        escapeCSV(f.improvementAreas.join(', ')),
        escapeCSV(f.finalComment ?? ''),
        f.qualityScore?.qualityScore ?? 'N/A',
        f.qualityScore ? escapeCSV(f.qualityScore.summary) : 'N/A',
        f.qualityScore ? escapeCSV(f.qualityScore.sourceRelevance) : 'N/A'
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeName = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute("download", `${safeName}_feedback.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

type ColumnsProps = {
    onManageFeedback: (restaurant: Restaurant) => void;
}

export const columns = ({ onManageFeedback }: ColumnsProps): ColumnDef<Restaurant>[] => ([
  {
    accessorKey: "name",
    header: "Restaurant",
  },
  {
    accessorKey: "averageSentiment",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Avg. Sentiment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
        const sentiment = row.original.averageSentiment ?? 0;
        const formatted = sentiment.toFixed(2);
        return (
            <div className="flex items-center gap-2">
                <span>{formatted}</span>
                <Badge variant={getSentimentBadgeVariant(sentiment)}>
                    {getSentimentBadgeLabel(sentiment)}
                </Badge>
            </div>
        )
    }
  },
  {
    id: 'customerFeedback',
    header: "Customer Feedback",
    accessorFn: row => row.feedback.filter(f => f.type === 'customer').length,
  },
  {
    id: 'employeeFeedback',
    header: "Employee Feedback",
    accessorFn: row => row.feedback.filter(f => f.type === 'employee').length,
  },
  {
    id: 'totalFeedback',
    header: "Total Feedback",
    accessorFn: row => row.feedback.length,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
        const restaurant = row.original;
        return (
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onManageFeedback(restaurant)}
                            >
                                <SlidersHorizontal className="h-4 w-4"/>
                                <span className="sr-only">Manage Feedback</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Manage Feedback</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => downloadCSV(restaurant.feedback, restaurant.name)}
                                disabled={restaurant.feedback.length === 0}
                            >
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Export Feedback</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Export Feedback (CSV)</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }
  }
])
