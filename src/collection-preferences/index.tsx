// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { fireNonCancelableEvent } from '../internal/events';
import { getBaseProps } from '../internal/base-component';
import InternalBox from '../box/internal';
import { ButtonProps } from '../button/interfaces';
import { InternalButton } from '../button/internal';
import InternalModal from '../modal/internal';
import InternalSpaceBetween from '../space-between/internal';
import {
  copyPreferences,
  mergePreferences,
  ModalContentLayout,
  PageSizePreference,
  WrapLinesPreference,
  CustomPreference,
} from './utils';
import VisibleContentPreference from './visible-content';
import checkControlled from '../internal/hooks/check-controlled';
import { CollectionPreferencesProps } from './interfaces';
import styles from './styles.css.js';
import { applyDisplayName } from '../internal/utils/apply-display-name';
import useBaseComponent from '../internal/hooks/use-base-component';

export { CollectionPreferencesProps };

interface ModalContentProps
  extends Pick<
    CollectionPreferencesProps,
    'preferences' | 'visibleContentPreference' | 'pageSizePreference' | 'wrapLinesPreference' | 'customPreference'
  > {
  onChange: (preferences: CollectionPreferencesProps.Preferences) => void;
}

const ModalContent = ({
  preferences = {},
  pageSizePreference,
  wrapLinesPreference,
  customPreference,
  visibleContentPreference,
  onChange,
}: ModalContentProps) => {
  if (!visibleContentPreference && !pageSizePreference && !wrapLinesPreference && customPreference) {
    return (
      <CustomPreference
        value={preferences.custom}
        customPreference={customPreference}
        onChange={custom => onChange({ custom })}
      />
    );
  }
  return (
    <ModalContentLayout
      left={
        <InternalSpaceBetween size="l">
          {pageSizePreference && (
            <PageSizePreference
              value={preferences.pageSize}
              {...pageSizePreference}
              onChange={pageSize => onChange({ pageSize })}
            />
          )}
          {wrapLinesPreference && (
            <WrapLinesPreference
              value={preferences.wrapLines}
              {...wrapLinesPreference}
              onChange={wrapLines => onChange({ wrapLines })}
            />
          )}
          {customPreference && (
            <CustomPreference
              value={preferences.custom}
              customPreference={customPreference}
              onChange={custom => onChange({ custom })}
            />
          )}
        </InternalSpaceBetween>
      }
      right={
        visibleContentPreference && (
          <VisibleContentPreference
            value={preferences.visibleContent}
            {...visibleContentPreference}
            onChange={visibleContent => onChange({ visibleContent })}
          />
        )
      }
    />
  );
};

export default function CollectionPreferences({
  title,
  confirmLabel,
  cancelLabel,
  disabled = false,
  onConfirm,
  onCancel,
  visibleContentPreference,
  pageSizePreference,
  wrapLinesPreference,
  preferences,
  customPreference,
  ...rest
}: CollectionPreferencesProps) {
  const { __internalRootRef } = useBaseComponent('CollectionPreferences');
  checkControlled('CollectioPreferences', 'preferences', preferences, 'onConfirm', onConfirm);
  const baseProps = getBaseProps(rest);
  const [modalVisible, setModalVisible] = useState(false);
  const [temporaryPreferences, setTemporaryPreferences] = useState(copyPreferences(preferences || {}));
  const triggerRef = useRef<ButtonProps.Ref>(null);
  const dialogPreviouslyOpen = useRef(false);
  useEffect(() => {
    if (!modalVisible) {
      dialogPreviouslyOpen.current && triggerRef.current && triggerRef.current.focus();
    } else {
      dialogPreviouslyOpen.current = true;
    }
  }, [modalVisible]);

  const onConfirmListener = () => {
    setModalVisible(false);
    fireNonCancelableEvent(onConfirm, temporaryPreferences);
  };

  const onCancelListener = () => {
    fireNonCancelableEvent(onCancel, {});
    setModalVisible(false);
    setTemporaryPreferences(copyPreferences(preferences || {}));
  };

  return (
    <div {...baseProps} className={clsx(baseProps.className, styles.root)} ref={__internalRootRef}>
      <InternalButton
        ref={triggerRef}
        className={styles['trigger-button']}
        disabled={disabled}
        ariaLabel={title}
        onClick={() => {
          setTemporaryPreferences(copyPreferences(preferences || {}));
          setModalVisible(true);
        }}
        variant="icon"
        iconName="settings"
        formAction="none"
      />
      {!disabled && modalVisible && (
        <InternalModal
          className={styles['modal-root']}
          visible={true}
          header={title}
          footer={
            <InternalBox float="right">
              <InternalSpaceBetween direction="horizontal" size="xs">
                <InternalButton
                  className={styles['cancel-button']}
                  variant="link"
                  formAction="none"
                  onClick={onCancelListener}
                >
                  {cancelLabel}
                </InternalButton>
                <InternalButton
                  className={styles['confirm-button']}
                  variant="primary"
                  formAction="none"
                  onClick={onConfirmListener}
                >
                  {confirmLabel}
                </InternalButton>
              </InternalSpaceBetween>
            </InternalBox>
          }
          closeAriaLabel={cancelLabel}
          size="large"
          onDismiss={onCancelListener}
        >
          <ModalContent
            preferences={temporaryPreferences}
            visibleContentPreference={visibleContentPreference}
            pageSizePreference={pageSizePreference}
            wrapLinesPreference={wrapLinesPreference}
            customPreference={customPreference}
            onChange={changedPreferences =>
              setTemporaryPreferences(mergePreferences(changedPreferences, temporaryPreferences))
            }
          />
        </InternalModal>
      )}
    </div>
  );
}

applyDisplayName(CollectionPreferences, 'CollectionPreferences');
