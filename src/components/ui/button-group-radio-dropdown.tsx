import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ButtonGroupRadioDropdown({
  showDropdown,
  trigger,
  children,
}: {
  showDropdown: boolean;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <ButtonGroup>
      {trigger}
      {showDropdown ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="!pl-2">
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="[--radius:1rem]">
            {children}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </ButtonGroup>
  );
}

ButtonGroupRadioDropdown.RadioItem = DropdownMenuRadioItem;
ButtonGroupRadioDropdown.Item = DropdownMenuItem;
ButtonGroupRadioDropdown.Group = DropdownMenuRadioGroup;
ButtonGroupRadioDropdown.Label = DropdownMenuLabel;
ButtonGroupRadioDropdown.Separator = DropdownMenuSeparator;
