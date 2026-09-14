"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { adminCopy, type AdminStatusKey } from "@/lib/admin-copy";

type AdminToolbarProps = {
  searchPlaceholder?: string;
  addLabel?: string;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  showDateFilter?: boolean;
  statusOptions?: AdminStatusKey[];
  categoryOptions?: string[];
};

function AdminRowActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={adminCopy.common.actions}
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>{adminCopy.common.view}</DropdownMenuItem>
        <DropdownMenuItem>{adminCopy.common.edit}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminToolbar({
  searchPlaceholder,
  addLabel,
  showCategoryFilter,
  showStatusFilter,
  showDateFilter,
  showSearch = true,
  statusOptions = ["active", "draft", "low_stock", "out_of_stock"],
  categoryOptions = [],
}: AdminToolbarProps) {
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const categoryLabel =
    category === "all" ? adminCopy.common.allCategories : category;
  const statusLabel =
    status === "all"
      ? adminCopy.common.allStatuses
      : adminCopy.status[status as AdminStatusKey];
  const dateLabel =
    dateRange === "all"
      ? adminCopy.common.allDates
      : dateRange === "7d"
        ? adminCopy.common.last7Days
        : adminCopy.common.last30Days;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {showSearch && searchPlaceholder ? (
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              aria-label={adminCopy.common.search}
              className="pl-8"
            />
          </div>
        ) : null}

        {showCategoryFilter ? (
          <Select
            value={category}
            onValueChange={(value) => {
              if (value != null) setCategory(value);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label={adminCopy.common.allCategories}
            >
              <SelectValue>{categoryLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {adminCopy.common.allCategories}
              </SelectItem>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {showStatusFilter ? (
          <Select
            value={status}
            onValueChange={(value) => {
              if (value != null) setStatus(value);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label={adminCopy.common.allStatuses}
            >
              <SelectValue>{statusLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{adminCopy.common.allStatuses}</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {adminCopy.status[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {showDateFilter ? (
          <Select
            value={dateRange}
            onValueChange={(value) => {
              if (value != null) setDateRange(value);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              aria-label={adminCopy.common.dateRange}
            >
              <SelectValue>{dateLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{adminCopy.common.allDates}</SelectItem>
              <SelectItem value="7d">{adminCopy.common.last7Days}</SelectItem>
              <SelectItem value="30d">{adminCopy.common.last30Days}</SelectItem>
            </SelectContent>
          </Select>
        ) : null}
      </div>

      {addLabel ? (
        <Button type="button" className="shrink-0 self-start lg:self-auto">
          <Plus data-icon="inline-start" />
          {addLabel}
        </Button>
      ) : null}
    </div>
  );
}

export { AdminToolbar, AdminRowActions };
