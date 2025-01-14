// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { formatTimezoneOffset } from '../../../../../lib/components/internal/utils/date-time/format-timezone-offset';

test('formatTimezoneOffset', () => {
  for (let offset = -120; offset <= 120; offset++) {
    const formatted = formatTimezoneOffset(offset);
    const sign = Number(formatted[0] + '1');
    const hours = Number(formatted[1] + formatted[2]);
    const minutes = Number(formatted[4] + formatted[5]);
    expect(formatted).toHaveLength(6);
    expect(sign * (hours * 60 + minutes)).toBe(offset);
  }
});
