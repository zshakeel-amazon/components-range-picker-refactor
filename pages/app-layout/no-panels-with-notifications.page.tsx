// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import clsx from 'clsx';
import React from 'react';
import AppLayout from '~components/app-layout';
import Flashbar from '~components/flashbar';
import Header from '~components/header';
import ScreenshotArea from '../utils/screenshot-area';
import labels from './utils/labels';
import styles from './styles.scss';

export default function () {
  return (
    <ScreenshotArea gutters={false}>
      <AppLayout
        ariaLabels={labels}
        navigationHide={true}
        toolsHide={true}
        stickyNotifications={true}
        notifications={
          <Flashbar
            items={[
              {
                type: 'success',
                header: 'Nice notification message!',
              },
            ]}
          />
        }
        content={
          <>
            <Header variant="h1">This page contains app-layout even if you do not see it...</Header>
            <div className={clsx(styles.longContent, styles.floatingBlock)}>Some very long content</div>
          </>
        }
      />
    </ScreenshotArea>
  );
}
