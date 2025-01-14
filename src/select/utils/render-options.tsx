// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { VirtualItem } from 'react-virtual';
import Item from '../parts/item';
import MutliselectItem from '../parts/multiselect-item';
import { DropdownOption } from '../../internal/components/option/interfaces';
import { getItemProps } from './get-item-props';

export interface RenderOptionProps {
  options: ReadonlyArray<DropdownOption>;
  getOptionProps: any;
  filteringValue: string;
  isKeyboard?: boolean;
  checkboxes?: boolean;
  hasDropdownStatus?: boolean;
  virtualItems?: VirtualItem[];
  useInteractiveGroups?: boolean;
  screenReaderContent?: string;
  ariaSetsize?: number;
}

export const renderOptions = ({
  options,
  getOptionProps,
  filteringValue,
  isKeyboard = false,
  checkboxes = false,
  hasDropdownStatus,
  virtualItems,
  useInteractiveGroups,
  screenReaderContent,
  ariaSetsize,
}: RenderOptionProps) => {
  return options.map((option, index) => {
    const virtualItem = virtualItems && virtualItems[index];
    const globalIndex = virtualItem ? virtualItem.index : index;
    const props = getItemProps({
      option,
      index: globalIndex,
      getOptionProps,
      filteringValue,
      isKeyboard,
      checkboxes,
    });

    const isLastItem = index === options.length - 1;
    const padBottom = !hasDropdownStatus && isLastItem;
    const ListItem = useInteractiveGroups ? MutliselectItem : Item;

    return (
      <ListItem
        key={globalIndex}
        {...props}
        virtualPosition={virtualItem && virtualItem.start}
        ref={virtualItem && virtualItem.measureRef}
        padBottom={padBottom}
        screenReaderContent={screenReaderContent}
        ariaPosinset={globalIndex + 1}
        ariaSetsize={ariaSetsize}
      />
    );
  });
};
