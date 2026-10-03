"use client";

import { Fragment, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

import IconButton from "@/components/ui/icon-button";
import { Color, Size } from "@/types";

import Filter from "./filter";

interface MobileFiltersProps {
  sizes: Size[],
  colors: Color[],
  /** Count of currently-active query-param filters (sizeId/colorId), so the
   * trigger can surface "current selections" without opening the drawer. */
  activeFilterCount?: number,
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  sizes,
  colors,
  activeFilterCount = 0,
}) => {
  const [open, setOpen] = useState(false);

  const onOpen = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : "Filters"}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-control border border-border bg-surface px-4 text-body font-medium text-foreground transition hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus lg:hidden"
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
        Filters
        {activeFilterCount > 0 && (
          <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-meta font-semibold text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          {/* Background color and opacity */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-foreground/50" />
          </Transition.Child>

          {/* Dialog position */}
          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto border-l border-border bg-surface shadow-surface">
                {/* Header: title + close */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <Dialog.Title as="h2" className="text-subheading text-foreground">
                    Filters
                  </Dialog.Title>
                  <IconButton icon={<X size={18} />} onClick={onClose} aria-label="Close filters" />
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <Filter
                    valueKey="sizeId"
                    name="Sizes"
                    data={sizes}
                  />
                  <Filter
                    valueKey="colorId"
                    name="Colors"
                    data={colors}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MobileFilters;
