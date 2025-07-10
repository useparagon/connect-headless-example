import {
  AccountType,
  ConnectInputValue,
  IntegrationConnectInput,
  paragon,
  SerializedConnectInput,
} from '@useparagon/connect';
import { Controller, useForm } from 'react-hook-form';

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
};

export function IntegrationInstallFlowForm(props: Props) {
  switch (props.installFlowStage.stage) {
    case 'accountType':
      return (
        <AccountTypePicker
          options={props.installFlowStage.options}
          onSelect={props.onSelectAccount}
        />
      );
    case 'preOptions':
      return (
        <PreOptionsForm
          integration={props.integration}
          options={props.installFlowStage.options}
          onSubmit={props.onFinishPreOptions}
          error={props.error}
        />
      );
    case 'postOptions':
      return (
        <PostOptionsForm
          integration={props.integration}
          options={props.installFlowStage.options}
          onSubmit={props.onFinishPostOptions}
          error={props.error}
        />
      );
    case 'done':
    default:
      return null;
  }
}

function AccountTypePicker(props: {
  options: AccountType[];
  onSelect: (accountId: string) => void;
}) {
  return (
    <div>
      <h2>Select an account</h2>
      <div className="flex flex-col gap-2 items-start">
        {props.options.map((option) => (
          <Button
            key={option.id}
            type="button"
            onClick={() => {
              props.onSelect(option.id);
            }}
          >
            {option.accountDescription}
          </Button>
        ))}
      </div>
    </div>
  );
}

function PreOptionsForm(props: {
  integration: string;
  options: IntegrationConnectInput[];
  onSubmit: (options: Record<string, ConnectInputValue>) => void;
  error: Error | null;
}) {
  const form = useForm<Record<string, ConnectInputValue>>();

  return (
    <div className="flex flex-col gap-4">
      {props.options.map((option) => (
        <Controller
          key={option.id}
          control={form.control}
          name={option.id}
          defaultValue={option.defaultValue}
          render={({ field }) => (
            <SerializedConnectInputPicker
              key={option.id}
              integration={props.integration}
              field={option as SerializedConnectInput}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ))}
      <Button onClick={() => form.handleSubmit(props.onSubmit)()}>Next</Button>
      <ErrorMessage error={props.error} />
    </div>
  );
}

function PostOptionsForm(props: {
  integration: string;
  options: IntegrationConnectInput[];
  onSubmit: (options: Record<string, ConnectInputValue>) => void;
  error: Error | null;
}) {
  const form = useForm<Record<string, ConnectInputValue>>();

  return (
    <div className="flex flex-col gap-4">
      {props.options.map((option) => (
        <Controller
          key={option.id}
          control={form.control}
          name={option.id}
          render={({ field }) => (
            <SerializedConnectInputPicker
              key={option.id}
              integration={props.integration}
              field={option as SerializedConnectInput}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      ))}
      <Button onClick={() => form.handleSubmit(props.onSubmit)()}>
        Finish
      </Button>
      <ErrorMessage error={props.error} />
    </div>
  );
}

function ErrorMessage(props: { error: Error | null }) {
  if (!props.error) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium">Something went wrong</p>
      <pre className="text-destructive max-w-full text-sm bg-destructive/10 p-2 rounded-md border border-destructive/20">
        {JSON.stringify(JSON.parse(props.error.message), null, 2)}
      </pre>
    </div>
  );
}
