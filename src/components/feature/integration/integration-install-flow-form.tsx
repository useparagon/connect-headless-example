import {
  AccountType,
  ConnectInputValue,
  IntegrationConnectInput,
  paragon,
  SerializedConnectInput,
  SidebarInputType,
  InstructionStage,
  CTA,
} from '@useparagon/connect';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { SerializedConnectInputPicker } from '@/components/feature/serialized-connect-input-picker';
import Markdown from 'react-markdown';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type InstallFlowStage = ReturnType<typeof paragon.installFlow.next>;

type Props = {
  integration: string;
  installFlowStage: InstallFlowStage;
  onSelectAccount: (accountId: string) => void;
  onFinishPreOptions: (preOptions: Record<string, ConnectInputValue>) => void;
  onFinishPostOptions: (postOptions: Record<string, ConnectInputValue>) => void;
  onFinishInstruction: () => void;
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
    case 'oauth':
      return <OAuthForm />;
    case 'postOptions':
      return (
        <PostOptionsForm
          integration={props.integration}
          options={props.installFlowStage.options}
          onSubmit={props.onFinishPostOptions}
        />
      );
    case 'instruction':
      return (
        <InstructionsForm
          options={{
            content: props.installFlowStage.content,
            ctas: props.installFlowStage.ctas,
            finish: props.installFlowStage.finish,
            packageInstallUrl: props.installFlowStage.packageInstallUrl,
          }}
          onSubmit={props.onFinishInstruction}
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

function InstructionsForm(props: {
  options: Pick<
    InstructionStage,
    'content' | 'ctas' | 'finish' | 'packageInstallUrl'
  >;
  onSubmit: () => void;
}) {
  const markdownContent = useMemo(
    () => (
      <Markdown
        components={{
          h2(props) {
            return <h2 className="text-lg font-medium">{props.children}</h2>;
          },
          img(props) {
            return <MarkdownImage {...props} />;
          },
        }}
      >
        {props.options.content}
      </Markdown>
    ),
    [props.options.content],
  );

  return (
    <div className="flex flex-col gap-4">
      {markdownContent}
      <div className="flex gap-6">
        <InstructionCTAs ctas={props.options.ctas} />
      </div>
      <Button
        variant="link"
        className="w-min"
        onClick={() => {
          props.onSubmit();
        }}
      >
        {props.options.finish.label}
      </Button>
    </div>
  );
}

function InstructionCTAs(props: { ctas: CTA[] }) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  return props.ctas.map((cta) => {
    switch (cta.type) {
      case 'link':
        return (
          <Button asChild>
            <a href={cta.label} target="_blank">
              {cta.label}
            </a>
          </Button>
        );
      case 'copyButton':
        return (
          <InputGroup className="w-fit">
            <InputGroupInput placeholder={cta.label} readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Copy"
                title="Copy"
                size="icon-xs"
                onClick={() => {
                  copyToClipboard(cta.label);
                }}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        );
    }
  });
}

function MarkdownImage(props: React.ComponentProps<'img'>) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="w-full flex justify-center">
      <img
        className="max-h-96"
        {...props}
        onLoad={() => {
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div className="h-96 w-xl rounded-lg animate-pulse bg-border"></div>
      )}
    </div>
  );
}

function OAuthForm() {
  return (
    <div className="flex flex-col gap-4 items-center justify-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <div className="flex flex-col gap-2 text-center">
        <h2 className="text-lg font-medium">Connecting Your Account</h2>
        <p className="text-sm text-muted-foreground">
          A popup window will open to authenticate your account...
        </p>
      </div>
    </div>
  );
}
