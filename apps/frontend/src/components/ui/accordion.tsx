'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/** 简洁的手风琴组件 */
export function Accordion({ items, className }: AccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <div className={cn('divide-y divide-border', className)}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between py-5 text-left"
            >
              <span className="text-base font-medium text-foreground">{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <div className="pb-5 text-base leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
