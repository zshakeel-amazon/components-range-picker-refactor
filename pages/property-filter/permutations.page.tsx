// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import PropertyFilter, { PropertyFilterProps } from '~components/property-filter';
import ScreenshotArea from '../utils/screenshot-area';
import { allItems, columnDefinitions, TableItem, i18nStrings, filteringProperties } from './table.data';
import createPermutations from '../utils/permutations';
import PermutationsView from '../utils/permutations-view';

const filteringOptions: readonly PropertyFilterProps.FilteringOption[] = columnDefinitions.reduce<
  PropertyFilterProps.FilteringOption[]
>((acc, def) => {
  Object.keys(
    allItems.reduce<{ [key in string]: boolean }>((acc, item) => {
      acc['' + item[def.id as keyof TableItem]] = true;
      return acc;
    }, {})
  ).forEach(value =>
    acc.push({
      propertyKey: def.id,
      value,
    })
  );
  return acc;
}, []);

const permutations = createPermutations<Partial<PropertyFilterProps>>([
  {
    query: [
      {
        tokens: [
          { value: '123', operator: ':' },
          { value: '234', operator: '!:' },
          { propertyKey: 'instanceid', value: '345', operator: '=' },
        ],
        operation: 'and',
      },
      {
        tokens: [
          { value: '123', operator: ':' },
          { value: '234', operator: '!:' },
          { propertyKey: 'instanceid', value: '345', operator: '=' },
        ],
        operation: 'or',
      },
      {
        tokens: [
          {
            value:
              'LoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloreLoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloreLoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdoloreLoremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdolore magnaaliqua',
            operator: ':',
          },
          { value: '234', operator: '!:' },
        ],
        operation: 'or',
      },
    ],
    hideOperations: [true, false],
    disabled: [true, false],
  },
  {
    query: [
      {
        tokens: [
          { value: '123', operator: ':' },
          { value: '234', operator: '!:' },
          { propertyKey: 'instanceid', value: '345', operator: '=' },
        ],
        operation: 'and',
      },
    ],
    tokenLimit: [0, 2],
  },
]);

export default function () {
  return (
    <>
      <h1>Token visuals screenshot page</h1>
      <ScreenshotArea disableAnimations={true}>
        <PermutationsView
          permutations={permutations}
          render={permutation => (
            <PropertyFilter
              countText={`5 matches`}
              i18nStrings={i18nStrings}
              query={{ tokens: [], operation: 'and' }}
              onChange={() => {}}
              filteringProperties={filteringProperties}
              filteringOptions={filteringOptions}
              {...permutation}
            />
          )}
        />
      </ScreenshotArea>
    </>
  );
}
