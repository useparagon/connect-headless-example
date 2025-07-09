import { useState } from 'react';
import { ConnectInputValue, paragon, SerializedConnectInput } from '@useparagon/connect';

import { Button } from '@/components/ui/button';
import { SerializedConnectInputPicker } from '@/components/feature/serialized-connect-input-picker';

type InstallFlowStage = ReturnType<typeof paragon.installFlow.next>;

type Props = {
  integration: string;
  installFlowStage: InstallFlowStage;
  onSelectAccount: (accountId: string) => void;
  onFinishPreOptions: (preOptions: Record<string, ConnectInputValue>) => void;
  onFinishPostOptions: (postOptions: Record<string, ConnectInputValue>) => void;
  error: Error | null;
}

export function FlowForm(props: Props) {
  const [preOptions, setPreOptions] = useState<
    Record<string, ConnectInputValue>
  >({});
  const [postOptions, setPostOptions] = useState<
    Record<string, ConnectInputValue>
  >({});

  if (props.installFlowStage.stage === 'accountType') {
    return (
      <div>
        <div>
          <h2>Select an account</h2>
          <div className="flex flex-col gap-2 items-start">
            {props.installFlowStage.options.map((option) => (
              <Button
                key={option.id}
                type="button"
                onClick={() => {
                  props.onSelectAccount(option.id);
                }}
              >
                {option.accountDescription}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (props.installFlowStage.stage === 'preOptions') {
    return (
      <div className="flex flex-col gap-4">
        {props.installFlowStage.options.map((option) => (
          <SerializedConnectInputPicker
            key={option.id}
            integration={props.integration}
            field={option as SerializedConnectInput}
            value={preOptions[option.id]}
            onChange={(value) => {
              setPreOptions((current) => ({
                ...current,
                [option.id]: value,
              }));
            }}
          />
        ))}
        <Button
          onClick={() => {
            props.onFinishPreOptions(preOptions);
          }}
        >
          Next
        </Button>
        {props.error ? (
          <div className="flex flex-col gap-2">
            <p className="font-medium">Something went wrong</p>
            <pre className="text-red-500 max-w-full text-sm bg-red-50 p-2 rounded-md border border-red-200">
              {JSON.stringify(JSON.parse(props.error.message), null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    );
  }

  if (props.installFlowStage.stage === 'postOptions') {
    return (
      <div className="flex flex-col gap-4">
        {props.installFlowStage.options.map((option) => (
          <SerializedConnectInputPicker
            key={option.id}
            integration={props.integration}
            field={option as SerializedConnectInput}
            value={postOptions[option.id]}
            onChange={(value) => {
              setPostOptions((current) => ({
                ...current,
                [option.id]: value,
              }));
            }}
          />
        ))}
        <Button
          onClick={() => {
            props.onFinishPostOptions(postOptions);
          }}
        >
          Finish
        </Button>
      </div>
    );
  }

  return null;
}
