import {
  AccountType,
  ConnectInputValue,
  IntegrationConnectInput,
  paragon,
  SerializedConnectInput,
  SidebarInputType,
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
        />
      );
    case 'postOptions':
      return (
        <PostOptionsForm
          integration={props.integration}
          options={props.installFlowStage.options}
          onSubmit={props.onFinishPostOptions}
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
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-medium">Select an account</h2>
      <div className="flex gap-2 items-start">
        {props.options.map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="outline"
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
}) {
  const form = useForm<Record<string, ConnectInputValue>>();

  return (
    <div className="flex flex-col gap-4">
      {props.options.map((option) => {
        const serialized = option as SerializedConnectInput;
        const defaultValue =
          serialized.type === SidebarInputType.Permission
            ? serialized.requiredScopes.join(' ')
            : option.defaultValue;

        return (
          <Controller
            key={option.id}
            control={form.control}
            name={option.id}
            defaultValue={defaultValue}
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
        );
      })}
      <Button onClick={() => form.handleSubmit(props.onSubmit)()}>Next</Button>
    </div>
  );
}

function PostOptionsForm(props: {
  integration: string;
  options: IntegrationConnectInput[];
  onSubmit: (options: Record<string, ConnectInputValue>) => void;
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
    </div>
  );
}
